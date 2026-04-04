import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Agent, useAgentStore } from "../../stores/agentStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { Send, Loader2, User, Bot } from "lucide-react";

export function AgentOutput({ agent }: { agent: Agent }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const { addMessage, updateAgent } = useAgentStore();
  const { autoApprove } = useSettingsStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agent.messages]);

  useEffect(() => { inputRef.current?.focus(); }, [agent.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    addMessage(agent.id, { id: crypto.randomUUID(), type: "user", content: input, timestamp: Date.now() });
    updateAgent(agent.id, { status: "running" });
    try {
      await invoke("send_to_agent", { agentId: agent.id, message: input, autoApprove });
    } catch (e) { console.error("Failed to send:", e); }
    setInput("");
  };

  const isActive = agent.status !== "stopped" && agent.status !== "error";

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{
          backgroundColor: agent.status === "running" ? "var(--green-dim)" : agent.status === "waiting" ? "var(--blue-dim)" : "var(--bg-tertiary)"
        }}>
          <Bot size={11} style={{
            color: agent.status === "running" ? "var(--green)" : agent.status === "waiting" ? "var(--blue)" : "var(--text-muted)"
          }} />
        </div>
        <span className="text-[12px] font-medium truncate">{agent.name}</span>
        {agent.status === "running" && <Loader2 size={10} className="text-[var(--green)] animate-spin ml-auto" />}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {agent.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-[var(--text-muted)]">
              {agent.status === "running" ? "Waiting for response..." : "Start a conversation"}
            </span>
          </div>
        ) : (
          agent.messages.map((msg) => (
            <div key={msg.id} className="animate-slide-in">
              {msg.type === "user" ? (
                <div className="flex gap-2 justify-end">
                  <div className="bg-[var(--accent)] text-white rounded-2xl rounded-br-md px-3.5 py-2 max-w-[82%] text-[12px] leading-relaxed whitespace-pre-wrap shadow-lg shadow-[var(--accent)]/10">
                    {msg.content}
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center shrink-0 mt-auto">
                    <User size={12} className="text-[var(--accent)]" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0 mt-auto">
                    <Bot size={12} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-2xl rounded-bl-md px-3.5 py-2 max-w-[82%] text-[12px] leading-relaxed whitespace-pre-wrap border border-[var(--border)]">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {agent.status === "running" && agent.messages.length > 0 && (
          <div className="flex gap-2 justify-start animate-slide-in">
            <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
              <Bot size={12} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded-2xl px-3.5 py-2 text-[12px] border border-[var(--border)]">
              <Loader2 size={11} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex gap-1.5 items-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] focus-within:border-[var(--accent)] focus-within:shadow-sm focus-within:shadow-[var(--accent)]/10 transition-all px-1">
          <input
            ref={inputRef}
            className="flex-1 bg-transparent px-2.5 py-2 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            placeholder={isActive ? "Message..." : "Agent stopped"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={!isActive}
          />
          <button
            onClick={handleSend}
            disabled={!isActive || !input.trim()}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isActive && input.trim()
                ? "text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                : "text-[var(--text-muted)]/20 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
