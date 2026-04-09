import { invoke } from "@tauri-apps/api/core";

/**
 * Ruflo integration layer.
 * Calls ruflo CLI via Tauri shell commands for:
 * - Model routing (pick cheap vs expensive model per task)
 * - Swarm orchestration (spawn team of agents for a project)
 * - Memory management (per-project namespaces)
 */

export interface RufloSwarmConfig {
  projectName: string;
  description: string;
  workingDir: string;
  memoryNamespace: string;
}

export interface SwarmAgent {
  name: string;
  role: string;
  speciality: string;
}

/**
 * Initialize a Ruflo memory namespace for a project
 */
export async function initProjectMemory(namespace: string): Promise<void> {
  await invoke("run_ruflo_command", {
    args: ["memory", "store", "--key", `project-init`, "--value", `Project namespace initialized`, "--namespace", namespace],
  });
}

/**
 * Store a fact in project memory
 */
export async function storeProjectMemory(namespace: string, key: string, value: string): Promise<void> {
  await invoke("run_ruflo_command", {
    args: ["memory", "store", "--key", key, "--value", value, "--namespace", namespace],
  });
}

/**
 * Search project memory
 */
export async function searchProjectMemory(namespace: string, query: string): Promise<string> {
  return await invoke("run_ruflo_command", {
    args: ["memory", "search", "--query", query, "--namespace", namespace],
  });
}

/**
 * Determine which model tier to use based on task complexity.
 * Uses ruflo's routing system to classify the task.
 *
 * Tier 1: Simple tasks (rename, format, small edits) → cheap/local model
 * Tier 2: Medium tasks (implement feature, debug) → balanced model
 * Tier 3: Complex tasks (architecture, security audit) → best model
 */
export function routeModel(taskDescription: string): { tier: number; reason: string } {
  const lower = taskDescription.toLowerCase();

  // Tier 1 indicators: simple, mechanical tasks
  const tier1Keywords = ["rename", "format", "typo", "import", "comment", "log", "print", "variable name"];
  if (tier1Keywords.some((k) => lower.includes(k))) {
    return { tier: 1, reason: "Simple mechanical task — using lightweight model" };
  }

  // Tier 3 indicators: complex reasoning tasks
  const tier3Keywords = [
    "architect", "design", "security", "audit", "refactor entire",
    "migrate", "optimize performance", "system design", "scale",
    "review all", "analyze codebase",
  ];
  if (tier3Keywords.some((k) => lower.includes(k))) {
    return { tier: 3, reason: "Complex reasoning task — using best model" };
  }

  // Default: Tier 2
  return { tier: 2, reason: "Standard development task — using balanced model" };
}

/**
 * Generate a team of agents for a project based on its description.
 * This is a heuristic — Ruflo's swarm can refine later.
 */
export function planProjectTeam(description: string): SwarmAgent[] {
  const lower = description.toLowerCase();
  const team: SwarmAgent[] = [];

  // Always add an orchestrator
  team.push({
    name: "Lead",
    role: "orchestrator",
    speciality: "Project orchestration, task delegation, progress tracking, and team coordination",
  });

  // Detect what kind of project this is and add relevant agents
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("react") || lower.includes("web")) {
    team.push({
      name: "Frontend Dev",
      role: "frontend",
      speciality: "Frontend development with React, TypeScript, CSS, UI/UX implementation",
    });
  }

  if (lower.includes("backend") || lower.includes("api") || lower.includes("server") || lower.includes("database")) {
    team.push({
      name: "Backend Dev",
      role: "backend",
      speciality: "Backend development, API design, database schema, server architecture",
    });
  }

  if (lower.includes("rust") || lower.includes("tauri") || lower.includes("system")) {
    team.push({
      name: "Systems Dev",
      role: "systems",
      speciality: "Systems programming with Rust, performance optimization, low-level code",
    });
  }

  if (lower.includes("test") || lower.includes("quality") || lower.includes("qa")) {
    team.push({
      name: "QA",
      role: "testing",
      speciality: "Testing strategy, test writing, quality assurance, bug detection",
    });
  }

  if (lower.includes("security") || lower.includes("auth") || lower.includes("crypto")) {
    team.push({
      name: "Security",
      role: "security",
      speciality: "Security auditing, vulnerability detection, authentication, encryption",
    });
  }

  if (lower.includes("devops") || lower.includes("deploy") || lower.includes("docker") || lower.includes("ci")) {
    team.push({
      name: "DevOps",
      role: "devops",
      speciality: "CI/CD pipelines, Docker, deployment, infrastructure automation",
    });
  }

  // If no specific roles detected, add generic fullstack
  if (team.length === 1) {
    team.push({
      name: "Developer",
      role: "fullstack",
      speciality: "Full-stack development, problem solving, code implementation",
    });
    team.push({
      name: "Reviewer",
      role: "reviewer",
      speciality: "Code review, best practices, architecture feedback",
    });
  }

  return team;
}

/**
 * Ask Ollama to analyze a plan.md and extract structured tasks with roles.
 * Returns a structured list of tasks ready for board.json.
 */
export async function analyzePlan(
  planContent: string,
  ollamaUrl: string,
  ollamaModel: string,
): Promise<Array<{ id: string; title: string; role: string; depends_on: string[]; plan_ref: string }>> {
  const systemPrompt = `You are a project manager AI. Analyze this implementation plan and extract tasks.

For each task, determine:
- id: "task-N" format
- title: short description
- role: one of "backend", "frontend", "devops", "qa", "fullstack"
- depends_on: list of task IDs this task depends on
- plan_ref: "Task N" reference from the plan

Rules:
- Frontend tasks can start in parallel with backend if they don't need the API
- DevOps tasks (Docker, Compose) depend on the code being written
- QA/review tasks depend on implementation being done
- Return ONLY a valid JSON array, no markdown, no explanation.

Example output:
[{"id":"task-1","title":"Backend FastAPI setup","role":"backend","depends_on":[],"plan_ref":"Task 1"}]`;

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: planContent },
      ],
      stream: false,
      format: "json",
    }),
  });

  const data = await response.json();
  const content = data.message?.content || "[]";

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error("Ollama returned invalid JSON:", content);
    return [];
  }
}

/**
 * Derive which specialized agents to spawn based on the roles found in tasks.
 */
export function deriveAgentsFromTasks(
  tasks: Array<{ role: string }>,
): SwarmAgent[] {
  const roles = new Set(tasks.map((t) => t.role));
  const agents: SwarmAgent[] = [];

  const roleConfig: Record<string, { name: string; speciality: string }> = {
    backend: {
      name: "Backend Dev",
      speciality: "Python, FastAPI, SQLAlchemy, database design, API development, tests",
    },
    frontend: {
      name: "Frontend Dev",
      speciality: "React, TypeScript, Tailwind CSS, UI components, routing, state management",
    },
    devops: {
      name: "DevOps",
      speciality: "Docker, Docker Compose, Makefiles, CI/CD, infrastructure, deployment",
    },
    qa: {
      name: "QA",
      speciality: "Testing, code review, quality assurance, edge cases, security review",
    },
    fullstack: {
      name: "Fullstack Dev",
      speciality: "Full-stack development, both frontend and backend, integration",
    },
  };

  for (const role of roles) {
    const config = roleConfig[role] || { name: `${role} Dev`, speciality: role };
    agents.push({
      name: config.name,
      role,
      speciality: config.speciality,
    });
  }

  return agents;
}
