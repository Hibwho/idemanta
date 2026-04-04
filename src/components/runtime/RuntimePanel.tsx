import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Package, Download, Check, Loader2, RefreshCw,
  Plus, Trash2, FolderOpen, Play, Box,
} from "lucide-react";

interface Runtime {
  name: string;
  command: string;
  version: string | null;
  installed: boolean;
  installCmd: string;
  icon: string;
  category: "language" | "tool" | "package-manager";
}

interface Environment {
  name: string;
  type: "python-venv" | "node" | "docker" | "custom";
  path: string;
  active: boolean;
}

const RUNTIMES: Omit<Runtime, "version" | "installed">[] = [
  // Languages
  { name: "Python", command: "python3", installCmd: "sudo pacman -S python --noconfirm", icon: "PY", category: "language" },
  { name: "Node.js", command: "node", installCmd: "sudo pacman -S nodejs --noconfirm", icon: "JS", category: "language" },
  { name: "Rust", command: "rustc", installCmd: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", icon: "RS", category: "language" },
  { name: "Go", command: "go", installCmd: "sudo pacman -S go --noconfirm", icon: "GO", category: "language" },
  { name: "Java", command: "java", installCmd: "sudo pacman -S jdk-openjdk --noconfirm", icon: "JV", category: "language" },
  { name: "Ruby", command: "ruby", installCmd: "sudo pacman -S ruby --noconfirm", icon: "RB", category: "language" },
  { name: "PHP", command: "php", installCmd: "sudo pacman -S php --noconfirm", icon: "HP", category: "language" },
  // Tools
  { name: "Docker", command: "docker", installCmd: "sudo pacman -S docker --noconfirm", icon: "DK", category: "tool" },
  { name: "Git", command: "git", installCmd: "sudo pacman -S git --noconfirm", icon: "GT", category: "tool" },
  { name: "Nginx", command: "nginx", installCmd: "sudo pacman -S nginx --noconfirm", icon: "NX", category: "tool" },
  { name: "Redis", command: "redis-server", installCmd: "sudo pacman -S redis --noconfirm", icon: "RD", category: "tool" },
  { name: "PostgreSQL", command: "psql", installCmd: "sudo pacman -S postgresql --noconfirm", icon: "PG", category: "tool" },
  { name: "SQLite", command: "sqlite3", installCmd: "sudo pacman -S sqlite --noconfirm", icon: "SQ", category: "tool" },
  // Package managers
  { name: "pip", command: "pip", installCmd: "python3 -m ensurepip", icon: "PP", category: "package-manager" },
  { name: "pnpm", command: "pnpm", installCmd: "npm install -g pnpm", icon: "PM", category: "package-manager" },
  { name: "yarn", command: "yarn", installCmd: "npm install -g yarn", icon: "YN", category: "package-manager" },
  { name: "cargo", command: "cargo", installCmd: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", icon: "CG", category: "package-manager" },
  { name: "uv", command: "uv", installCmd: "curl -LsSf https://astral.sh/uv/install.sh | sh", icon: "UV", category: "package-manager" },
];

const categoryLabels: Record<string, string> = {
  "language": "Languages",
  "tool": "Tools",
  "package-manager": "Package Managers",
};

const categoryColors: Record<string, string> = {
  "language": "var(--accent)",
  "tool": "var(--blue)",
  "package-manager": "var(--green)",
};

export function RuntimePanel({ projectPath }: { projectPath: string }) {
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [showNewEnv, setShowNewEnv] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvType, setNewEnvType] = useState<Environment["type"]>("python-venv");
  const [tab, setTab] = useState<"runtimes" | "environments">("runtimes");

  const detectRuntimes = async () => {
    setLoading(true);
    const results: Runtime[] = [];
    for (const rt of RUNTIMES) {
      try {
        const ver = await invoke<string>("run_shell_command", {
          command: rt.command,
          args: ["--version"],
        });
        results.push({ ...rt, version: ver.trim().split("\n")[0], installed: true });
      } catch {
        results.push({ ...rt, version: null, installed: false });
      }
    }
    setRuntimes(results);
    setLoading(false);
  };

  const detectEnvironments = async () => {
    const envs: Environment[] = [];
    if (!projectPath) return;

    // Check for Python venv
    try {
      await invoke<string>("run_shell_command", { command: "test", args: ["-d", `${projectPath}/.venv`] });
      envs.push({ name: ".venv", type: "python-venv", path: `${projectPath}/.venv`, active: false });
    } catch {}
    try {
      await invoke<string>("run_shell_command", { command: "test", args: ["-d", `${projectPath}/venv`] });
      envs.push({ name: "venv", type: "python-venv", path: `${projectPath}/venv`, active: false });
    } catch {}

    // Check for node_modules
    try {
      await invoke<string>("run_shell_command", { command: "test", args: ["-d", `${projectPath}/node_modules`] });
      envs.push({ name: "node_modules", type: "node", path: `${projectPath}/node_modules`, active: true });
    } catch {}

    // Check for docker-compose
    try {
      await invoke<string>("run_shell_command", { command: "test", args: ["-f", `${projectPath}/docker-compose.yml`] });
      envs.push({ name: "Docker Compose", type: "docker", path: `${projectPath}/docker-compose.yml`, active: false });
    } catch {}

    setEnvironments(envs);
  };

  useEffect(() => { detectRuntimes(); detectEnvironments(); }, [projectPath]);

  const handleInstall = async (rt: Runtime) => {
    setInstalling(rt.name);
    try {
      await invoke("run_shell_command", {
        command: "bash",
        args: ["-c", rt.installCmd],
      });
      await detectRuntimes();
    } catch (e) {
      alert(`Install failed. Run manually in terminal:\n${rt.installCmd}`);
    }
    setInstalling(null);
  };

  const handleCreateEnv = async () => {
    if (!newEnvName.trim() || !projectPath) return;
    try {
      if (newEnvType === "python-venv") {
        await invoke("run_shell_command", {
          command: "python3",
          args: ["-m", "venv", `${projectPath}/${newEnvName}`],
        });
      } else if (newEnvType === "node") {
        await invoke("run_shell_command", {
          command: "bash",
          args: ["-c", `cd ${projectPath} && mkdir -p ${newEnvName} && cd ${newEnvName} && npm init -y`],
        });
      } else if (newEnvType === "docker") {
        await invoke("run_shell_command", {
          command: "bash",
          args: ["-c", `cat > ${projectPath}/docker-compose.yml << 'EOF'\nversion: "3.8"\nservices:\n  app:\n    image: node:20-alpine\n    working_dir: /app\n    volumes:\n      - .:/app\n    command: sh\nEOF`],
        });
      }
      setShowNewEnv(false);
      setNewEnvName("");
      detectEnvironments();
    } catch (e) {
      alert(`Failed to create environment: ${e}`);
    }
  };

  const handleDeleteEnv = async (env: Environment) => {
    if (!confirm(`Delete environment "${env.name}"?`)) return;
    try {
      await invoke("run_shell_command", { command: "rm", args: ["-rf", env.path] });
      detectEnvironments();
    } catch {}
  };

  const installedCount = runtimes.filter((r) => r.installed).length;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(["runtimes", "environments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-[11px] font-medium cursor-pointer transition-colors capitalize ${
              tab === t
                ? "text-[var(--text-primary)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "runtimes" ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
              {installedCount}/{runtimes.length} installed
            </span>
            <button
              onClick={detectRuntimes}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer p-1 rounded hover:bg-[var(--bg-tertiary)]"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {(["language", "tool", "package-manager"] as const).map((cat) => {
              const items = runtimes.filter((r) => r.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: categoryColors[cat] }}>
                    {categoryLabels[cat]}
                  </div>
                  {items.map((rt, i) => (
                    <div key={rt.name} className={`flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-elevated)]/30 transition-colors ${i < items.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold font-mono shrink-0"
                        style={{
                          backgroundColor: rt.installed ? `${categoryColors[cat]}20` : "var(--bg-tertiary)",
                          color: rt.installed ? categoryColors[cat] : "var(--text-muted)",
                        }}
                      >
                        {rt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-[var(--text-primary)]">{rt.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">
                          {rt.installed ? rt.version : "Not installed"}
                        </div>
                      </div>
                      {rt.installed ? (
                        <Check size={13} className="text-[var(--green)] shrink-0" />
                      ) : (
                        <button
                          onClick={() => handleInstall(rt)}
                          disabled={installing === rt.name}
                          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                        >
                          {installing === rt.name ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Environments */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
              Environments ({environments.length})
            </span>
            <button
              onClick={() => setShowNewEnv(!showNewEnv)}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer p-1 rounded hover:bg-[var(--accent-glow)] transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {showNewEnv && (
            <div className="p-3 mx-2 mb-2 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border)] animate-slide-in">
              <input
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="Environment name (e.g. .venv, test-env)"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                autoFocus
              />
              <select
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] mb-2 focus:outline-none focus:border-[var(--accent)]"
                value={newEnvType}
                onChange={(e) => setNewEnvType(e.target.value as Environment["type"])}
              >
                <option value="python-venv">Python venv</option>
                <option value="node">Node.js project</option>
                <option value="docker">Docker Compose</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateEnv}
                  disabled={!newEnvName.trim()}
                  className="flex-1 text-[12px] py-1.5 rounded-md font-medium cursor-pointer bg-[var(--green)] text-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewEnv(false)}
                  className="flex-1 text-[12px] py-1.5 rounded-md bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-1">
            {environments.length === 0 && !showNewEnv && (
              <div className="text-center text-[11px] text-[var(--text-muted)] mt-8 px-4">
                <Box size={24} className="mx-auto mb-2 opacity-30" />
                No environments detected.
                {projectPath ? " Create one above." : " Open a folder first."}
              </div>
            )}
            {environments.map((env) => (
              <div key={env.path} className="flex items-center gap-2 mx-2 p-2.5 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border)] mb-1.5 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
                  backgroundColor: env.type === "python-venv" ? "var(--green-dim)" : env.type === "docker" ? "var(--blue-dim)" : "var(--yellow-dim)"
                }}>
                  {env.type === "docker" ? <Box size={15} className="text-[var(--blue)]" /> :
                   env.type === "python-venv" ? <Package size={15} className="text-[var(--green)]" /> :
                   <Package size={15} className="text-[var(--yellow)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--text-primary)]">{env.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">{env.type} - {env.path.replace(projectPath + "/", "")}</div>
                </div>
                <button
                  onClick={() => handleDeleteEnv(env)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] cursor-pointer p-1 rounded hover:bg-[var(--red-dim)] transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
