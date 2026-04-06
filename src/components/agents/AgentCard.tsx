import { Agent, useAgentStore } from "../../stores/agentStore";
import { invoke } from "@tauri-apps/api/core";
import { Square, Bot, Loader2, Cloud, Cpu } from "lucide-react";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  starting: { color: "var(--yellow)", bg: "var(--yellow-dim)", label: "Starting" },
  running:  { color: "var(--green)",  bg: "var(--green-dim)",  label: "Running" },
  waiting:  { color: "var(--blue)",   bg: "var(--blue-dim)",   label: "Ready" },
  stopped:  { color: "var(--text-muted)", bg: "var(--bg-tertiary)", label: "Stopped" },
  error:    { color: "var(--red)",    bg: "var(--red-dim)",    label: "Error" },
};

export function AgentCard({ agent }: { agent: Agent }) {
  const { selectedAgentId, selectAgent, updateAgent } = useAgentStore();
  const isSelected = selectedAgentId === agent.id;
  const lastMessage = [...agent.messages].reverse().find((m) => m.type !== "user");
  const status = statusConfig[agent.status] || statusConfig.stopped;

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("stop_agent", { agentId: agent.id });
      updateAgent(agent.id, { status: "stopped" });
    } catch (err) {
      console.error("Failed to stop:", err);
    }
  };

  return (
    <div
      className={`mx-2 mb-1 p-2.5 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "bg-[var(--accent-glow)] border border-[var(--border-active)] glow-accent"
          : "bg-[var(--bg-elevated)]/50 border border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-active)]/30"
      }`}
      onClick={() => selectAgent(agent.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative"
            style={{ backgroundColor: status.bg }}
          >
            <Bot size={15} style={{ color: status.color }} />
            {agent.status === "running" && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--green)] border-2 border-[var(--bg-secondary)]">
                <div className="w-full h-full rounded-full bg-[var(--green)] animate-ping opacity-75" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium truncate">{agent.name}</div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <span className="truncate max-w-[120px]">{agent.role}</span>
              {agent.backend === "ollama" ? (
                <span className="flex items-center gap-0.5 px-1 py-0 rounded bg-[var(--green-dim)] text-[var(--green)] text-[8px] shrink-0">
                  <Cpu size={7} /> local
                </span>
              ) : (
                <span className="flex items-center gap-0.5 px-1 py-0 rounded bg-[var(--accent-glow)] text-[var(--accent)] text-[8px] shrink-0">
                  <Cloud size={7} /> cloud
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {agent.status === "running" && (
            <Loader2 size={11} className="text-[var(--green)] animate-spin" />
          )}
          {(agent.status === "running" || agent.status === "starting") && (
            <button
              onClick={handleStop}
              className="text-[var(--text-muted)] hover:text-[var(--red)] cursor-pointer transition-colors p-1 rounded-lg hover:bg-[var(--red-dim)]"
              title="Stop"
            >
              <Square size={10} />
            </button>
          )}
        </div>
      </div>

      {lastMessage && (
        <div className="text-[11px] text-[var(--text-muted)] mt-1.5 truncate pl-[42px] leading-relaxed">
          {lastMessage.content.slice(0, 80)}
        </div>
      )}
    </div>
  );
}
