import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
// markdown preview will be added later
import { useEditorStore } from "../../stores/editorStore";
import { getRecentPaths } from "../../lib/persistence";
import { X, Code2, FileCode, FileJson, FileText, File, Cog, Image, Terminal, FileType, ChevronRight, FolderOpen, Clock, Bot, Keyboard, Map, Eye, EyeOff } from "lucide-react";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, { icon: typeof File; color: string }> = {
    ts:   { icon: FileCode, color: "#3B82F6" },
    tsx:  { icon: FileCode, color: "#3B82F6" },
    js:   { icon: FileCode, color: "#EAB308" },
    jsx:  { icon: FileCode, color: "#EAB308" },
    rs:   { icon: FileCode, color: "#F97316" },
    py:   { icon: FileCode, color: "#10B981" },
    json: { icon: FileJson, color: "#EAB308" },
    toml: { icon: Cog, color: "#6B7280" },
    yaml: { icon: Cog, color: "#6B7280" },
    yml:  { icon: Cog, color: "#6B7280" },
    md:   { icon: FileText, color: "#94A3B8" },
    css:  { icon: FileType, color: "#A855F7" },
    html: { icon: FileCode, color: "#F97316" },
    sh:   { icon: Terminal, color: "#10B981" },
    png:  { icon: Image, color: "#EC4899" },
    jpg:  { icon: Image, color: "#EC4899" },
    svg:  { icon: Image, color: "#EC4899" },
  };
  const match = map[ext];
  if (match) {
    const Icon = match.icon;
    return <Icon size={13} style={{ color: match.color }} />;
  }
  return <File size={13} style={{ color: "#6B7280" }} />;
}

function WelcomeTab() {
  const recentPaths = getRecentPaths();

  return (
    <div className="flex items-center justify-center h-full dot-pattern">
      <div className="text-center animate-fade-in max-w-[480px]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)]/15 to-transparent flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/10 glow-accent">
          <Code2 size={32} className="text-[var(--accent)]" />
        </div>
        <div className="text-2xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">IDEManta</div>
        <div className="text-[13px] text-[var(--text-muted)] mb-8">Multi-Agent IDE</div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-left">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30 cursor-pointer transition-all">
            <FolderOpen size={16} className="text-[var(--accent)]" />
            <div>
              <div className="text-[12px] font-medium text-[var(--text-primary)]">Open Folder</div>
              <div className="text-[10px] text-[var(--text-muted)]">Ctrl+O</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30 cursor-pointer transition-all">
            <Bot size={16} className="text-[var(--green)]" />
            <div>
              <div className="text-[12px] font-medium text-[var(--text-primary)]">New Agent</div>
              <div className="text-[10px] text-[var(--text-muted)]">Ctrl+N</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30 cursor-pointer transition-all">
            <Keyboard size={16} className="text-[var(--yellow)]" />
            <div>
              <div className="text-[12px] font-medium text-[var(--text-primary)]">Command Palette</div>
              <div className="text-[10px] text-[var(--text-muted)]">Ctrl+K</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30 cursor-pointer transition-all">
            <Terminal size={16} className="text-[var(--blue)]" />
            <div>
              <div className="text-[12px] font-medium text-[var(--text-primary)]">Terminal</div>
              <div className="text-[10px] text-[var(--text-muted)]">Ctrl+`</div>
            </div>
          </div>
        </div>

        {/* Recent folders */}
        {recentPaths.length > 0 && (
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              <Clock size={10} />
              Recent
            </div>
            <div className="flex flex-col gap-0.5">
              {recentPaths.slice(0, 5).map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  <FolderOpen size={12} className="text-[var(--text-muted)]" />
                  <span className="truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Editor() {
  const { openFiles, activeFilePath, setActiveFile, closeFile, updateFileContent } =
    useEditorStore();
  const [showMinimap, setShowMinimap] = useState(false);
  const isMarkdown = false;

  const activeFile = openFiles.find((f) => f.path === activeFilePath);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      {openFiles.length > 0 && (
        <div className="flex bg-[var(--bg-secondary)] overflow-x-auto" style={{ minHeight: "36px" }}>
          {openFiles.map((file) => {
            const isActive = file.path === activeFilePath;
            return (
              <div
                key={file.path}
                className={`group flex items-center gap-2 px-3 cursor-pointer transition-all relative shrink-0 border-r border-[var(--border)] ${
                  isActive
                    ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                }`}
                style={{ height: "36px" }}
                onClick={() => setActiveFile(file.path)}
              >
                {/* Active indicator - top border */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
                )}

                {/* File icon */}
                {getFileIcon(file.name)}

                {/* File name */}
                <span className="text-[12px] truncate max-w-[120px]">
                  {file.modified && <span className="text-[var(--yellow)] mr-0.5">*</span>}
                  {file.name}
                </span>

                {/* Close button */}
                <button
                  className={`rounded p-0.5 transition-all cursor-pointer ${
                    isActive
                      ? "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      : "opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--red-dim)]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.path);
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
          {/* Spacer + toggles */}
          <div className="flex-1 bg-[var(--bg-secondary)]" />
          {isMarkdown && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Hide preview" : "Show preview"}
              className={`px-2 py-1 cursor-pointer transition-colors shrink-0 ${
                showPreview ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            title={showMinimap ? "Hide minimap" : "Show minimap"}
            className={`px-2 py-1 cursor-pointer transition-colors shrink-0 ${
              showMinimap ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Map size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      {activeFile && (
        <div className="flex items-center gap-0.5 px-3 py-1 bg-[var(--bg-primary)] border-b border-[var(--border)] text-[11px] text-[var(--text-muted)] overflow-x-auto">
          {activeFile.path.split("/").filter(Boolean).map((segment, i, arr) => (
            <span key={i} className="flex items-center gap-0.5 shrink-0">
              {i > 0 && <ChevronRight size={10} className="text-[var(--text-muted)]/40" />}
              <span className={i === arr.length - 1 ? "text-[var(--text-secondary)]" : ""}>{segment}</span>
            </span>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeFile ? (
          <MonacoEditor
            theme="idemanta-dark"
            loading={<div className="flex items-center justify-center h-full text-[var(--text-muted)] text-[12px]">Loading editor...</div>}
            beforeMount={(monaco) => {
              // Limit loaded languages for performance
              monaco.languages.register({ id: "plaintext" });
              monaco.editor.defineTheme("idemanta-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "comment", foreground: "4B5563", fontStyle: "italic" },
                  { token: "keyword", foreground: "A78BFA" },
                  { token: "string", foreground: "34D399" },
                  { token: "number", foreground: "FBBF24" },
                  { token: "type", foreground: "60A5FA" },
                  { token: "function", foreground: "F59E0B" },
                  { token: "variable", foreground: "F1F5F9" },
                ],
                colors: {
                  "editor.background": "#0D1117",
                  "editor.foreground": "#F1F5F9",
                  "editor.lineHighlightBackground": "#111827",
                  "editor.selectionBackground": "#8B5CF630",
                  "editor.inactiveSelectionBackground": "#8B5CF615",
                  "editorCursor.foreground": "#8B5CF6",
                  "editorLineNumber.foreground": "#374151",
                  "editorLineNumber.activeForeground": "#6B7280",
                  "editorIndentGuide.background": "#1F293780",
                  "editorIndentGuide.activeBackground": "#374151",
                  "editorWidget.background": "#111827",
                  "editorWidget.border": "#1F2937",
                  "editorBracketMatch.background": "#8B5CF620",
                  "editorBracketMatch.border": "#8B5CF650",
                },
              });
            }}
            language={activeFile.language}
            value={activeFile.content}
            onChange={(value) => {
              if (value !== undefined) updateFileContent(activeFile.path, value);
            }}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              fontLigatures: true,
              minimap: { enabled: showMinimap },
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              lineHeight: 22,
              letterSpacing: 0.3,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              renderWhitespace: "none",
            }}
          />
        ) : (
          <WelcomeTab />
        )}
      </div>
    </div>
  );
}
