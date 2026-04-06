import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
// Use shell command to open URLs in default browser
import { useStoreStore, StoreItem } from "../../stores/storeStore";
import {
  Search, Download, Check, Loader2, Star,
  Server, Puzzle, Bot, Wrench, ExternalLink, Globe,
} from "lucide-react";

const categoryConfig: Record<string, { icon: typeof Server; label: string; color: string }> = {
  mcp:   { icon: Server,  label: "MCP",    color: "var(--blue)" },
  skill: { icon: Puzzle,  label: "Skill",  color: "var(--green)" },
  agent: { icon: Bot,     label: "Agent",  color: "var(--accent)" },
  tool:  { icon: Wrench,  label: "Tool",   color: "var(--yellow)" },
};

function StoreItemCard({ item, onInstalled: _onInstalled }: { item: StoreItem; onInstalled?: () => void }) {
  const { setInstalled, setInstalling, installing, addItem, items } = useStoreStore();
  const isInstalling = installing.has(item.id);
  // Check store for installed status (covers GitHub results too)
  const storeItem = items.find((i) => i.id === item.id);
  const isInstalled = item.installed || storeItem?.installed || false;
  const cat = categoryConfig[item.category];
  const CatIcon = cat.icon;

  const handleInstall = async () => {
    setInstalling(item.id, true);
    try {
      if (item.category === "mcp") {
        const mcpName = item.name.toLowerCase().replace(/\s+/g, "-");
        const args = ["mcp", "add", mcpName, "--", "npx", "-y", item.package];
        if (item.args) args.push(...item.args);
        await invoke("run_shell_command", { command: "claude", args });
      } else if (item.source === "npm") {
        await invoke("run_shell_command", { command: "npm", args: ["install", "-g", item.package] });
      } else if (item.source === "github") {
        const homeDir = await invoke<string>("get_home_dir");
        const safeName = item.package.replace(/\//g, "-");
        const extDir = `${homeDir}/.idemanta/extensions`;
        const destDir = `${extDir}/${safeName}`;
        await invoke("run_shell_command", { command: "mkdir", args: ["-p", extDir] }).catch(() => {});
        await invoke("run_shell_command", { command: "rm", args: ["-rf", destDir] }).catch(() => {});
        await invoke("run_shell_command", {
          command: "git",
          args: ["clone", "--depth", "1", `https://github.com/${item.package}.git`, destDir],
        });
      }
      // Add to store if it was a GitHub search result
      addItem({ ...item, installed: true });
      setInstalled(item.id, true);
    } catch (e) {
      console.error(`Failed to install ${item.name}:`, e);
      alert(`Install failed: ${e}`);
    }
    setInstalling(item.id, false);
  };

  const handleOpenGitHub = async () => {
    const url = item.source === "github"
      ? `https://github.com/${item.package}`
      : item.source === "npm"
      ? `https://www.npmjs.com/package/${item.package}`
      : "";
    if (url) {
      try {
        await invoke("run_shell_command", { command: "xdg-open", args: [url] });
      } catch {
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div className="p-3 mx-2 mb-1.5 rounded-lg bg-[var(--bg-primary)]/40 border border-transparent hover:border-[var(--border-subtle)] transition-all">
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: cat.color + "20" }}
        >
          <CatIcon size={18} style={{ color: cat.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-medium truncate">{item.name}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: cat.color + "20", color: cat.color }}
            >
              {cat.label}
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mb-1.5 line-clamp-2">
            {item.description}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span>{item.author}</span>
            {item.stars && (
              <span className="flex items-center gap-0.5">
                <Star size={9} className="text-[var(--yellow)]" />
                {item.stars >= 1000 ? `${(item.stars / 1000).toFixed(0)}k` : item.stars}
              </span>
            )}
            <a
              className="flex items-center gap-0.5 hover:text-[var(--accent)] cursor-pointer transition-colors"
              onClick={(e) => { e.stopPropagation(); handleOpenGitHub(); }}
            >
              <ExternalLink size={9} />
              {item.source === "github" ? "GitHub" : "npm"}
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-1">
          {isInstalled ? (
            <span className="flex items-center gap-1 text-[11px] text-[var(--green)] px-2 py-1 rounded-md bg-[var(--green-dim)]">
              <Check size={12} />
              Installed
            </span>
          ) : (
            <button
              onClick={handleInstall}
              disabled={isInstalling || isInstalled}
              className="flex items-center gap-1 text-[11px] text-white px-2.5 py-1 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer transition-colors font-medium disabled:opacity-50"
            >
              {isInstalling ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              {isInstalling ? "..." : "Install"}
            </button>
          )}
          <button
            onClick={handleOpenGitHub}
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] px-2 py-0.5 rounded-md hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors justify-center"
          >
            <ExternalLink size={10} />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

function InstalledPlugins() {
  const [plugins, setPlugins] = useState<Array<{ id: string; name: string; path: string; type: string; enabled: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    setLoading(true);
    try {
      const { scanPlugins } = await import("../../lib/plugins");
      const found = await scanPlugins();
      setPlugins(found);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { scan(); }, []);

  if (plugins.length === 0 && !loading) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-md bg-[var(--bg-primary)]/30">
        <Check size={10} className="text-[var(--green)]" />
        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Installed ({plugins.length})
        </span>
      </div>
      {plugins.map((p) => (
        <div key={p.id} className="mx-2 p-2.5 flex items-center gap-2 text-[11px]">
          <div className="w-7 h-7 rounded-lg bg-[var(--green-dim)] flex items-center justify-center">
            <Check size={13} className="text-[var(--green)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-[var(--text-primary)] truncate">{p.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">{p.path}</div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            {p.type}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StorePanel() {
  const { items, searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useStoreStore();
  const [ghResults, setGhResults] = useState<StoreItem[]>([]);
  const [searching, setSearching] = useState(false);

  const categories = ["all", "mcp", "skill", "agent", "tool"];

  const filtered = items.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.package.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const allResults = [...filtered, ...ghResults.filter(
    (gh) => !filtered.some((f) => f.package === gh.package)
  )];

  const installedCount = items.filter((i) => i.installed).length;

  const searchGitHub = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      // Replace spaces with hyphens for GitHub repo name search
      const query = searchQuery.trim().replace(/\s+/g, "-");
      const raw = await invoke<string>("run_shell_command", {
        command: "gh",
        args: ["search", "repos", query, "--json", "fullName,description,stargazersCount,owner", "--limit", "10"],
      });
      const repos = JSON.parse(raw) as Array<{
        fullName: string;
        description: string;
        stargazersCount: number;
        owner: { login: string };
      }>;
      setGhResults(repos.map((r) => ({
        id: `gh-${r.fullName}`,
        name: r.fullName.split("/").pop() || r.fullName,
        description: r.description || "No description",
        category: "tool" as const,
        source: "github" as const,
        package: r.fullName,
        installed: false,
        stars: r.stargazersCount,
        author: r.owner.login,
      })));
    } catch (e) {
      console.error("GitHub search failed:", e);
      // Fallback: try without invoke, using a simpler approach
      try {
        const raw = await invoke<string>("run_ruflo_command", {
          args: ["--version"],
        });
        console.log("ruflo works:", raw);
      } catch {}
      setGhResults([]);
    }
    setSearching(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Store ({items.length} available, {installedCount} installed)
        </span>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2 focus-within:border-[var(--accent)] transition-colors">
          <Search size={12} className="text-[var(--text-muted)] shrink-0" />
          <input
            className="w-full bg-transparent py-1.5 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setGhResults([]); }}
            onKeyDown={(e) => e.key === "Enter" && searchGitHub()}
          />
          <button
            onClick={searchGitHub}
            disabled={searching || !searchQuery.trim()}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors p-0.5 shrink-0"
            title="Search GitHub"
          >
            {searching ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
          </button>
        </div>
        {searchQuery && filtered.length === 0 && ghResults.length === 0 && !searching && (
          <button
            onClick={searchGitHub}
            className="mt-1.5 w-full flex items-center justify-center gap-1.5 text-[11px] py-1.5 rounded-md bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] cursor-pointer transition-colors border border-[var(--border-subtle)]"
          >
            <Globe size={12} />
            Search "{searchQuery}" on GitHub
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 px-3 mb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] px-2 py-1 rounded-md font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/50 border border-transparent"
            }`}
          >
            {cat === "all" ? "All" : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Installed plugins */}
        {!searchQuery && <InstalledPlugins />}

        {allResults.length === 0 && !searching ? (
          <div className="text-center text-[12px] text-[var(--text-muted)] mt-8 px-4">
            No extensions found. Press Enter or click the globe to search GitHub.
          </div>
        ) : (
          <>
            {/* Local results */}
            {filtered.length > 0 && filtered.map((item) => (
              <StoreItemCard key={item.id} item={item} />
            ))}

            {/* GitHub results */}
            {ghResults.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 mx-2 mt-2 mb-1 rounded-md bg-[var(--bg-primary)]/30">
                  <Globe size={10} className="text-[var(--text-muted)]" />
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    GitHub Results
                  </span>
                </div>
                {ghResults.filter((gh) => !filtered.some((f) => f.package === gh.package)).map((item) => (
                  <StoreItemCard key={item.id} item={item} />
                ))}
              </>
            )}

            {searching && (
              <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-[var(--text-muted)]">
                <Loader2 size={14} className="animate-spin" />
                Searching GitHub...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
