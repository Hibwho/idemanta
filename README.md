# IDEManta

A multi-agent desktop IDE built with Tauri, React, and TypeScript. Orchestrate multiple AI agents, manage projects with teams, and code — all from a single interface.

## Features

- **Multi-Agent System** — Spawn named agents with custom specialities, chat with them in real-time
- **Project Teams** — Auto-generate agent teams based on project description (orchestrator, frontend, backend, security, etc.)
- **Monaco Editor** — Full code editor with custom dark theme, syntax highlighting, auto-save, breadcrumbs
- **Integrated Terminal** — Real PTY terminal with multi-tab support (xterm.js)
- **File Explorer** — Tree view with colored file icons, right-click context menu (new file, rename, delete)
- **Git Integration** — View status, stage/unstage files, commit directly from the sidebar
- **Search** — Full-text search across project files with highlighted matches
- **Extension Store** — Browse and install MCP servers, skills, and tools from a curated catalog or search GitHub
- **Runtime Manager** — Detect installed languages/tools, install missing ones, manage virtual environments
- **Command Palette** — Quick access to all commands (Ctrl+K)
- **Plugin System** — Extensible architecture for custom plugins

## Tech Stack

- **Desktop**: Tauri 2 (Rust + Webview)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Editor**: Monaco Editor
- **Terminal**: xterm.js with PTY
- **State**: Zustand
- **Icons**: Lucide React
- **Build**: Vite 7

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Command Palette |
| Ctrl+O | Open Folder |
| Ctrl+S | Save File |
| Ctrl+W | Close Tab |
| Ctrl+Tab | Next Tab |
| Ctrl+` | Toggle Terminal |
| Ctrl+B | Toggle Right Panel |
| Ctrl+N | New Agent |
| Ctrl+Shift+E | Explorer |
| Ctrl+Shift+F | Search |
| Ctrl+Shift+G | Git |
| Ctrl+Shift+A | Agents Panel |

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (20+)
- [pnpm](https://pnpm.io/)
- An AI coding agent CLI (e.g. `claude` CLI with a subscription)

### Optional

- [Ruflo](https://github.com/ruvnet/ruflo) — Multi-agent orchestration (`npm install -g ruflo`)

### Install and Run

```bash
git clone https://github.com/Hibwho/idemanta.git
cd idemanta
pnpm install
pnpm tauri dev
```

### Platform Support

| Platform | Status |
|----------|--------|
| Linux (X11/Wayland) | Fully tested |
| macOS | Supported (Tauri 2) |
| Windows | Supported (Tauri 2) |

### Build for Production

```bash
pnpm tauri build
```

## License

MIT

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
