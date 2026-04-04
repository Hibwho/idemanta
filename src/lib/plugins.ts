import { invoke } from "@tauri-apps/api/core";

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  path: string;
  type: "mcp" | "skill" | "theme" | "extension";
  config?: Record<string, unknown>;
}

export interface PluginManager {
  plugins: Plugin[];
  loadPlugins: () => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
  installPlugin: (source: string) => Promise<Plugin>;
  uninstallPlugin: (id: string) => Promise<void>;
}

async function getExtensionsDir(): Promise<string> {
  const home = await invoke<string>("get_home_dir");
  return `${home}/.idemanta/extensions`;
}

/**
 * Scan installed extensions and build plugin registry
 */
export async function scanPlugins(): Promise<Plugin[]> {
  try {
    const pluginsDir = await getExtensionsDir();
    const raw = await invoke<string>("run_shell_command", {
      command: "ls",
      args: ["-1", pluginsDir],
    });

    const dirs = raw.split("\n").filter(Boolean);
    const plugins: Plugin[] = [];

    for (const dir of dirs) {
      const pluginPath = `${pluginsDir}/${dir}`;
      try {
        // Try to read plugin manifest (package.json or plugin.json)
        let manifest: Record<string, string> = { name: dir, version: "0.0.0", description: "" };
        try {
          const pkg = await invoke<string>("read_file_content", { path: `${pluginPath}/package.json` });
          manifest = JSON.parse(pkg);
        } catch {
          try {
            const claude = await invoke<string>("read_file_content", { path: `${pluginPath}/CLAUDE.md` });
            manifest.description = claude.split("\n").find((l: string) => l && !l.startsWith("#"))?.trim() || "";
          } catch {}
        }

        plugins.push({
          id: dir,
          name: manifest.name || dir,
          version: manifest.version || "0.0.0",
          description: manifest.description || `Extension: ${dir}`,
          author: (manifest as Record<string, string>).author || "Unknown",
          enabled: true,
          path: pluginPath,
          type: detectPluginType(pluginPath, manifest),
        });
      } catch {}
    }

    return plugins;
  } catch {
    return [];
  }
}

function detectPluginType(path: string, manifest: Record<string, string>): Plugin["type"] {
  const name = (manifest.name || path).toLowerCase();
  if (name.includes("mcp") || name.includes("server")) return "mcp";
  if (name.includes("skill")) return "skill";
  if (name.includes("theme")) return "theme";
  return "extension";
}

/**
 * Enable an MCP plugin by adding it to Claude Code
 */
export async function enableMcpPlugin(plugin: Plugin): Promise<void> {
  if (plugin.type !== "mcp") return;
  try {
    await invoke("run_shell_command", {
      command: "claude",
      args: ["mcp", "add", plugin.id, "--", "node", `${plugin.path}/index.js`],
    });
  } catch (e) {
    console.error(`Failed to enable MCP plugin ${plugin.id}:`, e);
  }
}

/**
 * Disable an MCP plugin
 */
export async function disableMcpPlugin(plugin: Plugin): Promise<void> {
  if (plugin.type !== "mcp") return;
  try {
    await invoke("run_shell_command", {
      command: "claude",
      args: ["mcp", "remove", plugin.id],
    });
  } catch (e) {
    console.error(`Failed to disable MCP plugin ${plugin.id}:`, e);
  }
}

/**
 * Save plugin config
 */
export async function savePluginConfig(plugins: Plugin[]): Promise<void> {
  const config = plugins.map((p) => ({
    id: p.id,
    enabled: p.enabled,
    config: p.config,
  }));
  try {
    await invoke("run_shell_command", {
      command: "bash",
      args: ["-c", `echo '${JSON.stringify(config)}' > ${PLUGINS_CONFIG}`],
    });
  } catch {}
}
