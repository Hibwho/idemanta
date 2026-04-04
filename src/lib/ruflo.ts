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
