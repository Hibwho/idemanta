import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useProjectStore, Project } from "../../stores/projectStore";
import { useAgentStore } from "../../stores/agentStore";
import { planProjectTeam, initProjectMemory, routeModel } from "../../lib/ruflo";
import { useSettingsStore } from "../../stores/settingsStore";
import {
  Plus, Play, Pause, Users, FolderOpen,
  Loader2, Crown, Bot, Trash2,
} from "lucide-react";

interface ProjectPanelProps {
  projectPath: string;
  onSwitchToAgents?: () => void;
}

export function ProjectPanel({ projectPath, onSwitchToAgents }: ProjectPanelProps) {
  const { projects, activeProjectId, addProject, setActiveProject, updateProject, removeProject } = useProjectStore();
  const { addAgent, selectAgent } = useAgentStore();
  const { autoApprove } = useSettingsStore();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workDir, setWorkDir] = useState(projectPath);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || isCreating) return;
    setIsCreating(true);

    const id = crypto.randomUUID();
    const memoryNamespace = `project-${name.toLowerCase().replace(/\s+/g, "-")}`;
    const team = planProjectTeam(description);

    const project: Project = {
      id, name, description,
      workingDir: workDir || projectPath,
      status: "running",
      agents: [],
      orchestratorId: null,
      memoryNamespace,
      createdAt: Date.now(),
    };

    addProject(project);
    setActiveProject(id);

    // Init memory
    try { await initProjectMemory(memoryNamespace); } catch {}

    // Spawn team
    for (const member of team) {
      try {
        const systemPrompt = member.role === "orchestrator"
          ? `You are ${member.name}, the lead orchestrator for "${name}". Project: ${description}. Coordinate the team, break down tasks, track progress. Start by creating a plan.`
          : `You are ${member.name}, specialized in ${member.speciality}. Project "${name}": ${description}. Wait for instructions from the Lead or user. Introduce yourself briefly.`;

        // Route model for future use
        routeModel(member.role === "orchestrator" ? description : member.speciality);

        const info = await invoke<{
          id: string; name: string; role: string; status: string; working_dir: string;
        }>("spawn_agent", {
          name: member.name,
          role: member.role,
          workingDir: workDir || projectPath,
          initialPrompt: systemPrompt,
          autoApprove,
        });

        addAgent({
          id: info.id, name: member.name,
          role: member.speciality,
          status: "running", workingDir: info.working_dir,
          messages: [], tokensUsed: 0, filesModified: [],
          backend: "claude",
        });

        const { addAgentToProject } = useProjectStore.getState();
        addAgentToProject(id, { agentId: info.id, name: member.name, role: member.role });

        if (member.role === "orchestrator") {
          updateProject(id, { orchestratorId: info.id });
        }
      } catch (e) {
        console.error(`Failed to spawn ${member.name}:`, e);
      }
    }

    setShowNew(false);
    setName("");
    setDescription("");
    setIsCreating(false);

    // Switch to agents tab to see the team
    if (onSwitchToAgents) onSwitchToAgents();
  };

  const handlePause = (project: Project) => {
    updateProject(project.id, { status: "paused" });
    const { updateAgent } = useAgentStore.getState();
    for (const ag of project.agents) {
      invoke("stop_agent", { agentId: ag.agentId }).catch(() => {});
      updateAgent(ag.agentId, { status: "stopped" });
    }
  };

  const handleResume = async (project: Project) => {
    updateProject(project.id, { status: "running" });
    if (project.orchestratorId) {
      selectAgent(project.orchestratorId);
      try {
        await invoke("send_to_agent", {
          agentId: project.orchestratorId,
          message: "The project is resumed. Review progress and continue. Give a status update.",
          autoApprove,
        });
        const { updateAgent } = useAgentStore.getState();
        updateAgent(project.orchestratorId, { status: "running" });
      } catch {}
    }
    if (onSwitchToAgents) onSwitchToAgents();
  };

  const handleDelete = (project: Project) => {
    // Stop all agents
    const { updateAgent } = useAgentStore.getState();
    for (const ag of project.agents) {
      invoke("stop_agent", { agentId: ag.agentId }).catch(() => {});
      updateAgent(ag.agentId, { status: "stopped" });
    }
    removeProject(project.id);
  };

  const handleSelectOrchestrator = (project: Project) => {
    if (project.orchestratorId) {
      selectAgent(project.orchestratorId);
      if (onSwitchToAgents) onSwitchToAgents();
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Projects ({projects.length})
        </span>
        <button
          onClick={() => setShowNew(!showNew)}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium cursor-pointer transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          New
        </button>
      </div>

      {/* New Project Form */}
      {showNew && (
        <div className="p-3 mx-2 mb-2 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-subtle)] animate-slide-in">
          <input
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <textarea
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 resize-none placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Describe the project... (mentions 'frontend', 'backend', 'security', etc. to auto-build the team)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2 mb-2">
            <FolderOpen size={12} className="text-[var(--text-muted)] shrink-0" />
            <input
              className="w-full bg-transparent py-1.5 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              placeholder="Working directory"
              value={workDir}
              onChange={(e) => setWorkDir(e.target.value)}
            />
          </div>

          {/* Team Preview */}
          {description.trim() && (
            <div className="mb-2 p-2 rounded-md bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Auto-generated team
              </div>
              <div className="flex flex-wrap gap-1">
                {planProjectTeam(description).map((m, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      m.role === "orchestrator"
                        ? "bg-[var(--yellow-dim)] text-[var(--yellow)]"
                        : "bg-[var(--blue-dim)] text-[var(--blue)]"
                    }`}
                  >
                    {m.role === "orchestrator" ? <Crown size={9} /> : <Bot size={9} />}
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !description.trim() || isCreating}
              className={`flex-1 text-[12px] py-1.5 rounded-md font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                name.trim() && description.trim() && !isCreating
                  ? "bg-[var(--green)] text-black hover:opacity-90"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              {isCreating ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
              {isCreating ? "Creating..." : "Create Team"}
            </button>
            <button
              onClick={() => { setShowNew(false); setName(""); setDescription(""); }}
              className="text-[12px] py-1.5 px-3 rounded-md bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="flex-1 overflow-y-auto py-1">
        {projects.length === 0 && !showNew && (
          <div className="text-center text-[12px] text-[var(--text-muted)] mt-8 px-4">
            <Users size={24} className="mx-auto mb-2 text-[var(--text-muted)]/50" />
            Create a project to spawn a team of agents
          </div>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className={`mx-2 mb-1.5 p-3 rounded-lg cursor-pointer transition-all ${
              activeProjectId === project.id
                ? "bg-[var(--accent-glow)] border border-[var(--accent)]/40"
                : "bg-[var(--bg-primary)]/40 border border-transparent hover:bg-[var(--bg-primary)]/70 hover:border-[var(--border-subtle)]"
            }`}
            onClick={() => setActiveProject(project.id)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium">{project.name}</span>
              <div className="flex items-center gap-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor:
                      project.status === "running" ? "var(--green-dim)" :
                      project.status === "paused" ? "var(--yellow-dim)" : "var(--bg-primary)",
                    color:
                      project.status === "running" ? "var(--green)" :
                      project.status === "paused" ? "var(--yellow)" : "var(--text-muted)",
                  }}
                >
                  {project.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-[11px] text-[var(--text-muted)] mb-2 line-clamp-2">
              {project.description}
            </div>

            {/* Team */}
            <div className="flex flex-wrap gap-1 mb-2">
              {project.agents.map((ag) => (
                <span
                  key={ag.agentId}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    ag.role === "orchestrator"
                      ? "bg-[var(--yellow-dim)] text-[var(--yellow)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  }`}
                >
                  {ag.role === "orchestrator" ? <Crown size={8} /> : <Bot size={8} />}
                  {ag.name}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {project.orchestratorId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleSelectOrchestrator(project); }}
                  className="text-[10px] px-2 py-1 rounded-md bg-[var(--accent-glow)] text-[var(--accent)] hover:bg-[var(--accent)]/20 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Crown size={10} />
                  Talk to Lead
                </button>
              )}
              {project.status === "running" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePause(project); }}
                  className="text-[10px] px-2 py-1 rounded-md bg-[var(--yellow-dim)] text-[var(--yellow)] hover:bg-[var(--yellow)]/20 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Pause size={10} />
                  Pause
                </button>
              )}
              {project.status === "paused" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleResume(project); }}
                  className="text-[10px] px-2 py-1 rounded-md bg-[var(--green-dim)] text-[var(--green)] hover:bg-[var(--green)]/20 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Play size={10} />
                  Resume
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(project); }}
                className="text-[10px] px-2 py-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--red-dim)] hover:text-[var(--red)] cursor-pointer transition-colors ml-auto"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
