import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAgentStore, type AgentBackend } from "../../stores/agentStore";
import { useProjectStore } from "../../stores/projectStore";
import { AgentCard } from "./AgentCard";
import { AgentOutput } from "./AgentOutput";
import { useSettingsStore } from "../../stores/settingsStore";
import { Plus, Crown, Cloud, Cpu } from "lucide-react";

export function AgentPanel({ projectPath }: { projectPath: string }) {
  const { agents, addAgent, selectedAgentId } = useAgentStore();
  const { projects } = useProjectStore();
  const { autoApprove, ollamaUrl, ollamaModel } = useSettingsStore();
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSpeciality, setNewSpeciality] = useState("");
  const [newBackend, setNewBackend] = useState<AgentBackend>("claude");

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Group agents: project agents vs standalone
  const projectAgentIds = new Set(projects.flatMap((p) => p.agents.map((a) => a.agentId)));
  const standaloneAgents = agents.filter((a) => !projectAgentIds.has(a.id));

  const handleSpawn = async () => {
    if (!newName.trim()) return;

    const systemPrompt = newSpeciality.trim()
      ? `Your name is ${newName}. You are specialized in: ${newSpeciality}. Always stay in character and focus on your speciality. Introduce yourself briefly.`
      : `Your name is ${newName}. Introduce yourself briefly.`;

    try {
      let info: { id: string; name: string; role: string; status: string; working_dir: string };

      if (newBackend === "ollama") {
        info = await invoke("spawn_local_agent", {
          name: newName,
          role: newSpeciality.trim() || "general",
          workingDir: projectPath,
          initialPrompt: systemPrompt,
          ollamaUrl,
          ollamaModel,
        });
      } else {
        info = await invoke("spawn_agent", {
          name: newName,
          role: newSpeciality.trim() || "general",
          workingDir: projectPath,
          initialPrompt: systemPrompt,
          autoApprove,
        });
      }

      addAgent({
        id: info.id, name: newName,
        role: newSpeciality.trim() || "general",
        status: "running", workingDir: info.working_dir,
        messages: [], tokensUsed: 0, filesModified: [],
        backend: newBackend,
      });

      setShowNewAgent(false);
      setNewName("");
      setNewSpeciality("");
      setNewBackend("claude");
    } catch (e) {
      console.error("Failed to spawn agent:", e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Agents ({agents.length})
        </span>
        <button
          onClick={() => setShowNewAgent(!showNewAgent)}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium cursor-pointer transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          New
        </button>
      </div>

      {/* New Agent Form */}
      {showNewAgent && (
        <div className="p-3 mx-2 mb-2 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-subtle)] animate-slide-in">
          <input
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Agent name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && handleSpawn()}
            autoFocus
          />
          <textarea
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 resize-none placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Speciality (optional)..."
            rows={2}
            value={newSpeciality}
            onChange={(e) => setNewSpeciality(e.target.value)}
          />
          {/* Backend selector */}
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => setNewBackend("claude")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all border ${
                newBackend === "claude"
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/40 text-[var(--accent)]"
                  : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent)]/20"
              }`}
            >
              <Cloud size={12} />
              Claude
            </button>
            <button
              onClick={() => setNewBackend("ollama")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all border ${
                newBackend === "ollama"
                  ? "bg-[var(--green-dim)] border-[var(--green)]/40 text-[var(--green)]"
                  : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--green)]/20"
              }`}
            >
              <Cpu size={12} />
              Local (Ollama)
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSpawn}
              disabled={!newName.trim()}
              className={`flex-1 text-[12px] py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                newName.trim()
                  ? "bg-[var(--green)] text-black hover:opacity-90"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewAgent(false); setNewName(""); setNewSpeciality(""); }}
              className="flex-1 text-[12px] py-1.5 rounded-md bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Agent List grouped by project */}
      <div className="flex-1 overflow-y-auto py-1">
        {agents.length === 0 ? (
          <div className="text-center text-[12px] text-[var(--text-muted)] mt-8 px-4">
            No agents yet.
          </div>
        ) : (
          <>
            {/* Project groups */}
            {projects.filter((p) => p.agents.length > 0).map((project) => {
              return (
                <div key={project.id} className="mb-2">
                  {/* Project header */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-md bg-[var(--bg-primary)]/30">
                    <Crown size={10} className="text-[var(--yellow)]" />
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      {project.name}
                    </span>
                    <span
                      className="text-[9px] px-1 py-0.5 rounded-full ml-auto"
                      style={{
                        backgroundColor:
                          project.status === "running" ? "var(--green-dim)" :
                          project.status === "paused" ? "var(--yellow-dim)" : "var(--bg-tertiary)",
                        color:
                          project.status === "running" ? "var(--green)" :
                          project.status === "paused" ? "var(--yellow)" : "var(--text-muted)",
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.agents.map((pa) => {
                    const agent = agents.find((a) => a.id === pa.agentId);
                    if (agent) {
                      return <AgentCard key={agent.id} agent={agent} />;
                    }
                    // Agent not yet in store — show placeholder
                    return (
                      <div
                        key={pa.agentId}
                        className="flex items-center gap-2 px-3 py-2 mx-1 rounded-md"
                      >
                        <div className="w-2 h-2 rounded-full bg-[var(--yellow)] animate-pulse" />
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {pa.name}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]/60 ml-auto">
                          starting...
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Standalone agents */}
            {standaloneAgents.length > 0 && (
              <div className="mb-2">
                {projects.some((p) => p.agents.length > 0) && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-md bg-[var(--bg-primary)]/30">
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Standalone
                    </span>
                  </div>
                )}
                {standaloneAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Output */}
      {selectedAgent && (
        <div className="border-t border-[var(--border-subtle)] h-[45%] overflow-hidden">
          <AgentOutput agent={selectedAgent} />
        </div>
      )}
    </div>
  );
}
