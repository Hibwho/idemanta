import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  savedContent: string;
  language: string;
  modified: boolean;
}

interface EditorStore {
  openFiles: OpenFile[];
  activeFilePath: string | null;
  modifiedPaths: Set<string>;
  openFile: (file: Omit<OpenFile, "savedContent">) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
}

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    rs: "rust", py: "python", json: "json", yaml: "yaml", yml: "yaml",
    md: "markdown", css: "css", html: "html", toml: "toml", sh: "shell",
  };
  return map[ext] || "plaintext";
}

let autoSaveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useEditorStore = create<EditorStore>((set, get) => ({
  openFiles: [],
  activeFilePath: null,
  modifiedPaths: new Set(),

  openFile: (file) =>
    set((state) => {
      const exists = state.openFiles.find((f) => f.path === file.path);
      if (exists) return { activeFilePath: file.path };
      const lang = detectLanguage(file.name);
      return {
        openFiles: [
          ...state.openFiles,
          { ...file, language: lang, savedContent: file.content, modified: false },
        ],
        activeFilePath: file.path,
      };
    }),

  closeFile: (path) =>
    set((state) => {
      const remaining = state.openFiles.filter((f) => f.path !== path);
      const newModified = new Set(state.modifiedPaths);
      newModified.delete(path);
      if (autoSaveTimers[path]) { clearTimeout(autoSaveTimers[path]); delete autoSaveTimers[path]; }
      return {
        openFiles: remaining,
        modifiedPaths: newModified,
        activeFilePath:
          state.activeFilePath === path
            ? remaining[remaining.length - 1]?.path || null
            : state.activeFilePath,
      };
    }),

  setActiveFile: (path) => set({ activeFilePath: path }),

  updateFileContent: (path, content) => {
    set((state) => {
      const file = state.openFiles.find((f) => f.path === path);
      const isModified = file ? content !== file.savedContent : false;
      const newModified = new Set(state.modifiedPaths);
      if (isModified) newModified.add(path); else newModified.delete(path);
      return {
        openFiles: state.openFiles.map((f) =>
          f.path === path ? { ...f, content, modified: isModified } : f
        ),
        modifiedPaths: newModified,
      };
    });

    // Auto-save after 1.5s of inactivity
    if (autoSaveTimers[path]) clearTimeout(autoSaveTimers[path]);
    autoSaveTimers[path] = setTimeout(() => {
      get().saveFile(path);
    }, 1500);
  },

  saveFile: async (path) => {
    const file = get().openFiles.find((f) => f.path === path);
    if (!file || !file.modified) return;
    try {
      await invoke("write_file_content", { path, content: file.content });
      set((state) => {
        const newModified = new Set(state.modifiedPaths);
        newModified.delete(path);
        return {
          openFiles: state.openFiles.map((f) =>
            f.path === path ? { ...f, savedContent: f.content, modified: false } : f
          ),
          modifiedPaths: newModified,
        };
      });
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  },

  saveAllFiles: async () => {
    const files = get().openFiles.filter((f) => f.modified);
    for (const f of files) {
      await get().saveFile(f.path);
    }
  },
}));
