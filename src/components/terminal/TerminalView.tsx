import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

export function TerminalView({ cwd, id }: { cwd?: string; id?: string }) {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!termRef.current || initialized) return;

    const term = new Terminal({
      theme: {
        background: "#0D1117",
        foreground: "#F1F5F9",
        cursor: "#8B5CF6",
        cursorAccent: "#0A0E1A",
        selectionBackground: "rgba(139, 92, 246, 0.3)",
        black: "#0A0E1A",
        red: "#EF4444",
        green: "#10B981",
        yellow: "#F59E0B",
        blue: "#3B82F6",
        magenta: "#8B5CF6",
        cyan: "#06B6D4",
        white: "#F1F5F9",
        brightBlack: "#4B5563",
        brightRed: "#F87171",
        brightGreen: "#34D399",
        brightYellow: "#FBBF24",
        brightBlue: "#60A5FA",
        brightMagenta: "#A78BFA",
        brightCyan: "#22D3EE",
        brightWhite: "#FFFFFF",
      },
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      lineHeight: 1.3,
      cursorBlink: true,
      cursorStyle: "bar",
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(termRef.current);

    // Fit to container
    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = term;
    fitRef.current = fitAddon;

    // Send input to backend PTY
    term.onData((data) => {
      invoke("write_terminal", { data }).catch(console.error);
    });

    // Listen for PTY output
    const unlisten = listen<string>("terminal-output", (event) => {
      term.write(event.payload);
    });

    // Open PTY then clear
    invoke("open_terminal", { cwd: cwd || undefined }).then(() => {
      // Send clear command after shell init
      setTimeout(() => {
        invoke("write_terminal", { data: "clear\n" }).catch(() => {});
      }, 500);
    }).catch((e) => {
      term.writeln(`\x1b[31mFailed to open terminal: ${e}\x1b[0m`);
    });

    setInitialized(true);

    // Resize observer
    const observer = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    observer.observe(termRef.current);

    return () => {
      observer.disconnect();
      unlisten.then((fn) => fn());
      term.dispose();
      xtermRef.current = null;
      setInitialized(false);
    };
  }, []);

  return (
    <div
      ref={termRef}
      className="h-full w-full"
      style={{ padding: "4px 0 0 4px" }}
    />
  );
}
