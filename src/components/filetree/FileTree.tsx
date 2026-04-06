import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useEditorStore } from "../../stores/editorStore";
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  FileCode, FileJson, FileText, File, FileType,
  Cog, Image, Terminal, Plus, Trash2, Pencil,
} from "lucide-react";
import { createPortal } from "react-dom";

interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
}

function getFileIcon(name: string, isOpen?: boolean) {
  if (isOpen) return <FolderOpen size={14} className="text-[var(--yellow)]" />;

  const ext = name.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, React.ReactNode> = {
    ts:   <FileCode size={14} className="text-blue-400" />,
    tsx:  <FileCode size={14} className="text-blue-400" />,
    js:   <FileCode size={14} className="text-yellow-400" />,
    jsx:  <FileCode size={14} className="text-yellow-400" />,
    rs:   <FileCode size={14} className="text-orange-400" />,
    py:   <FileCode size={14} className="text-green-400" />,
    json: <FileJson size={14} className="text-yellow-300" />,
    toml: <Cog size={14} className="text-[var(--text-muted)]" />,
    yaml: <Cog size={14} className="text-[var(--text-muted)]" />,
    yml:  <Cog size={14} className="text-[var(--text-muted)]" />,
    md:   <FileText size={14} className="text-[var(--text-secondary)]" />,
    css:  <FileType size={14} className="text-purple-400" />,
    html: <FileCode size={14} className="text-orange-300" />,
    sh:   <Terminal size={14} className="text-green-300" />,
    png:  <Image size={14} className="text-pink-400" />,
    jpg:  <Image size={14} className="text-pink-400" />,
    svg:  <Image size={14} className="text-pink-400" />,
  };
  return iconMap[ext] || <File size={14} className="text-[var(--text-muted)]" />;
}

interface ContextMenuState {
  x: number;
  y: number;
  entry: FileEntry;
}

function ContextMenu({ state, onClose, onRefresh }: {
  state: ContextMenuState;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleNewFile = async () => {
    const name = prompt("New file name:");
    if (!name) return;
    const dir = state.entry.is_dir ? state.entry.path : state.entry.path.replace(/\/[^/]+$/, "");
    try {
      await invoke("run_shell_command", { command: "touch", args: [`${dir}/${name}`] });
      onRefresh();
    } catch (e) { console.error(e); }
    onClose();
  };

  const handleNewFolder = async () => {
    const name = prompt("New folder name:");
    if (!name) return;
    const dir = state.entry.is_dir ? state.entry.path : state.entry.path.replace(/\/[^/]+$/, "");
    try {
      await invoke("run_shell_command", { command: "mkdir", args: ["-p", `${dir}/${name}`] });
      onRefresh();
    } catch (e) { console.error(e); }
    onClose();
  };

  const handleRename = async () => {
    const newName = prompt("Rename to:", state.entry.name);
    if (!newName || newName === state.entry.name) return;
    const dir = state.entry.path.replace(/\/[^/]+$/, "");
    try {
      await invoke("run_shell_command", { command: "mv", args: [state.entry.path, `${dir}/${newName}`] });
      onRefresh();
    } catch (e) { console.error(e); }
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${state.entry.name}"?`)) return;
    try {
      await invoke("run_shell_command", {
        command: "rm",
        args: state.entry.is_dir ? ["-rf", state.entry.path] : [state.entry.path],
      });
      onRefresh();
    } catch (e) { console.error(e); }
    onClose();
  };

  const items = [
    { label: "New File", icon: Plus, action: handleNewFile },
    { label: "New Folder", icon: Folder, action: handleNewFolder },
    { separator: true },
    { label: "Rename", icon: Pencil, action: handleRename },
    { label: "Delete", icon: Trash2, action: handleDelete, danger: true },
  ];

  return createPortal(
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={onClose} />
      <div
        ref={ref}
        style={{
          position: "fixed",
          zIndex: 99999,
          top: state.y,
          left: state.x,
          minWidth: "160px",
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "4px 0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {items.map((item, i) =>
          "separator" in item ? (
            <div key={i} style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />
          ) : (
            <button
              key={i}
              onClick={item.action}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left cursor-pointer transition-colors ${
                item.danger
                  ? "text-[var(--red)] hover:bg-[var(--red-dim)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-glow)]"
              }`}
              style={{ background: "transparent", border: "none" }}
            >
              <item.icon size={13} />
              {item.label}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
}

function FileNode({ entry, depth, onRefresh }: { entry: FileEntry; depth: number; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const { openFile, activeFilePath, modifiedPaths } = useEditorStore();
  const isModified = modifiedPaths.has(entry.path);

  const handleClick = async () => {
    if (entry.is_dir) {
      setExpanded(!expanded);
    } else {
      try {
        const content = await invoke<string>("read_file_content", { path: entry.path });
        openFile({ path: entry.path, name: entry.name, content, language: "", modified: false });
      } catch (e) {
        console.error("Failed to read file:", e);
      }
    }
  };

  const isActive = activeFilePath === entry.path;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-1.5 py-[3px] cursor-pointer text-[12px] transition-colors select-none ${
          isActive
            ? "bg-[var(--accent-glow)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/60 hover:text-[var(--text-primary)]"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={handleClick}
      >
        {entry.is_dir ? (
          <>
            {expanded ? <ChevronDown size={12} className="text-[var(--text-muted)] shrink-0" /> : <ChevronRight size={12} className="text-[var(--text-muted)] shrink-0" />}
            {expanded ? <FolderOpen size={14} className="text-[var(--yellow)] shrink-0" /> : <Folder size={14} className="text-[var(--yellow)] shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            {getFileIcon(entry.name)}
          </>
        )}
        <span className={`truncate ${entry.is_dir ? "font-medium" : ""} ${isModified ? "text-[var(--yellow)]" : ""}`}>
          {isModified && <span className="mr-0.5">*</span>}{entry.name}
        </span>
      </div>
      {entry.is_dir && expanded && entry.children?.map((child) => (
        <FileNode key={child.path} entry={child} depth={depth + 1} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

export function FileTree({ projectPath }: { projectPath: string }) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const loadFiles = () => {
    if (projectPath) {
      invoke<FileEntry[]>("get_project_files", { path: projectPath })
        .then(setFiles)
        .catch(console.error);
    }
  };

  useEffect(() => { loadFiles(); }, [projectPath]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Find closest file entry from the event target
    const target = e.target as HTMLElement;
    const row = target.closest("[data-filepath]");
    if (row) {
      const path = row.getAttribute("data-filepath") || "";
      const isDir = row.getAttribute("data-isdir") === "true";
      const name = row.getAttribute("data-filename") || "";
      setContextMenu({ x: e.clientX, y: e.clientY, entry: { path, is_dir: isDir, name } });
    } else {
      // Right-click on empty space = root folder context
      setContextMenu({
        x: e.clientX, y: e.clientY,
        entry: { path: projectPath, is_dir: true, name: projectPath.split("/").pop() || "" },
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto py-1" onContextMenu={handleContextMenu}>
      <div className="px-4 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
        {projectPath ? projectPath.split("/").pop() : "Explorer"}
      </div>
      {files.length === 0 && !projectPath && (
        <div className="px-4 py-6 text-[11px] text-[var(--text-muted)] text-center">
          Enter a path to browse files
        </div>
      )}
      {files.map((entry) => (
        <div key={entry.path} data-filepath={entry.path} data-isdir={String(entry.is_dir)} data-filename={entry.name}>
          <FileNode entry={entry} depth={0} onRefresh={loadFiles} />
        </div>
      ))}
      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={() => setContextMenu(null)}
          onRefresh={loadFiles}
        />
      )}
    </div>
  );
}
