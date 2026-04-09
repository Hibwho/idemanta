# Smart Swarm — Orchestration Ollama + Agents Claude via Board Fichier

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre a Ollama (local, gratuit) d'orchestrer plusieurs agents Claude specialises qui travaillent en parallele sur un projet, coordonnes via un board fichier (style Trello), avec un widget d'avancement en temps reel dans IDEManta.

**Architecture:** L'orchestrateur Ollama lit un plan, analyse les tasks, spawn les agents Claude specialises (backend, frontend, devops...), et coordonne via un fichier `board.json` partage. Chaque agent poll le board, prend une task, la fait, coche. Ollama surveille et reassigne. Zero tokens Claude gaspilles en coordination.

**Tech Stack:** Ollama (qwen3:8b), Tauri 2 (Rust), React 19, TypeScript, Zustand, fs.watch, JSON board file

---

## Comment ca marche — vue d'ensemble

```
1. User cree un projet avec une description + un plan.md
2. Ollama lit le plan.md, analyse les competences necessaires
3. Ollama genere un board.json avec les tasks + roles requis
4. IDEManta spawn les agents Claude specialises (1 par role)
5. Chaque agent Claude a un CLAUDE.md qui lui dit :
   - Son role (backend, frontend, devops...)
   - Comment lire board.json
   - Comment lock une task, bosser, cocher
6. Ollama poll board.json toutes les 30s :
   - Si une task est done → marque [x] dans plan.md
   - Si un agent est bloque → reassigne ou aide
   - Si toutes les tasks d'une phase sont done → lance la phase suivante
   - Si un agent a fini → lui assigne la prochaine task libre de son role
7. Le widget IDEManta watch board.json et affiche l'avancement en temps reel
```

---

## Format du board (board.json)

```json
{
  "project": "GaetanAcademy",
  "created_at": "2026-04-10T00:00:00Z",
  "phases": [
    {
      "name": "Phase 1 — Backend",
      "tasks": [
        {
          "id": "task-1",
          "title": "Backend FastAPI + modeles SQLAlchemy",
          "status": "done",
          "assigned_to": "backend-dev",
          "assigned_agent_id": "uuid-123",
          "started_at": "2026-04-10T10:00:00Z",
          "completed_at": "2026-04-10T10:15:00Z",
          "requires_role": "backend",
          "depends_on": [],
          "plan_ref": "Task 1"
        },
        {
          "id": "task-2",
          "title": "Seed data YAML",
          "status": "in_progress",
          "assigned_to": "backend-dev",
          "assigned_agent_id": "uuid-123",
          "started_at": "2026-04-10T10:16:00Z",
          "completed_at": null,
          "requires_role": "backend",
          "depends_on": ["task-1"],
          "plan_ref": "Task 2"
        },
        {
          "id": "task-6",
          "title": "Frontend setup + Dashboard",
          "status": "in_progress",
          "assigned_to": "frontend-dev",
          "assigned_agent_id": "uuid-456",
          "started_at": "2026-04-10T10:00:00Z",
          "completed_at": null,
          "requires_role": "frontend",
          "depends_on": [],
          "plan_ref": "Task 6"
        }
      ]
    }
  ],
  "agents": [
    {
      "id": "uuid-123",
      "name": "Backend Dev",
      "role": "backend",
      "status": "working",
      "current_task": "task-2"
    },
    {
      "id": "uuid-456",
      "name": "Frontend Dev",
      "role": "frontend",
      "status": "working",
      "current_task": "task-6"
    }
  ]
}
```

### Statuts possibles pour une task
- `pending` — pas encore assignee
- `ready` — dependances satisfaites, peut etre prise
- `in_progress` — un agent travaille dessus
- `done` — terminee
- `blocked` — l'agent a signale un probleme

### Statuts possibles pour un agent
- `idle` — attend une task
- `working` — en train de bosser
- `blocked` — signale un probleme
- `stopped` — arrete

---

## Structure des fichiers

```
~/idemanta/src/
├── lib/
│   ├── ruflo.ts                      # MODIFIER — ajouter analyzeplan + spawnSmartSwarm
│   └── board.ts                      # NOUVEAU — lecture/ecriture board.json
├── stores/
│   ├── projectStore.ts               # MODIFIER — ajouter boardPath, boardData
│   └── agentStore.ts                 # Inchange
├── components/
│   ├── project/
│   │   ├── ProjectPanel.tsx          # MODIFIER — option "Smart Swarm" a la creation
│   │   └── ProjectBoard.tsx          # NOUVEAU — widget d'avancement temps reel
│   └── agents/
│       └── AgentPanel.tsx            # Deja modifie (placeholder agents)
├── src-tauri/src/
│   └── lib.rs                        # MODIFIER — ajouter watch_board_file, spawn_orchestrator
```

---

## Tasks

### Task 1: Board file format — lecture/ecriture

**Files:**
- Create: `~/idemanta/src/lib/board.ts`

- [ ] **Step 1: Creer board.ts**

```typescript
// ~/idemanta/src/lib/board.ts
export interface BoardTask {
  id: string;
  title: string;
  status: "pending" | "ready" | "in_progress" | "done" | "blocked";
  assigned_to: string | null;
  assigned_agent_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  requires_role: string;
  depends_on: string[];
  plan_ref: string;
}

export interface BoardAgent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "blocked" | "stopped";
  current_task: string | null;
}

export interface BoardPhase {
  name: string;
  tasks: BoardTask[];
}

export interface Board {
  project: string;
  created_at: string;
  phases: BoardPhase[];
  agents: BoardAgent[];
}

export function computeBoardStats(board: Board) {
  const allTasks = board.phases.flatMap((p) => p.tasks);
  const done = allTasks.filter((t) => t.status === "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const blocked = allTasks.filter((t) => t.status === "blocked").length;
  const total = allTasks.length;
  return {
    done,
    inProgress,
    blocked,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function getNextTaskForRole(board: Board, role: string): BoardTask | null {
  const allTasks = board.phases.flatMap((p) => p.tasks);
  const doneTasks = new Set(allTasks.filter((t) => t.status === "done").map((t) => t.id));

  for (const phase of board.phases) {
    for (const task of phase.tasks) {
      if (task.status !== "pending" && task.status !== "ready") continue;
      if (task.requires_role !== role) continue;
      const depsOk = task.depends_on.every((dep) => doneTasks.has(dep));
      if (depsOk) return task;
    }
  }
  return null;
}

export function generateInitialBoard(
  projectName: string,
  tasks: Array<{ id: string; title: string; role: string; depends_on: string[]; plan_ref: string }>,
  agents: Array<{ id: string; name: string; role: string }>,
): Board {
  // Group tasks into phases based on dependencies
  const board: Board = {
    project: projectName,
    created_at: new Date().toISOString(),
    phases: [
      {
        name: "All Tasks",
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.depends_on.length === 0 ? "ready" as const : "pending" as const,
          assigned_to: null,
          assigned_agent_id: null,
          started_at: null,
          completed_at: null,
          requires_role: t.role,
          depends_on: t.depends_on,
          plan_ref: t.plan_ref,
        })),
      },
    ],
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: "idle" as const,
      current_task: null,
    })),
  };
  return board;
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/idemanta
git add src/lib/board.ts
git commit -m "feat: add board file format for swarm task coordination"
```

---

### Task 2: Ollama plan analyzer — lire un plan.md et generer le board

**Files:**
- Modify: `~/idemanta/src/lib/ruflo.ts` — ajouter `analyzePlan()`

- [ ] **Step 1: Ajouter analyzePlan a ruflo.ts**

Ajouter a la fin de `ruflo.ts` :

```typescript
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
- Return ONLY valid JSON array, no markdown, no explanation.

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
 * Ask Ollama which specialized agents to spawn based on the tasks.
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
```

- [ ] **Step 2: Commit**

```bash
cd ~/idemanta
git add src/lib/ruflo.ts
git commit -m "feat: add Ollama plan analyzer and smart agent derivation"
```

---

### Task 3: Rust backend — board file watcher + orchestrator loop

**Files:**
- Modify: `~/idemanta/src-tauri/src/lib.rs` — ajouter `watch_board`, `read_board`, `write_board`

- [ ] **Step 1: Ajouter les commandes Tauri pour le board**

Ajouter dans `lib.rs` avant le `pub fn run()` :

```rust
#[tauri::command]
async fn read_board(board_path: String) -> Result<String, String> {
    std::fs::read_to_string(&board_path)
        .map_err(|e| format!("Failed to read board: {}", e))
}

#[tauri::command]
async fn write_board(board_path: String, content: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = std::path::Path::new(&board_path).parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create board directory: {}", e))?;
    }
    std::fs::write(&board_path, &content)
        .map_err(|e| format!("Failed to write board: {}", e))
}

#[tauri::command]
async fn watch_board(app: tauri::AppHandle, board_path: String) -> Result<(), String> {
    use tokio::time::{interval, Duration};

    let path = board_path.clone();
    tokio::spawn(async move {
        let mut last_modified = std::fs::metadata(&path)
            .and_then(|m| m.modified())
            .ok();

        let mut ticker = interval(Duration::from_secs(2));
        loop {
            ticker.tick().await;

            let current_modified = std::fs::metadata(&path)
                .and_then(|m| m.modified())
                .ok();

            if current_modified != last_modified {
                last_modified = current_modified;

                if let Ok(content) = std::fs::read_to_string(&path) {
                    let event = AgentEvent {
                        agent_id: "board".to_string(),
                        event_type: "board_updated".to_string(),
                        data: serde_json::from_str(&content)
                            .unwrap_or(serde_json::json!({})),
                    };
                    let _ = app.emit("agent-event", &event);
                }
            }
        }
    });

    Ok(())
}
```

- [ ] **Step 2: Enregistrer les commandes dans le handler**

Ajouter `read_board`, `write_board`, `watch_board` a la liste `.invoke_handler(tauri::generate_handler![...])`.

- [ ] **Step 3: Commit**

```bash
cd ~/idemanta
git add src-tauri/src/lib.rs
git commit -m "feat: add board file read/write/watch Tauri commands"
```

---

### Task 4: Orchestrateur Ollama — le cerveau qui dispatch

**Files:**
- Create: `~/idemanta/src/lib/orchestrator.ts`

- [ ] **Step 1: Creer orchestrator.ts**

```typescript
// ~/idemanta/src/lib/orchestrator.ts
import { invoke } from "@tauri-apps/api/core";
import { Board, BoardTask, getNextTaskForRole } from "./board";

interface OrchestratorConfig {
  boardPath: string;
  planContent: string;
  ollamaUrl: string;
  ollamaModel: string;
  pollIntervalMs: number;
}

/**
 * The Ollama orchestrator reads board.json, assigns tasks to idle agents,
 * and monitors progress. It does NOT code — it coordinates.
 */
export class SwarmOrchestrator {
  private config: OrchestratorConfig;
  private running = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  async start() {
    this.running = true;
    this.intervalId = setInterval(() => this.tick(), this.config.pollIntervalMs);
    // First tick immediately
    await this.tick();
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick() {
    if (!this.running) return;

    try {
      const boardStr = await invoke<string>("read_board", { boardPath: this.config.boardPath });
      const board: Board = JSON.parse(boardStr);

      // Update task statuses: pending → ready if deps are met
      this.updateReadyTasks(board);

      // Find idle agents and assign them tasks
      for (const agent of board.agents) {
        if (agent.status !== "idle") continue;

        const nextTask = getNextTaskForRole(board, agent.role);
        if (!nextTask) continue;

        // Assign the task
        nextTask.status = "in_progress";
        nextTask.assigned_to = agent.name;
        nextTask.assigned_agent_id = agent.id;
        nextTask.started_at = new Date().toISOString();
        agent.status = "working";
        agent.current_task = nextTask.id;

        // Tell the Claude agent to work on this task
        const instruction = await this.generateTaskInstruction(nextTask);
        try {
          await invoke("send_to_agent", {
            agentId: agent.id,
            message: instruction,
            autoApprove: true,
          });
        } catch (e) {
          console.error(`Failed to send task to ${agent.name}:`, e);
          // Revert assignment
          nextTask.status = "ready";
          nextTask.assigned_to = null;
          nextTask.assigned_agent_id = null;
          nextTask.started_at = null;
          agent.status = "idle";
          agent.current_task = null;
        }
      }

      // Write updated board
      await invoke("write_board", {
        boardPath: this.config.boardPath,
        content: JSON.stringify(board, null, 2),
      });
    } catch (e) {
      console.error("Orchestrator tick error:", e);
    }
  }

  private updateReadyTasks(board: Board) {
    const doneTasks = new Set(
      board.phases.flatMap((p) => p.tasks)
        .filter((t) => t.status === "done")
        .map((t) => t.id)
    );

    for (const phase of board.phases) {
      for (const task of phase.tasks) {
        if (task.status !== "pending") continue;
        const depsOk = task.depends_on.every((dep) => doneTasks.has(dep));
        if (depsOk) {
          task.status = "ready";
        }
      }
    }
  }

  private async generateTaskInstruction(task: BoardTask): Promise<string> {
    // Ask Ollama to generate a clear instruction for the Claude agent
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.ollamaModel,
          messages: [
            {
              role: "system",
              content: `You are a project manager. Generate a clear, concise instruction for a developer agent.
The instruction must include:
1. What to do (from the plan reference)
2. Which files to create or modify
3. To update board.json when done (set their task status to "done")

Keep it under 200 words. Be direct and specific.`,
            },
            {
              role: "user",
              content: `Task: ${task.title}\nPlan reference: ${task.plan_ref}\nRole: ${task.requires_role}\n\nThe full plan is in the project's plan.md file. The agent should read it for details on ${task.plan_ref}.`,
            },
          ],
          stream: false,
        }),
      });

      const data = await response.json();
      const instruction = data.message?.content || "";

      return `${instruction}

IMPORTANT: When you finish this task:
1. Read the file .plan/board.json
2. Find task "${task.id}" and set its status to "done" and completed_at to current ISO timestamp
3. Find your agent entry and set status to "idle" and current_task to null
4. Write the updated board.json back
5. Commit your work with a clear commit message`;
    } catch {
      // Fallback without Ollama
      return `Execute ${task.plan_ref}: ${task.title}

Read the plan.md file in .plan/ for full details on this task.
When done, update .plan/board.json: set task "${task.id}" status to "done" and your agent status to "idle".
Commit your work.`;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/idemanta
git add src/lib/orchestrator.ts
git commit -m "feat: add SwarmOrchestrator — Ollama-driven task dispatch to Claude agents"
```

---

### Task 5: ProjectBoard widget — affichage temps reel

**Files:**
- Create: `~/idemanta/src/components/project/ProjectBoard.tsx`

- [ ] **Step 1: Creer ProjectBoard.tsx**

```tsx
// ~/idemanta/src/components/project/ProjectBoard.tsx
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
  CheckCircle, Circle, Loader2, AlertTriangle,
  ChevronDown, ChevronRight,
} from "lucide-react";
import type { Board } from "../../lib/board";
import { computeBoardStats } from "../../lib/board";

interface ProjectBoardProps {
  boardPath: string;
}

const STATUS_ICONS = {
  pending: <Circle size={12} className="text-[var(--text-muted)]" />,
  ready: <Circle size={12} className="text-[var(--blue)]" />,
  in_progress: <Loader2 size={12} className="text-[var(--yellow)] animate-spin" />,
  done: <CheckCircle size={12} className="text-[var(--green)]" />,
  blocked: <AlertTriangle size={12} className="text-[var(--red)]" />,
};

export function ProjectBoard({ boardPath }: ProjectBoardProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Initial load
  useEffect(() => {
    invoke<string>("read_board", { boardPath })
      .then((content) => setBoard(JSON.parse(content)))
      .catch(() => {});

    // Watch for changes
    invoke("watch_board", { boardPath }).catch(() => {});
  }, [boardPath]);

  // Listen for board updates
  useEffect(() => {
    const unlisten = listen<{ agent_id: string; event_type: string; data: Board }>(
      "agent-event",
      (event) => {
        if (event.payload.event_type === "board_updated") {
          setBoard(event.payload.data as Board);
        }
      }
    );
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  if (!board) {
    return (
      <div className="p-3 text-[11px] text-[var(--text-muted)]">
        No board found. Create a Smart Swarm project to get started.
      </div>
    );
  }

  const stats = computeBoardStats(board);
  const allTasks = board.phases.flatMap((p) => p.tasks);

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      {/* Header with progress bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)]/60 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        <span className="text-[11px] font-semibold flex-1">{board.project}</span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {stats.done}/{stats.total}
        </span>
        <span className="text-[10px] font-bold text-[var(--green)]">
          {stats.percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--green)] transition-all duration-500"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
          {/* Tasks */}
          {allTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-primary)]/40"
            >
              {STATUS_ICONS[task.status]}
              <span
                className={`text-[11px] flex-1 ${
                  task.status === "done"
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {task.title}
              </span>
              {task.assigned_to && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    task.status === "in_progress"
                      ? "bg-[var(--yellow-dim)] text-[var(--yellow)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                  }`}
                >
                  {task.assigned_to}
                </span>
              )}
            </div>
          ))}

          {/* Agent status */}
          <div className="border-t border-[var(--border-subtle)] mt-2 pt-2">
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1 px-2">
              Agents
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {board.agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    agent.status === "working"
                      ? "bg-[var(--green-dim)] text-[var(--green)]"
                      : agent.status === "blocked"
                      ? "bg-[var(--red-dim)] text-[var(--red)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                  }`}
                >
                  {agent.status === "working" && (
                    <Loader2 size={8} className="animate-spin" />
                  )}
                  {agent.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/idemanta
git add src/components/project/ProjectBoard.tsx
git commit -m "feat: add ProjectBoard widget with real-time progress display"
```

---

### Task 6: Integration ProjectPanel — mode Smart Swarm

**Files:**
- Modify: `~/idemanta/src/components/project/ProjectPanel.tsx`
- Modify: `~/idemanta/src/stores/projectStore.ts`

- [ ] **Step 1: Ajouter boardPath au Project store**

Dans `projectStore.ts`, ajouter au type `Project` :

```typescript
export interface Project {
  id: string;
  name: string;
  description: string;
  workingDir: string;
  status: "idle" | "running" | "paused";
  agents: ProjectAgent[];
  orchestratorId: string | null;
  memoryNamespace: string;
  createdAt: number;
  boardPath: string | null;        // AJOUT
  planPath: string | null;          // AJOUT
  swarmMode: boolean;               // AJOUT — true = Smart Swarm, false = legacy
}
```

- [ ] **Step 2: Modifier ProjectPanel pour le mode Smart Swarm**

Dans `ProjectPanel.tsx`, modifier `handleCreate` pour ajouter une option Smart Swarm :

Ajouter un state :
```typescript
const [swarmMode, setSwarmMode] = useState(false);
const [planPath, setPlanPath] = useState("");
```

Ajouter dans le formulaire (avant le bouton Create) :
```tsx
{/* Smart Swarm toggle */}
<div className="flex items-center gap-2 mb-2">
  <button
    onClick={() => setSwarmMode(!swarmMode)}
    className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md cursor-pointer transition-all border ${
      swarmMode
        ? "bg-[var(--green-dim)] border-[var(--green)]/40 text-[var(--green)]"
        : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)]"
    }`}
  >
    <Cpu size={12} />
    Smart Swarm (Ollama)
  </button>
</div>

{swarmMode && (
  <input
    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
    placeholder="Path to plan.md (e.g. docs/plans/my-plan.md)"
    value={planPath}
    onChange={(e) => setPlanPath(e.target.value)}
  />
)}
```

Modifier `handleCreate` pour le mode swarm :

```typescript
const handleCreate = async () => {
  if (!name.trim() || !description.trim() || isCreating) return;
  setIsCreating(true);

  const id = crypto.randomUUID();
  const memoryNamespace = `project-${name.toLowerCase().replace(/\s+/g, "-")}`;
  const projectDir = workDir || projectPath;
  const boardDir = `${projectDir}/.plan`;
  const boardFilePath = `${boardDir}/board.json`;

  if (swarmMode && planPath) {
    // === SMART SWARM MODE ===
    // 1. Read plan
    const fullPlanPath = planPath.startsWith("/") ? planPath : `${projectDir}/${planPath}`;
    let planContent: string;
    try {
      planContent = await invoke<string>("read_board", { boardPath: fullPlanPath });
    } catch {
      console.error("Cannot read plan file");
      setIsCreating(false);
      return;
    }

    // 2. Ask Ollama to analyze the plan
    const tasks = await analyzePlan(planContent, ollamaUrl, ollamaModel);
    if (tasks.length === 0) {
      console.error("Ollama returned no tasks");
      setIsCreating(false);
      return;
    }

    // 3. Derive agents from tasks
    const agentSpecs = deriveAgentsFromTasks(tasks);

    // 4. Spawn Claude agents
    const spawnedAgents: Array<{ id: string; name: string; role: string }> = [];
    const project: Project = {
      id, name, description,
      workingDir: projectDir,
      status: "running",
      agents: [],
      orchestratorId: null,
      memoryNamespace,
      createdAt: Date.now(),
      boardPath: boardFilePath,
      planPath: fullPlanPath,
      swarmMode: true,
    };
    addProject(project);
    setActiveProject(id);

    for (const spec of agentSpecs) {
      try {
        const systemPrompt = `You are ${spec.name}, specialized in ${spec.speciality}.
Project: "${name}" — ${description}

YOUR WORKFLOW:
1. Wait for task instructions (they will reference the plan)
2. Read the plan file for full task details
3. Implement the task following the plan exactly
4. When done, update .plan/board.json:
   - Set your task status to "done" and completed_at to current timestamp
   - Set your agent status to "idle" and current_task to null
5. Commit your work
6. Wait for the next task

The plan is at: ${fullPlanPath}
The board is at: ${boardFilePath}`;

        const info = await invoke<{
          id: string; name: string; role: string; status: string; working_dir: string;
        }>("spawn_agent", {
          name: spec.name,
          role: spec.role,
          workingDir: projectDir,
          initialPrompt: systemPrompt,
          autoApprove,
        });

        addAgent({
          id: info.id, name: spec.name,
          role: spec.speciality,
          status: "running", workingDir: info.working_dir,
          messages: [], tokensUsed: 0, filesModified: [],
          backend: "claude",
        });

        const { addAgentToProject } = useProjectStore.getState();
        addAgentToProject(id, { agentId: info.id, name: spec.name, role: spec.role });
        spawnedAgents.push({ id: info.id, name: spec.name, role: spec.role });
      } catch (e) {
        console.error(`Failed to spawn ${spec.name}:`, e);
      }
    }

    // 5. Generate initial board
    const board = generateInitialBoard(name, tasks, spawnedAgents);
    await invoke("write_board", {
      boardPath: boardFilePath,
      content: JSON.stringify(board, null, 2),
    });

    // 6. Start the Ollama orchestrator
    const orchestrator = new SwarmOrchestrator({
      boardPath: boardFilePath,
      planContent,
      ollamaUrl,
      ollamaModel,
      pollIntervalMs: 30000,
    });
    orchestrator.start();

    // 7. Start board watcher for UI updates
    await invoke("watch_board", { boardPath: boardFilePath });

  } else {
    // === LEGACY MODE (existing behavior) ===
    const team = planProjectTeam(description);
    // ... (existing code unchanged)
  }

  setShowNew(false);
  setName("");
  setDescription("");
  setPlanPath("");
  setIsCreating(false);
  if (onSwitchToAgents) onSwitchToAgents();
};
```

- [ ] **Step 3: Ajouter les imports manquants dans ProjectPanel.tsx**

```typescript
import { planProjectTeam, initProjectMemory, routeModel, analyzePlan, deriveAgentsFromTasks } from "../../lib/ruflo";
import { generateInitialBoard } from "../../lib/board";
import { SwarmOrchestrator } from "../../lib/orchestrator";
import { Cpu } from "lucide-react";  // ajouter Cpu aux imports existants
```

- [ ] **Step 4: Ajouter le ProjectBoard widget dans le panel projet**

Dans `ProjectPanel.tsx`, dans le rendu de chaque projet (la div map), ajouter le widget board :

```tsx
// Apres les actions (Pause/Resume/Delete), avant la fermeture du div projet
{project.boardPath && (
  <div className="mt-2">
    <ProjectBoard boardPath={project.boardPath} />
  </div>
)}
```

Et ajouter l'import :
```typescript
import { ProjectBoard } from "./ProjectBoard";
```

- [ ] **Step 5: Commit**

```bash
cd ~/idemanta
git add src/stores/projectStore.ts src/components/project/ProjectPanel.tsx
git commit -m "feat: add Smart Swarm mode — Ollama orchestrates Claude agents via board file"
```

---

### Task 7: Agent CLAUDE.md generator — instructions automatiques

**Files:**
- Create: `~/idemanta/src/lib/agent-instructions.ts`

- [ ] **Step 1: Creer agent-instructions.ts**

Quand un agent Claude est spawne dans un projet Smart Swarm, on genere un `CLAUDE.md` dans le working directory qui lui explique comment lire/ecrire le board.

```typescript
// ~/idemanta/src/lib/agent-instructions.ts

export function generateAgentClaudeMd(config: {
  agentName: string;
  agentRole: string;
  speciality: string;
  projectName: string;
  boardPath: string;
  planPath: string;
}): string {
  return `# ${config.projectName} — Agent Instructions

## Your Identity
- **Name:** ${config.agentName}
- **Role:** ${config.agentRole}
- **Speciality:** ${config.speciality}

## Workflow

You are part of a multi-agent team. An orchestrator assigns you tasks via the board file.

### Board File: \`${config.boardPath}\`

The board tracks all tasks and their status. When you receive a task instruction:

1. **Read the plan** at \`${config.planPath}\` for full task details
2. **Implement the task** following the plan exactly — files to create, code to write, tests to run
3. **Test your work** before marking it done
4. **Update the board** when finished:

\`\`\`python
import json
from pathlib import Path

board_path = Path("${config.boardPath}")
board = json.loads(board_path.read_text())

# Find your task and mark it done
for phase in board["phases"]:
    for task in phase["tasks"]:
        if task["id"] == "YOUR_TASK_ID":
            task["status"] = "done"
            task["completed_at"] = "ISO_TIMESTAMP"

# Find your agent entry and set to idle
for agent in board["agents"]:
    if agent["name"] == "${config.agentName}":
        agent["status"] = "idle"
        agent["current_task"] = None

board_path.write_text(json.dumps(board, indent=2))
\`\`\`

5. **Commit your work** with a clear message referencing the task

### Rules
- Only work on tasks assigned to you
- Do NOT modify files outside your task's scope
- Do NOT communicate with other agents — use the board only
- If blocked, update your task status to "blocked" in board.json
- Stay focused on your speciality: ${config.speciality}
`;
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/idemanta
git add src/lib/agent-instructions.ts
git commit -m "feat: add agent CLAUDE.md generator for Smart Swarm instructions"
```

---

## Recapitulatif

| Task | Description | Effort |
|------|-------------|--------|
| 1 | Board file format (board.ts) | Petit |
| 2 | Ollama plan analyzer (ruflo.ts) | Moyen |
| 3 | Rust board watcher (lib.rs) | Moyen |
| 4 | Orchestrateur Ollama (orchestrator.ts) | Gros — le coeur |
| 5 | ProjectBoard widget (UI) | Moyen |
| 6 | Integration ProjectPanel + Smart Swarm mode | Gros — assemblage |
| 7 | Agent CLAUDE.md generator | Petit |

## Resultat final

Quand Gaetan cree un projet Smart Swarm dans IDEManta :

1. Il entre le nom, la description, et le chemin du plan.md
2. Ollama (local, gratuit) analyse le plan et detecte les roles necessaires
3. IDEManta spawn les agents Claude specialises (Backend Dev, Frontend Dev, DevOps...)
4. Chaque agent apparait dans le panel avec son role
5. L'orchestrateur Ollama assigne les tasks aux agents via board.json
6. Les agents bossent en parallele, chacun sur ses tasks
7. Le widget ProjectBoard affiche la progression en temps reel
8. Quand un agent finit, Ollama lui assigne la prochaine task
9. Zero tokens Claude gaspilles en coordination — tout passe par le fichier

C'est le Trello AI-native.
