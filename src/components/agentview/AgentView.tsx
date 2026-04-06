import { useAgentStore } from "../../stores/agentStore";
import { useProjectStore } from "../../stores/projectStore";
import { Bot, Crown, Loader2, MessageSquare, Zap, Pause, Cloud, Cpu } from "lucide-react";

const statusColors: Record<string, string> = {
  starting: "var(--yellow)",
  running: "var(--green)",
  waiting: "var(--blue)",
  stopped: "var(--text-muted)",
  error: "var(--red)",
};

const statusBg: Record<string, string> = {
  starting: "var(--yellow-dim)",
  running: "var(--green-dim)",
  waiting: "var(--blue-dim)",
  stopped: "var(--bg-tertiary)",
  error: "var(--red-dim)",
};

function AgentAvatar({ agent, isOrchestrator, onClick }: {
  agent: { id: string; name: string; role: string; status: string; messages: unknown[]; backend?: string };
  isOrchestrator: boolean;
  onClick: () => void;
}) {
  const lastMsg = [...agent.messages].reverse().find(
    (m: any) => m.type !== "user"
  ) as { content: string } | undefined;

  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-[var(--accent)]/5 w-[160px]"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
          style={{ backgroundColor: statusBg[agent.status] }}
        >
          {isOrchestrator ? (
            <Crown size={24} style={{ color: statusColors[agent.status] }} />
          ) : (
            <Bot size={24} style={{ color: statusColors[agent.status] }} />
          )}
        </div>
        {/* Status indicator */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center ${
            agent.status === "running" ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: statusColors[agent.status] }}
        >
          {agent.status === "running" && <Loader2 size={8} className="text-black animate-spin" />}
          {agent.status === "waiting" && <MessageSquare size={8} className="text-black" />}
          {agent.status === "stopped" && <Pause size={7} className="text-white" />}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="text-[12px] font-semibold text-[var(--text-primary)]">{agent.name}</div>
        <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]">
          <span className="truncate max-w-[100px]">{agent.role}</span>
          {agent.backend === "ollama" ? (
            <Cpu size={9} className="text-[var(--green)] shrink-0" />
          ) : (
            <Cloud size={9} className="text-[var(--accent)] shrink-0" />
          )}
        </div>
      </div>

      {/* Speech bubble */}
      {lastMsg && (
        <div className="w-full bg-[var(--bg-primary)] rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 border border-[var(--border-subtle)]">
          {lastMsg.content.slice(0, 100)}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)]">
        <span className="flex items-center gap-0.5">
          <MessageSquare size={8} />
          {agent.messages.length}
        </span>
        <span
          className="flex items-center gap-0.5"
          style={{ color: statusColors[agent.status] }}
        >
          <Zap size={8} />
          {agent.status}
        </span>
      </div>
    </div>
  );
}

export function AgentView() {
  const { agents, selectAgent } = useAgentStore();
  const { projects } = useProjectStore();

  const projectAgentIds = new Set(projects.flatMap((p) => p.agents.map((a) => a.agentId)));
  const standaloneAgents = agents.filter((a) => !projectAgentIds.has(a.id));

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full select-none">
        <div className="text-center">
          <Bot size={48} className="mx-auto mb-4 text-[var(--text-muted)]/30" />
          <div className="text-[14px] text-[var(--text-secondary)] mb-1">No agents active</div>
          <div className="text-[12px] text-[var(--text-muted)]">
            Create an agent or a project to see them here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Project teams */}
      {projects.filter((p) => p.agents.length > 0).map((project) => {
        const projectAgents = agents.filter((a) =>
          project.agents.some((pa) => pa.agentId === a.id)
        );
        if (projectAgents.length === 0) return null;

        return (
          <div key={project.id} className="mb-8">
            {/* Project header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    project.status === "running" ? "var(--green)" :
                    project.status === "paused" ? "var(--yellow)" : "var(--text-muted)",
                }}
              />
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                {project.name}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {project.agents.length} agents
              </span>
            </div>

            {/* Agent grid */}
            <div className="flex flex-wrap gap-3">
              {projectAgents.map((agent) => (
                <AgentAvatar
                  key={agent.id}
                  agent={agent}
                  isOrchestrator={project.orchestratorId === agent.id}
                  onClick={() => selectAgent(agent.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Standalone */}
      {standaloneAgents.length > 0 && (
        <div className="mb-8">
          {projects.some((p) => p.agents.length > 0) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                Standalone Agents
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {standaloneAgents.map((agent) => (
              <AgentAvatar
                key={agent.id}
                agent={agent}
                isOrchestrator={false}
                onClick={() => selectAgent(agent.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
