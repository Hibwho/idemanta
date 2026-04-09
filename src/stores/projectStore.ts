import { create } from "zustand";

export interface ProjectAgent {
  agentId: string;
  name: string;
  role: string;
}

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
  boardPath: string | null;
  planPath: string | null;
  swarmMode: boolean;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  addAgentToProject: (projectId: string, agent: ProjectAgent) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProjectId: null,

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    })),

  setActiveProject: (id) => set({ activeProjectId: id }),

  addAgentToProject: (projectId, agent) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, agents: [...p.agents, agent] } : p
      ),
    })),
}));
