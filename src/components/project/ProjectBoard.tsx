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

  useEffect(() => {
    invoke<string>("read_board", { boardPath })
      .then((content) => setBoard(JSON.parse(content)))
      .catch(() => {});

    invoke("watch_board", { boardPath }).catch(() => {});
  }, [boardPath]);

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

      <div className="h-1 bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--green)] transition-all duration-500"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
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
