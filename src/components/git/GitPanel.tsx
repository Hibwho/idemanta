import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  GitBranch, RefreshCw, Plus, Minus, FileCode,
  Check, Loader2, FileDiff,
} from "lucide-react";

interface GitFile {
  status: string;
  path: string;
}

export function GitPanel({ projectPath }: { projectPath: string }) {
  const [branch, setBranch] = useState("");
  const [files, setFiles] = useState<GitFile[]>([]);
  const [commitMsg, setCommitMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [isRepo, setIsRepo] = useState(false);

  const refresh = async () => {
    if (!projectPath) return;
    setLoading(true);
    try {
      // Check if git repo
      await invoke<string>("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "rev-parse", "--git-dir"],
      });
      setIsRepo(true);

      // Get branch
      const br = await invoke<string>("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "branch", "--show-current"],
      });
      setBranch(br.trim());

      // Get status
      const status = await invoke<string>("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "status", "--porcelain"],
      });
      const parsed = status
        .split("\n")
        .filter(Boolean)
        .map((line) => ({
          status: line.substring(0, 2).trim(),
          path: line.substring(3),
        }));
      setFiles(parsed);
    } catch {
      setIsRepo(false);
      setFiles([]);
      setBranch("");
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [projectPath]);

  const handleStage = async (path: string) => {
    try {
      await invoke("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "add", path],
      });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleUnstage = async (path: string) => {
    try {
      await invoke("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "reset", "HEAD", path],
      });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleStageAll = async () => {
    try {
      await invoke("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "add", "-A"],
      });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleCommit = async () => {
    if (!commitMsg.trim()) return;
    setCommitting(true);
    try {
      await invoke("run_shell_command", {
        command: "git",
        args: ["-C", projectPath, "commit", "-m", commitMsg],
      });
      setCommitMsg("");
      refresh();
    } catch (e) {
      console.error(e);
      alert(`Commit failed: ${e}`);
    }
    setCommitting(false);
  };

  const statusIcon = (s: string) => {
    if (s === "M" || s === "MM") return <FileDiff size={13} className="text-[var(--yellow)]" />;
    if (s === "A") return <Plus size={13} className="text-[var(--green)]" />;
    if (s === "D") return <Minus size={13} className="text-[var(--red)]" />;
    if (s === "??" || s === "?") return <Plus size={13} className="text-[var(--text-muted)]" />;
    return <FileCode size={13} className="text-[var(--text-muted)]" />;
  };

  const staged = files.filter((f) => "MADR".includes(f.status[0]) && f.status[0] !== "?");
  const unstaged = files.filter((f) => !staged.includes(f));

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[11px] text-[var(--text-muted)] px-4 text-center">
        <GitBranch size={24} className="mb-2 opacity-30" />
        Open a folder to view source control
      </div>
    );
  }

  if (!isRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[11px] text-[var(--text-muted)] px-4 text-center">
        <GitBranch size={24} className="mb-2 opacity-30" />
        Not a git repository
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5 text-[12px]">
          <GitBranch size={13} className="text-[var(--accent)]" />
          <span className="font-medium text-[var(--text-primary)]">{branch || "main"}</span>
        </div>
        <button
          onClick={refresh}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        </button>
      </div>

      {/* Commit input */}
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <input
          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] mb-1.5"
          placeholder="Commit message..."
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommit()}
        />
        <div className="flex gap-1.5">
          <button
            onClick={handleCommit}
            disabled={!commitMsg.trim() || committing || staged.length === 0}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded-md font-medium cursor-pointer transition-colors bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {committing ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Commit
          </button>
          <button
            onClick={handleStageAll}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
          >
            <Plus size={11} />
            Stage All
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 && (
          <div className="px-4 py-8 text-[11px] text-[var(--text-muted)] text-center">
            <Check size={20} className="mx-auto mb-2 opacity-30" />
            No changes
          </div>
        )}

        {staged.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-[var(--green)] uppercase tracking-wider">
              Staged ({staged.length})
            </div>
            {staged.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1 text-[11px] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
              >
                {statusIcon(f.status)}
                <span className="flex-1 truncate text-[var(--text-secondary)]">{f.path}</span>
                <button
                  onClick={() => handleUnstage(f.path)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] cursor-pointer p-0.5 rounded transition-all"
                  title="Unstage"
                >
                  <Minus size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {unstaged.length > 0 && (
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Changes ({unstaged.length})
            </div>
            {unstaged.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1 text-[11px] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
              >
                {statusIcon(f.status)}
                <span className="flex-1 truncate text-[var(--text-secondary)]">{f.path}</span>
                <button
                  onClick={() => handleStage(f.path)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--green)] cursor-pointer p-0.5 rounded transition-all"
                  title="Stage"
                >
                  <Plus size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
