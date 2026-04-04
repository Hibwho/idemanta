import { create } from "zustand";

export interface AgentMessage {
  id: string;
  type: string;
  content: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: "starting" | "running" | "waiting" | "stopped" | "error";
  workingDir: string;
  messages: AgentMessage[];
  tokensUsed: number;
  filesModified: string[];
}

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  selectAgent: (id: string | null) => void;
  addMessage: (agentId: string, message: AgentMessage) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgentId: null,

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  selectAgent: (id) => set({ selectedAgentId: id }),

  addMessage: (agentId, message) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, messages: [...a.messages, message] } : a
      ),
    })),
}));
