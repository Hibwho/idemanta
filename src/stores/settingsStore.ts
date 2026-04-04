import { create } from "zustand";

export type AuthMode = "cli" | "api";

interface SettingsStore {
  authMode: AuthMode;
  apiKey: string;
  autoApprove: boolean;
  showSettings: boolean;
  setAuthMode: (mode: AuthMode) => void;
  setApiKey: (key: string) => void;
  setAutoApprove: (value: boolean) => void;
  toggleSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  authMode: "cli",
  apiKey: "",
  autoApprove: false,
  showSettings: false,
  setAuthMode: (mode) => set({ authMode: mode }),
  setApiKey: (key) => set({ apiKey: key }),
  setAutoApprove: (value) => set({ autoApprove: value }),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
}));
