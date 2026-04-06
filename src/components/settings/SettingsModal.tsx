import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../../stores/settingsStore";
import { X, Key, Terminal, Check, Shield, AlertTriangle, Cpu, Wifi, WifiOff, RefreshCw, Zap } from "lucide-react";

export function SettingsModal() {
  const {
    showSettings, toggleSettings, authMode, setAuthMode, apiKey, setApiKey, autoApprove, setAutoApprove,
    ollamaUrl, setOllamaUrl, ollamaModel, setOllamaModel, orchestratorEnabled, setOrchestratorEnabled,
  } = useSettingsStore();

  const [ollamaStatus, setOllamaStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaError, setOllamaError] = useState("");

  const testOllama = async () => {
    setOllamaStatus("testing");
    setOllamaError("");
    try {
      const result = await invoke<string>("test_ollama_connection", { ollamaUrl });
      const models = JSON.parse(result) as string[];
      setOllamaModels(models);
      setOllamaStatus("ok");
    } catch (e) {
      setOllamaError(String(e));
      setOllamaStatus("error");
    }
  };

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

          {/* Local LLM / Ollama */}
          <div className="mb-6">
            <div className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Local LLM (Ollama)
            </div>

            {/* Ollama URL */}
            <div className="p-3 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border-subtle)] mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={14} className="text-[var(--accent)]" />
                <span className="text-[12px] font-medium">Ollama Server</span>
                <div className="ml-auto flex items-center gap-1.5">
                  {ollamaStatus === "ok" && <Wifi size={12} className="text-[var(--green)]" />}
                  {ollamaStatus === "error" && <WifiOff size={12} className="text-[var(--red)]" />}
                  <button
                    onClick={testOllama}
                    disabled={ollamaStatus === "testing"}
                    className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={10} className={ollamaStatus === "testing" ? "animate-spin" : ""} />
                    Test
                  </button>
                </div>
              </div>
              <input
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] mb-2"
                placeholder="http://localhost:11434"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
              />

              {/* Model selector */}
              <div className="flex gap-2">
                {ollamaModels.length > 0 ? (
                  <select
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                  >
                    {ollamaModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Model name (e.g. qwen3:8b)"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                  />
                )}
              </div>

              {ollamaStatus === "ok" && (
                <div className="mt-2 text-[10px] text-[var(--green)] flex items-center gap-1">
                  <Check size={10} /> Connected — {ollamaModels.length} model{ollamaModels.length !== 1 ? "s" : ""} available
                </div>
              )}
              {ollamaStatus === "error" && (
                <div className="mt-2 text-[10px] text-[var(--red)]">
                  {ollamaError}
                </div>
              )}
            </div>

            {/* Orchestrator toggle */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                orchestratorEnabled
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/40"
                  : "bg-[var(--bg-primary)]/40 border-transparent hover:border-[var(--border-subtle)]"
              }`}
              onClick={() => setOrchestratorEnabled(!orchestratorEnabled)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                orchestratorEnabled ? "bg-[var(--accent)]/20" : "bg-[var(--bg-tertiary)]"
              }`}>
                <Zap size={16} className={orchestratorEnabled ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">Smart Orchestrator</span>
                  <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                    orchestratorEnabled ? "bg-[var(--accent)]" : "bg-[var(--bg-tertiary)]"
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      orchestratorEnabled ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {orchestratorEnabled
                    ? "Local LLM routes messages: simple tasks stay local, complex ones go to Claude. Saves tokens and reduces latency."
                    : "All messages go directly to Claude. Enable to let the local LLM handle simple tasks automatically."
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
              <li>Local LLM uses Ollama for on-device inference — no API costs</li>
              <li>Smart Orchestrator routes simple tasks locally, complex ones to Claude</li>
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
