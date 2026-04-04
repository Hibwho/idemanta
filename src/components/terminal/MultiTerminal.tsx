import { useState } from "react";
import { TerminalView } from "./TerminalView";
import { Plus, X, Terminal } from "lucide-react";

interface TermTab {
  id: string;
  name: string;
}

export function MultiTerminal({ cwd }: { cwd?: string }) {
  const [tabs, setTabs] = useState<TermTab[]>([{ id: "1", name: "bash" }]);
  const [activeTab, setActiveTab] = useState("1");

  const addTab = () => {
    const id = String(Date.now());
    const num = tabs.length + 1;
    setTabs((prev) => [...prev, { id, name: `bash ${num}` }]);
    setActiveTab(id);
  };

  const closeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTab === id) setActiveTab(remaining[remaining.length - 1].id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Terminal tabs */}
      <div className="flex items-center bg-[var(--bg-secondary)] border-b border-[var(--border)] px-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-1.5 px-3 py-1 text-[11px] cursor-pointer transition-colors relative ${
              activeTab === tab.id
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
            )}
            <Terminal size={11} />
            <span>{tab.name}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] cursor-pointer p-0.5 rounded transition-opacity"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer p-1.5 rounded hover:bg-[var(--bg-elevated)]/50 ml-1 transition-colors"
          title="New terminal"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Terminal content */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            <TerminalView cwd={cwd} id={tab.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
