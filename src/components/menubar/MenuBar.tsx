import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  action?: () => void;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

function MenuDropdown({ menu, isOpen, onClose, anchorRect }: {
  menu: Menu; isOpen: boolean; onClose: () => void; anchorRect: DOMRect | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  return createPortal(
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={onClose} />
      <div
        ref={ref}
        style={{
          position: "fixed",
          zIndex: 99999,
          top: anchorRect.bottom + 2,
          left: anchorRect.left,
          minWidth: "220px",
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "4px 0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {menu.items.map((item, i) =>
          item.separator ? (
            <div key={i} style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />
          ) : (
            <button
              key={i}
              onClick={() => { item.action?.(); onClose(); }}
              disabled={item.disabled}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 12px",
                fontSize: "12px",
                textAlign: "left",
                color: item.disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                cursor: item.disabled ? "not-allowed" : "pointer",
                background: "transparent",
                border: "none",
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginLeft: "16px" }}>
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
}

function MenuButton({ menu, isOpen, onToggle, onHover, onClose }: {
  menu: Menu; isOpen: boolean; onToggle: () => void; onHover: () => void; onClose: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  return (
    <div>
      <button
        ref={btnRef}
        onClick={onToggle}
        onMouseEnter={onHover}
        className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors text-[13px] ${
          isOpen
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60"
        }`}
      >
        {menu.label}
      </button>
      <MenuDropdown menu={menu} isOpen={isOpen} onClose={onClose} anchorRect={rect} />
    </div>
  );
}

export interface MenuBarActions {
  onOpenFolder: () => void;
  onSave: () => void;
  onPreferences: () => void;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
  onNewAgent: () => void;
  onNewProject: () => void;
  onShowExplorer: () => void;
  onShowSearch: () => void;
  onShowGit: () => void;
  onShowAgents: () => void;
  onShowStore: () => void;
}

export function MenuBar({ actions }: { actions: MenuBarActions }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "Open Folder...", shortcut: "Ctrl+O", action: actions.onOpenFolder },
        { label: "Open Recent", disabled: true },
        { separator: true },
        { label: "Save", shortcut: "Ctrl+S", action: actions.onSave },
        { label: "Save All", shortcut: "Ctrl+Shift+S" },
        { separator: true },
        { label: "Preferences", shortcut: "Ctrl+,", action: actions.onPreferences },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Shift+Z" },
        { separator: true },
        { label: "Cut", shortcut: "Ctrl+X" },
        { label: "Copy", shortcut: "Ctrl+C" },
        { label: "Paste", shortcut: "Ctrl+V" },
        { separator: true },
        { label: "Find", shortcut: "Ctrl+F" },
        { label: "Find in Files", shortcut: "Ctrl+Shift+F", action: actions.onShowSearch },
        { label: "Replace", shortcut: "Ctrl+H" },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Explorer", shortcut: "Ctrl+Shift+E", action: actions.onShowExplorer },
        { label: "Search", shortcut: "Ctrl+Shift+F", action: actions.onShowSearch },
        { label: "Source Control", shortcut: "Ctrl+Shift+G", action: actions.onShowGit },
        { label: "Agents", shortcut: "Ctrl+Shift+A", action: actions.onShowAgents },
        { separator: true },
        { label: "Terminal", shortcut: "Ctrl+`", action: actions.onToggleTerminal },
        { separator: true },
        { label: "Toggle Sidebar", action: actions.onToggleSidebar },
      ],
    },
    {
      label: "Agents",
      items: [
        { label: "New Agent...", shortcut: "Ctrl+N", action: actions.onNewAgent },
        { label: "New Project Team...", action: actions.onNewProject },
        { separator: true },
        { label: "Agent View", action: actions.onShowAgents },
        { label: "Open Store", action: actions.onShowStore },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "New Terminal", shortcut: "Ctrl+Shift+`", action: actions.onToggleTerminal },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Documentation" },
        { separator: true },
        { label: "About IDEManta" },
      ],
    },
  ];

  return (
    <div className="flex items-center h-[36px] bg-[var(--bg-primary)] border-b border-[var(--border)] select-none text-[13px] px-2 gap-1">
      {menus.map((menu) => (
        <MenuButton
          key={menu.label}
          menu={menu}
          isOpen={openMenu === menu.label}
          onToggle={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
          onHover={() => openMenu && setOpenMenu(menu.label)}
          onClose={() => setOpenMenu(null)}
        />
      ))}
    </div>
  );
}
