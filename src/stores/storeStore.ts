import { create } from "zustand";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: "mcp" | "skill" | "agent" | "tool";
  source: "npm" | "github" | "pip";
  package: string; // npm package name or github url
  command?: string; // custom install command
  args?: string[]; // args for mcp add
  installed: boolean;
  stars?: number;
  author?: string;
  icon?: string;
}

interface StoreState {
  items: StoreItem[];
  searchQuery: string;
  activeCategory: string;
  installing: Set<string>;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: string) => void;
  setInstalled: (id: string, installed: boolean) => void;
  setInstalling: (id: string, value: boolean) => void;
  addItem: (item: StoreItem) => void;
}

// Curated list of popular MCP servers and extensions
const STORE_ITEMS: StoreItem[] = [
  // MCP Servers
  {
    id: "mcp-filesystem",
    name: "Filesystem",
    description: "Read, write, and manage files with advanced operations",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-filesystem",
    args: ["/home"],
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-github",
    name: "GitHub",
    description: "Interact with GitHub repos, issues, PRs, and actions",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-github",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-postgres",
    name: "PostgreSQL",
    description: "Query and manage PostgreSQL databases",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-postgres",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-brave",
    name: "Brave Search",
    description: "Web search via Brave Search API",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-brave-search",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-memory",
    name: "Memory",
    description: "Persistent memory and knowledge graph for agents",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-memory",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-puppeteer",
    name: "Puppeteer",
    description: "Browser automation and web scraping",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-puppeteer",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-sqlite",
    name: "SQLite",
    description: "Query and manage SQLite databases",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-sqlite",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-slack",
    name: "Slack",
    description: "Send messages, read channels, manage Slack workspace",
    category: "mcp",
    source: "npm",
    package: "@anthropic-ai/mcp-server-slack",
    installed: false,
    author: "Anthropic",
  },
  {
    id: "mcp-linear",
    name: "Linear",
    description: "Manage issues, projects, and teams in Linear",
    category: "mcp",
    source: "npm",
    package: "mcp-linear",
    installed: false,
    author: "Community",
  },
  {
    id: "mcp-docker",
    name: "Docker",
    description: "Manage Docker containers, images, and compose",
    category: "mcp",
    source: "npm",
    package: "mcp-docker",
    installed: false,
    author: "Community",
  },
  // Skills & Tools
  {
    id: "claude-skills",
    name: "Claude Skills Pack",
    description: "220+ skills for coding, marketing, product, compliance",
    category: "skill",
    source: "github",
    package: "alirezarezvani/claude-skills",
    installed: false,
    stars: 5200,
    author: "alirezarezvani",
  },
  {
    id: "ecc",
    name: "Everything Claude Code",
    description: "30 agents, 135 skills, 60 commands for Claude Code",
    category: "skill",
    source: "github",
    package: "anthropics/everything-claude-code",
    installed: false,
    stars: 118000,
    author: "Anthropic",
  },
  {
    id: "ruflo",
    name: "Ruflo",
    description: "Multi-agent orchestration with 100+ specialized agents",
    category: "agent",
    source: "npm",
    package: "ruflo",
    installed: true,
    stars: 25000,
    author: "ruvnet",
  },
  {
    id: "claude-devtools",
    name: "Claude DevTools",
    description: "Observability dashboard for Claude Code sessions",
    category: "tool",
    source: "github",
    package: "matt1398/claude-devtools",
    installed: false,
    author: "matt1398",
  },
  {
    id: "pixel-agents",
    name: "Pixel Agents",
    description: "Visual pixel art agent monitoring for VS Code",
    category: "tool",
    source: "github",
    package: "pablodelucca/pixel-agents",
    installed: false,
    author: "pablodelucca",
  },
  {
    id: "claude-peers",
    name: "Claude Peers MCP",
    description: "Multi Claude Code sessions coordination on same machine",
    category: "mcp",
    source: "github",
    package: "anthropics/claude-peers-mcp",
    installed: false,
    author: "Community",
  },
];

export const useStoreStore = create<StoreState>((set) => ({
  items: STORE_ITEMS,
  searchQuery: "",
  activeCategory: "all",
  installing: new Set<string>(),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (c) => set({ activeCategory: c }),
  setInstalled: (id, installed) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, installed } : i)),
    })),
  setInstalling: (id, value) =>
    set((state) => {
      const next = new Set(state.installing);
      if (value) next.add(id); else next.delete(id);
      return { installing: next };
    }),
  addItem: (item) =>
    set((state) => {
      if (state.items.some((i) => i.id === item.id)) return state;
      return { items: [...state.items, item] };
    }),
}));
