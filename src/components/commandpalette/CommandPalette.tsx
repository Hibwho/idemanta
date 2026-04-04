import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, FolderOpen, Bot, Plus, Settings, Terminal,
  FileCode, Users, FolderKanban, Store, GitBranch,
  Play, Pause, Square, PanelRightOpen, PanelRightClose,
  Code2, Keyboard,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  icon: typeof Search;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!open) return null;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let globalIndex = -1;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-[15vh]"
      style={{ zIndex: 99999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-[560px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
          <Search size={16} className="text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-mono border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isSelected = idx === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[var(--accent-glow)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      }`}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <Icon size={15} className={isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                      <span className="flex-1 text-[13px]">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-mono border border-[var(--border)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function useCommands(actions: {
  onOpenFolder: () => void;
  onPreferences: () => void;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
  onNewAgent: () => void;
  onNewProject: () => void;
  onShowExplorer: () => void;
  onShowSearch: () => void;
  onShowGit: () => void;
  onShowAgents: () => void;
  onShowStore: () => void;
  onShowAgentView: () => void;
}): Command[] {
  return [
    // File
    { id: "open-folder", label: "Open Folder", category: "File", shortcut: "Ctrl+O", icon: FolderOpen, action: actions.onOpenFolder },
    { id: "preferences", label: "Preferences", category: "File", shortcut: "Ctrl+,", icon: Settings, action: actions.onPreferences },

    // View
    { id: "show-explorer", label: "Show Explorer", category: "View", shortcut: "Ctrl+Shift+E", icon: FileCode, action: actions.onShowExplorer },
    { id: "show-search", label: "Show Search", category: "View", shortcut: "Ctrl+Shift+F", icon: Search, action: actions.onShowSearch },
    { id: "show-git", label: "Show Source Control", category: "View", shortcut: "Ctrl+Shift+G", icon: GitBranch, action: actions.onShowGit },
    { id: "toggle-terminal", label: "Toggle Terminal", category: "View", shortcut: "Ctrl+`", icon: Terminal, action: actions.onToggleTerminal },
    { id: "toggle-sidebar", label: "Toggle Right Panel", category: "View", shortcut: "Ctrl+B", icon: PanelRightOpen, action: actions.onToggleSidebar },

    // Agents
    { id: "new-agent", label: "New Agent", category: "Agents", shortcut: "Ctrl+N", icon: Plus, action: actions.onNewAgent },
    { id: "new-project", label: "New Project Team", category: "Agents", icon: Users, action: actions.onNewProject },
    { id: "show-agents", label: "Show Agents Panel", category: "Agents", shortcut: "Ctrl+Shift+A", icon: Bot, action: actions.onShowAgents },
    { id: "show-agent-view", label: "Show Agent View", category: "Agents", icon: Users, action: actions.onShowAgentView },
    { id: "show-store", label: "Open Store", category: "Agents", icon: Store, action: actions.onShowStore },
  ];
}
