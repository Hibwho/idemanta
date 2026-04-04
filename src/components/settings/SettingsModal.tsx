import { useSettingsStore } from "../../stores/settingsStore";
import { X, Key, Terminal, Check, Shield, AlertTriangle } from "lucide-react";

export function SettingsModal() {
  const { showSettings, toggleSettings, authMode, setAuthMode, apiKey, setApiKey, autoApprove, setAutoApprove } =
    useSettingsStore();

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl w-[480px] shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="text-[14px] font-semibold">Settings</span>
          <button
            onClick={toggleSettings}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors p-1 rounded-md hover:bg-[var(--bg-tertiary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Auth Section */}
          <div className="mb-6">
            <div className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Authentication
            </div>

            {/* CLI Auth */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all mb-2 border ${
                authMode === "cli"
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/40"
                  : "bg-[var(--bg-primary)]/40 border-transparent hover:border-[var(--border-subtle)]"
              }`}
              onClick={() => setAuthMode("cli")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                authMode === "cli" ? "bg-[var(--accent)]/20" : "bg-[var(--bg-tertiary)]"
              }`}>
                <Terminal size={16} className={authMode === "cli" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">Max Plan (CLI)</span>
                  {authMode === "cli" && <Check size={14} className="text-[var(--green)]" />}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Uses your existing CLI authentication. No API key needed.
                  Requires a Max Plan subscription ($100/mo).
                </div>
              </div>
            </div>

            {/* API Auth */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                authMode === "api"
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/40"
                  : "bg-[var(--bg-primary)]/40 border-transparent hover:border-[var(--border-subtle)]"
              }`}
              onClick={() => setAuthMode("api")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                authMode === "api" ? "bg-[var(--accent)]/20" : "bg-[var(--bg-tertiary)]"
              }`}>
                <Key size={16} className={authMode === "api" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">API Key</span>
                  {authMode === "api" && <Check size={14} className="text-[var(--green)]" />}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Use your Anthropic API key. Pay per token usage.
                </div>
                {authMode === "api" && (
                  <div className="mt-2 flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2 focus-within:border-[var(--accent)] transition-colors">
                    <Shield size={12} className="text-[var(--text-muted)] shrink-0" />
                    <input
                      className="w-full bg-transparent py-1.5 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                      placeholder="sk-ant-..."
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <div className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Permissions
            </div>

            <div
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                autoApprove
                  ? "bg-[var(--yellow-dim)] border-[var(--yellow)]/30"
                  : "bg-[var(--bg-primary)]/40 border-transparent hover:border-[var(--border-subtle)]"
              }`}
              onClick={() => setAutoApprove(!autoApprove)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                autoApprove ? "bg-[var(--yellow)]/20" : "bg-[var(--bg-tertiary)]"
              }`}>
                <AlertTriangle size={16} className={autoApprove ? "text-[var(--yellow)]" : "text-[var(--text-muted)]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">Auto-approve all operations</span>
                  <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                    autoApprove ? "bg-[var(--yellow)]" : "bg-[var(--bg-tertiary)]"
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      autoApprove ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {autoApprove
                    ? "Agents can create files, run commands, and modify code without asking. Use with caution."
                    : "Agents will request permission before creating files or running commands. Recommended for safety."
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
            <div className="font-medium text-[var(--text-secondary)] mb-1">How it works</div>
            <ul className="space-y-1">
              <li>CLI mode spawns AI agent processes using your logged-in session</li>
              <li>API mode passes <code className="text-[var(--accent)] font-mono">ANTHROPIC_API_KEY</code> to each agent</li>
              <li>Your key is stored locally only — never sent anywhere</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={toggleSettings}
            className="text-[12px] px-4 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
