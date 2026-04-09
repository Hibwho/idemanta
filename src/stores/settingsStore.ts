import { create } from "zustand";
import { loadState, saveState } from "../lib/persistence";

export type AuthMode = "cli" | "api";

interface SettingsStore {
  authMode: AuthMode;
  apiKey: string;
  autoApprove: boolean;
  showSettings: boolean;
  // Ollama / Local LLM
  ollamaUrl: string;
  ollamaModel: string;
  orchestratorEnabled: boolean;
  setAuthMode: (mode: AuthMode) => void;
  setApiKey: (key: string) => void;
  setAutoApprove: (value: boolean) => void;
  toggleSettings: () => void;
  setOllamaUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
  setOrchestratorEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  authMode: "cli",
  apiKey: "",
  autoApprove: false,
  showSettings: false,
  ollamaUrl: loadState<string>("ollamaUrl", "http://localhost:11434"),
  ollamaModel: loadState<string>("ollamaModel", "qwen3:8b"),
  orchestratorEnabled: loadState<boolean>("orchestratorEnabled", false),
  setAuthMode: (mode) => set({ authMode: mode }),
  setApiKey: (key) => set({ apiKey: key }),
  setAutoApprove: (value) => set({ autoApprove: value }),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  setOllamaUrl: (url) => {
    saveState("ollamaUrl", url);
    set({ ollamaUrl: url });
  },
  setOllamaModel: (model) => {
    saveState("ollamaModel", model);
    set({ ollamaModel: model });
  },
  setOrchestratorEnabled: (value) => {
    saveState("orchestratorEnabled", value);
    set({ orchestratorEnabled: value });
  },
}));
