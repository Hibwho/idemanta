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
  return {
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
}
