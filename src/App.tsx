import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { FileTree } from "./components/filetree/FileTree";
import { Editor } from "./components/editor/Editor";
import { AgentView } from "./components/agentview/AgentView";
import { MenuBar, MenuBarActions } from "./components/menubar/MenuBar";
import { CommandPalette, useCommands } from "./components/commandpalette/CommandPalette";
import { ResizeHandle } from "./components/ResizeHandle";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { saveState, loadState, addRecentPath } from "./lib/persistence";
import { AgentPanel } from "./components/agents/AgentPanel";
import { ProjectPanel } from "./components/project/ProjectPanel";
import { StorePanel } from "./components/store/StorePanel";
import { SearchPanel } from "./components/search/SearchPanel";
import { GitPanel } from "./components/git/GitPanel";
import { RuntimePanel } from "./components/runtime/RuntimePanel";
import { MultiTerminal } from "./components/terminal/MultiTerminal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useAgentStore } from "./stores/agentStore";
import { useEditorStore } from "./stores/editorStore";
import { useSettingsStore } from "./stores/settingsStore";
import {
  Bot, FolderKanban, FolderOpen, Code2,
  Cpu, Zap, CircleDot, Settings, FileCode, Users,
  Store, Files, PanelRightClose, PanelRightOpen,
  Search, GitBranch, Terminal, ScrollText,
  PanelBottomClose, PanelBottomOpen, Bug, FileText,
  Package,
} from "lucide-react";
import "./index.css";

interface AgentEvent {
  agent_id: string;
  event_type: string;
  data: Record<string, unknown>;
}

type RightTab = "agents" | "projects" | "store";
type LeftTab = "files" | "search" | "git" | "agentview" | "runtime";
type BottomPanel = "terminal" | "output" | "debug" | "logs" | null;

function App() {
  const [projectPath, setProjectPathRaw] = useState(() => loadState<string>("projectPath", ""));
  const setProjectPath = (path: string) => {
    setProjectPathRaw(path);
    if (path) {
      saveState("projectPath", path);
      addRecentPath(path);
    }
  };
  const [rightTab, setRightTab] = useState<RightTab>("agents");
  const [leftTab, setLeftTab] = useState<LeftTab>("files");
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; type: string }>>([]);
  const [agentLogs, setAgentLogs] = useState<Array<{ time: string; agent: string; text: string }>>([]);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(240);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const { addMessage, updateAgent, agents } = useAgentStore();
  const { toggleSettings } = useSettingsStore();

  useEffect(() => {
    const unlisten = listen<AgentEvent>("agent-event", (event) => {
      const { agent_id, event_type, data } = event.payload;

      if (["system", "rate_limit_event", "ready"].includes(event_type)) {
        if (event_type === "ready") {
          updateAgent(agent_id, { status: "waiting" });
          const agentName = useAgentStore.getState().agents.find((a) => a.id === agent_id)?.name || "Agent";
          const notifId = crypto.randomUUID();
          setNotifications((prev) => [...prev, { id: notifId, text: `${agentName} finished`, type: "success" }]);
          setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notifId)), 4000);
        }
        return;
      }

      let content = "";
      try {
        if (event_type === "result") {
          content = typeof data.result === "string" ? data.result : "";
        } else if (event_type === "assistant") {
          const msg = data.message as Record<string, unknown> | undefined;
          if (msg?.content) {
            if (Array.isArray(msg.content)) {
              content = (msg.content as Array<Record<string, unknown>>)
                .filter((b) => b.type === "text")
                .map((b) => String(b.text || ""))
                .join("");
            } else {
              content = String(msg.content);
            }
          }
        } else if (event_type === "error") {
          content = String(data.error || JSON.stringify(data));
        }
      } catch { content = ""; }

      if (!content.trim()) return;

      if (event_type === "result") {
        const agent = useAgentStore.getState().agents.find((a) => a.id === agent_id);
        const lastMsg = agent?.messages[agent.messages.length - 1];
        if (lastMsg?.content === content) return;
      }

      addMessage(agent_id, { id: crypto.randomUUID(), type: event_type, content, timestamp: Date.now() });

      // Add to agent logs
      const agentName = useAgentStore.getState().agents.find((a) => a.id === agent_id)?.name || agent_id.slice(0, 8);
      setAgentLogs((prev) => [...prev.slice(-200), {
        time: new Date().toLocaleTimeString(),
        agent: agentName,
        text: content.slice(0, 150),
      }]);

      if (event_type === "error") updateAgent(agent_id, { status: "error" });
      else updateAgent(agent_id, { status: "running" });
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [addMessage, updateAgent]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && e.key === "k") { e.preventDefault(); setCommandPaletteOpen(true); }
      if (ctrl && !shift && e.key === "o") { e.preventDefault(); handleOpenFolder(); }
      if (ctrl && !shift && e.key === "s") { e.preventDefault(); useEditorStore.getState().saveFile(useEditorStore.getState().activeFilePath || ""); }
      if (ctrl && shift && e.key === "S") { e.preventDefault(); useEditorStore.getState().saveAllFiles(); }
      if (ctrl && e.key === "w") { e.preventDefault(); const ap = useEditorStore.getState().activeFilePath; if (ap) useEditorStore.getState().closeFile(ap); }
      if (ctrl && e.key === "Tab") { e.preventDefault(); const { openFiles, activeFilePath, setActiveFile } = useEditorStore.getState(); if (openFiles.length > 1) { const idx = openFiles.findIndex(f => f.path === activeFilePath); setActiveFile(openFiles[(idx + 1) % openFiles.length].path); } }
      if (ctrl && e.key === ",") { e.preventDefault(); toggleSettings(); }
      if (ctrl && e.key === "`") { e.preventDefault(); setBottomPanel(bottomPanel === "terminal" ? null : "terminal"); }
      if (ctrl && shift && e.key === "E") { e.preventDefault(); setLeftTab("files"); }
      if (ctrl && shift && e.key === "F") { e.preventDefault(); setLeftTab("search"); }
      if (ctrl && shift && e.key === "G") { e.preventDefault(); setLeftTab("git"); }
      if (ctrl && shift && e.key === "A") { e.preventDefault(); setRightTab("agents"); setRightPanelOpen(true); }
      if (ctrl && e.key === "n") { e.preventDefault(); setRightTab("agents"); setRightPanelOpen(true); }
      if (ctrl && e.key === "b") { e.preventDefault(); setRightPanelOpen(!rightPanelOpen); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bottomPanel, rightPanelOpen]);

  const handleOpenFolder = async () => {
    try {
      const selected = await openDialog({ directory: true, multiple: false, title: "Open Folder" });
      if (selected && typeof selected === "string") {
        setProjectPath(selected);
        setLeftTab("files");
      }
    } catch (e) {
      console.error("Open folder failed:", e);
    }
  };

  const menuActions: MenuBarActions = {
    onOpenFolder: handleOpenFolder,
    onSave: () => {},
    onPreferences: () => toggleSettings(),
    onToggleTerminal: () => setBottomPanel(bottomPanel === "terminal" ? null : "terminal"),
    onToggleSidebar: () => setRightPanelOpen(!rightPanelOpen),
    onNewAgent: () => { setRightTab("agents"); setRightPanelOpen(true); },
    onNewProject: () => { setRightTab("projects"); setRightPanelOpen(true); },
    onShowExplorer: () => setLeftTab("files"),
    onShowSearch: () => setLeftTab("search"),
    onShowGit: () => setLeftTab("git"),
    onShowAgents: () => { setRightTab("agents"); setRightPanelOpen(true); },
    onShowStore: () => { setRightTab("store"); setRightPanelOpen(true); },
  };

  const commands = useCommands({
    onOpenFolder: handleOpenFolder,
    onPreferences: () => toggleSettings(),
    onToggleTerminal: () => setBottomPanel(bottomPanel === "terminal" ? null : "terminal"),
    onToggleSidebar: () => setRightPanelOpen(!rightPanelOpen),
    onNewAgent: () => { setRightTab("agents"); setRightPanelOpen(true); },
    onNewProject: () => { setRightTab("projects"); setRightPanelOpen(true); },
    onShowExplorer: () => setLeftTab("files"),
    onShowSearch: () => setLeftTab("search"),
    onShowGit: () => setLeftTab("git"),
    onShowAgents: () => { setRightTab("agents"); setRightPanelOpen(true); },
    onShowStore: () => { setRightTab("store"); setRightPanelOpen(true); },
    onShowAgentView: () => setLeftTab("agentview"),
  });

  const runningCount = agents.filter((a) => a.status === "running").length;
  const waitingCount = agents.filter((a) => a.status === "waiting").length;
  const totalMessages = agents.reduce((sum, a) => sum + a.messages.length, 0);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Menu Bar */}
      <MenuBar actions={menuActions} />

      <div className="flex flex-1 min-h-0">

        {/* ===== LEFT ACTIVITY BAR ===== */}
        <div className="flex flex-col items-center w-[48px] min-w-[48px] bg-[var(--bg-secondary)] border-r border-[var(--border)] py-2 gap-1">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center mb-3 shadow-lg shadow-[var(--accent)]/20">
            <Code2 size={16} className="text-white" />
          </div>

          {/* Left tabs */}
          {([
            { key: "files" as LeftTab, icon: Files, tip: "Explorer" },
            { key: "search" as LeftTab, icon: Search, tip: "Search" },
            { key: "git" as LeftTab, icon: GitBranch, tip: "Source Control" },
            { key: "agentview" as LeftTab, icon: Users, tip: "Agent View" },
            { key: "runtime" as LeftTab, icon: Package, tip: "Runtimes & Environments" },
          ]).map(({ key, icon: Icon, tip }) => (
            <button
              key={key}
              onClick={() => setLeftTab(key)}
              title={tip}
              className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all relative ${
                leftTab === key
                  ? "text-[var(--text-primary)] bg-[var(--bg-elevated)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
              }`}
            >
              <Icon size={18} />
              {leftTab === key && (
                <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[var(--accent)]" />
              )}
            </button>
          ))}

          <div className="flex-1" />

          {/* Terminal toggle */}
          <button
            onClick={() => setBottomPanel(bottomPanel === "terminal" ? null : "terminal")}
            title="Terminal"
            className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              bottomPanel === "terminal"
                ? "text-[var(--text-primary)] bg-[var(--bg-elevated)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
            }`}
          >
            <Terminal size={18} />
          </button>

          {/* Settings */}
          <button
            onClick={toggleSettings}
            title="Settings"
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* ===== LEFT SIDEBAR ===== */}
        <div className="flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)]" style={{ width: leftSidebarWidth, minWidth: 160 }}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {leftTab === "files" ? "Explorer" : leftTab === "search" ? "Search" : leftTab === "git" ? "Source Control" : leftTab === "runtime" ? "Runtimes" : "Agent View"}
            </span>
            {runningCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--green-dim)] text-[var(--green)] font-medium">
                {runningCount} active
              </span>
            )}
          </div>

          {leftTab === "files" && (
            <>
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-2 focus-within:border-[var(--accent)] transition-colors">
                  <FolderOpen size={11} className="text-[var(--text-muted)] shrink-0" />
                  <input
                    className="w-full bg-transparent py-1.5 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none cursor-text"
                    placeholder="Open folder..."
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setProjectPath(e.currentTarget.value)}
                  />
                </div>
              </div>
              <FileTree projectPath={projectPath} />
            </>
          )}
          {leftTab === "search" && (
            <SearchPanel projectPath={projectPath} />
          )}
          {leftTab === "git" && (
            <GitPanel projectPath={projectPath} />
          )}
          {leftTab === "runtime" && (
            <RuntimePanel projectPath={projectPath} />
          )}
          {leftTab === "agentview" && (
            <div className="flex-1 overflow-hidden">
              <AgentView />
            </div>
          )}
        </div>

        {/* Left resize handle */}
        <ResizeHandle direction="horizontal" onResize={(d) => setLeftSidebarWidth((w) => Math.max(160, Math.min(500, w + d)))} />

        {/* ===== CENTER: EDITOR + BOTTOM PANEL ===== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Editor */}
          <div style={{ flex: bottomPanel ? "1 1 0%" : "1 1 100%", minHeight: 0, overflow: "hidden" }}>
            <Editor />
          </div>

          {/* Bottom Panel (Terminal / Output) */}
          {bottomPanel && (
            <>
            <ResizeHandle direction="vertical" onResize={(d) => setBottomPanelHeight((h) => Math.max(100, Math.min(500, h - d)))} />
            <div style={{ height: bottomPanelHeight, flexShrink: 0 }} className="bg-[var(--bg-secondary)] flex flex-col">
              {/* Bottom tabs */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex gap-2 pl-2">
                  {([
                    { key: "terminal" as BottomPanel, label: "Terminal", icon: Terminal },
                    { key: "output" as BottomPanel, label: "Output", icon: ScrollText },
                    { key: "debug" as BottomPanel, label: "Debug", icon: Bug },
                    { key: "logs" as BottomPanel, label: "Logs", icon: FileText },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setBottomPanel(key)}
                      className={`flex items-center gap-1.5 px-5 mx-2 py-1.5 text-[11px] font-medium cursor-pointer transition-colors ${
                        bottomPanel === key
                          ? "text-[var(--text-primary)] border-b-2 border-[var(--accent)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setBottomPanel(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer p-1.5 mr-1 rounded hover:bg-[var(--bg-elevated)]"
                >
                  <PanelBottomClose size={14} />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {bottomPanel === "terminal" && (
                  <MultiTerminal cwd={projectPath || undefined} />
                )}
                {bottomPanel === "output" && (
                  <div className="text-[var(--text-muted)] p-3 font-mono text-[11px]">No output yet.</div>
                )}
                {bottomPanel === "debug" && (
                  <div className="h-full overflow-y-auto p-2 font-mono text-[11px]">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Bug size={13} className="text-[var(--yellow)]" />
                      <span className="text-[var(--text-secondary)] text-[12px] font-medium">Debug Console</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{agents.length} agents tracked</span>
                    </div>
                    {agents.map((agent) => (
                      <div key={agent.id} className="mb-2 px-1">
                        <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{
                            backgroundColor: agent.status === "running" ? "var(--green)" : agent.status === "waiting" ? "var(--blue)" : "var(--text-muted)"
                          }} />
                          <span className="text-[var(--accent)]">{agent.name}</span>
                          <span className="text-[var(--text-muted)]">{agent.status}</span>
                          <span className="text-[var(--text-muted)] ml-auto">{agent.messages.length} msgs</span>
                        </div>
                      </div>
                    ))}
                    {agents.length === 0 && (
                      <div className="text-[var(--text-muted)] px-1">No agents running. Spawn one to see debug info.</div>
                    )}
                  </div>
                )}
                {bottomPanel === "logs" && (
                  <div className="h-full overflow-y-auto p-2 font-mono text-[11px]">
                    {agentLogs.length === 0 ? (
                      <div className="text-[var(--text-muted)] p-2">No logs yet. Agent output will stream here.</div>
                    ) : (
                      agentLogs.map((log, i) => (
                        <div key={i} className="flex gap-2 py-0.5 hover:bg-[var(--bg-elevated)]/30">
                          <span className="text-[var(--text-muted)] shrink-0 w-[70px]">{log.time}</span>
                          <span className="text-[var(--accent)] shrink-0 w-[80px] truncate">{log.agent}</span>
                          <span className="text-[var(--text-secondary)] truncate">{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>

        {/* ===== RIGHT ACTIVITY BAR ===== */}
        <div className="flex flex-col items-center w-[48px] min-w-[48px] bg-[var(--bg-secondary)] border-l border-[var(--border)] py-2 gap-1">
          {([
            { key: "agents" as RightTab, icon: Bot, tip: "Agents", badge: agents.length || undefined },
            { key: "projects" as RightTab, icon: FolderKanban, tip: "Projects" },
            { key: "store" as RightTab, icon: Store, tip: "Store" },
          ]).map(({ key, icon: Icon, tip, badge }) => (
            <button
              key={key}
              onClick={() => { setRightTab(key); setRightPanelOpen(true); }}
              title={tip}
              className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all relative ${
                rightTab === key && rightPanelOpen
                  ? "text-[var(--text-primary)] bg-[var(--bg-elevated)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
              }`}
            >
              <Icon size={18} />
              {rightTab === key && rightPanelOpen && (
                <div className="absolute right-0 top-2 bottom-2 w-[2px] rounded-l bg-[var(--accent)]" />
              )}
              {badge && badge > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[8px] font-bold flex items-center justify-center">
                  {badge}
                </div>
              )}
            </button>
          ))}

          <div className="flex-1" />

          {/* Toggle panel */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title={rightPanelOpen ? "Close panel" : "Open panel"}
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
          >
            {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        {rightPanelOpen && (
          <>
          <ResizeHandle direction="horizontal" onResize={(d) => setRightSidebarWidth((w) => Math.max(280, Math.min(600, w - d)))} />
          <div className="flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border)] animate-slide-in" style={{ width: rightSidebarWidth, minWidth: 280 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {rightTab === "agents" ? "Agents" : rightTab === "projects" ? "Projects" : "Store"}
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightTab === "agents" && (
                <AgentPanel projectPath={projectPath || "/home/manta"} />
              )}
              {rightTab === "projects" && (
                <ProjectPanel
                  projectPath={projectPath || "/home/manta"}
                  onSwitchToAgents={() => setRightTab("agents")}
                />
              )}
              {rightTab === "store" && <StorePanel />}
            </div>
          </div>
          </>
        )}
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="flex items-center justify-between px-3 py-1 bg-[var(--accent)] text-white/90 text-[10px] select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium">
            <Code2 size={10} />
            IDEManta
          </span>
          {projectPath && (
            <span className="flex items-center gap-1 opacity-80 truncate max-w-[200px]">
              <FolderOpen size={10} />
              {projectPath.split("/").pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {runningCount > 0 && (
            <span className="flex items-center gap-1">
              <Zap size={10} />
              {runningCount} running
            </span>
          )}
          {waitingCount > 0 && (
            <span className="flex items-center gap-1 opacity-80">
              <CircleDot size={10} />
              {waitingCount} ready
            </span>
          )}
          <span className="flex items-center gap-1 opacity-80">
            <Bot size={10} />
            {agents.length} agents
          </span>
          <span className="flex items-center gap-1 opacity-80">
            <Cpu size={10} />
            {totalMessages} msgs
          </span>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 99990 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] shadow-lg shadow-black/30 text-[12px] text-[var(--text-primary)] animate-slide-in"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--green)]" />
            {n.text}
          </div>
        ))}
      </div>

      <SettingsModal />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}

export default App;
