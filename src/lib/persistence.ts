// Save/restore app state to localStorage

const KEYS = {
  projectPath: "idemanta-project-path",
  recentPaths: "idemanta-recent-paths",
  leftSidebarWidth: "idemanta-left-sidebar-width",
  rightSidebarWidth: "idemanta-right-sidebar-width",
  bottomPanelHeight: "idemanta-bottom-panel-height",
  rightPanelOpen: "idemanta-right-panel-open",
  authMode: "idemanta-auth-mode",
  autoApprove: "idemanta-auto-approve",
};

export function saveState(key: keyof typeof KEYS, value: string | number | boolean) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {}
}

export function loadState<T>(key: keyof typeof KEYS, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function addRecentPath(path: string) {
  const recent = loadState<string[]>("recentPaths", []);
  const updated = [path, ...recent.filter((p) => p !== path)].slice(0, 10);
  saveState("recentPaths", updated as unknown as string);
}

export function getRecentPaths(): string[] {
  return loadState<string[]>("recentPaths", []);
}
