import { invoke } from "@tauri-apps/api/core";
import type { Board, BoardTask } from "./board";
import { getNextTaskForRole } from "./board";

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

      this.updateReadyTasks(board);

      for (const agent of board.agents) {
        if (agent.status !== "idle") continue;

        const nextTask = getNextTaskForRole(board, agent.role);
        if (!nextTask) continue;

        nextTask.status = "in_progress";
        nextTask.assigned_to = agent.name;
        nextTask.assigned_agent_id = agent.id;
        nextTask.started_at = new Date().toISOString();
        agent.status = "working";
        agent.current_task = nextTask.id;

        const instruction = await this.generateTaskInstruction(nextTask);
        try {
          await invoke("send_to_agent", {
            agentId: agent.id,
            message: instruction,
            autoApprove: true,
          });
        } catch (e) {
          console.error(`Failed to send task to ${agent.name}:`, e);
          nextTask.status = "ready";
          nextTask.assigned_to = null;
          nextTask.assigned_agent_id = null;
          nextTask.started_at = null;
          agent.status = "idle";
          agent.current_task = null;
        }
      }

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
      return `Execute ${task.plan_ref}: ${task.title}

Read the plan.md file in .plan/ for full details on this task.
When done, update .plan/board.json: set task "${task.id}" status to "done" and your agent status to "idle".
Commit your work.`;
    }
  }
}
