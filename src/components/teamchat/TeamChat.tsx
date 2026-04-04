import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAgentStore } from "../../stores/agentStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { Send, Loader2, User, Bot, Users, AtSign } from "lucide-react";

interface TeamMessage {
  id: string;
  agentId: string | null; // null = user
  agentName: string;
  content: string;
  timestamp: number;
}

export function TeamChat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const { agents, addMessage: addAgentMessage, updateAgent } = useAgentStore();
  const { autoApprove } = useSettingsStore();

  // Collect new agent messages into team chat
  useEffect(() => {
    const seen = new Set(messages.filter((m) => m.agentId).map((m) => `${m.agentId}-${m.content}`));

    const newMessages: TeamMessage[] = [];
    for (const agent of agents) {
      for (const msg of agent.messages) {
        if (msg.type === "user") continue;
        const key = `${agent.id}-${msg.content}`;
        if (!seen.has(key)) {
          seen.add(key);
          newMessages.push({
            id: msg.id,
            agentId: agent.id,
            agentName: agent.name,
            content: msg.content,
            timestamp: msg.timestamp,
          });
        }
      }
    }

    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages].sort((a, b) => a.timestamp - b.timestamp));
    }
  }, [agents]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect @mention in input
  const handleInputChange = (value: string) => {
    setInput(value);
    const atMatch = value.match(/@(\w*)$/);
    if (atMatch) {
      setShowMentions(true);
      setMentionFilter(atMatch[1].toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const newInput = input.replace(/@\w*$/, `@${name} `);
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to team chat
    const userMsg: TeamMessage = {
      id: crypto.randomUUID(),
      agentId: null,
      agentName: "You",
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Detect which agent(s) to send to
    const mentionedNames = input.match(/@(\w+)/g)?.map((m) => m.slice(1).toLowerCase()) || [];
    const cleanMessage = input.replace(/@\w+/g, "").trim();

    let targetAgents = agents.filter((a) =>
      mentionedNames.some((name) => a.name.toLowerCase().includes(name))
    );

    // If no @mention, send to all active agents or the first one
    if (targetAgents.length === 0 && agents.length > 0) {
      // Send to the first active agent
      const active = agents.find((a) => a.status === "waiting" || a.status === "running");
      if (active) targetAgents = [active];
    }

    for (const agent of targetAgents) {
      // Add user message to the agent's individual chat too
      addAgentMessage(agent.id, {
        id: crypto.randomUUID(),
        type: "user",
        content: cleanMessage || input,
        timestamp: Date.now(),
      });

      updateAgent(agent.id, { status: "running" });

      try {
        await invoke("send_to_agent", {
          agentId: agent.id,
          message: cleanMessage || input,
          autoApprove,
        });
      } catch (e) {
        console.error(`Failed to send to ${agent.name}:`, e);
      }
    }

    setInput("");
    setShowMentions(false);
  };

  const filteredMentions = agents.filter((a) =>
    a.name.toLowerCase().includes(mentionFilter)
  );

  const runningAgents = agents.filter((a) => a.status === "running");

  // Agent color based on name hash
  const getAgentColor = (name: string) => {
    const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <Users size={15} className="text-[var(--accent)]" />
        <span className="text-[13px] font-medium">Team Chat</span>
        <span className="text-[11px] text-[var(--text-muted)]">
          {agents.length} agents
        </span>
        {runningAgents.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--green-dim)] text-[var(--green)] ml-auto">
            {runningAgents.length} working
          </span>
        )}
      </div>

      {/* Agent roster */}
      {agents.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border)] overflow-x-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] shrink-0"
              style={{
                backgroundColor: `${getAgentColor(agent.name)}15`,
                color: getAgentColor(agent.name),
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    agent.status === "running" ? "var(--green)" :
                    agent.status === "waiting" ? getAgentColor(agent.name) : "var(--text-muted)",
                }}
              />
              {agent.name}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users size={32} className="text-[var(--text-muted)]/20 mb-3" />
            <div className="text-[13px] text-[var(--text-secondary)] mb-1">Team Chat</div>
            <div className="text-[11px] text-[var(--text-muted)] max-w-[300px]">
              All agent responses appear here. Use @name to talk to a specific agent, or just type to talk to the first available one.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="animate-slide-in">
            {msg.agentId === null ? (
              // User message
              <div className="flex gap-2.5 justify-end">
                <div className="bg-[var(--accent)] text-white rounded-2xl rounded-br-md px-3.5 py-2 max-w-[70%] text-[12px] leading-relaxed whitespace-pre-wrap shadow-sm">
                  {msg.content}
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--accent-glow)] flex items-center justify-center shrink-0 mt-auto">
                  <User size={13} className="text-[var(--accent)]" />
                </div>
              </div>
            ) : (
              // Agent message
              <div className="flex gap-2.5 justify-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto text-[10px] font-bold"
                  style={{
                    backgroundColor: `${getAgentColor(msg.agentName)}20`,
                    color: getAgentColor(msg.agentName),
                  }}
                >
                  {msg.agentName.slice(0, 2).toUpperCase()}
                </div>
                <div className="max-w-[70%]">
                  <div className="text-[10px] font-medium mb-0.5" style={{ color: getAgentColor(msg.agentName) }}>
                    {msg.agentName}
                  </div>
                  <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl rounded-bl-md px-3.5 py-2 text-[12px] leading-relaxed whitespace-pre-wrap border border-[var(--border)]">
                    {msg.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {runningAgents.length > 0 && (
          <div className="flex gap-2.5 justify-start animate-slide-in">
            <div className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
              <Loader2 size={12} className="text-[var(--text-muted)] animate-spin" />
            </div>
            <div className="bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-2xl px-3.5 py-2 text-[12px] border border-[var(--border)]">
              {runningAgents.map((a) => a.name).join(", ")} thinking...
            </div>
          </div>
        )}
      </div>

      {/* @mention autocomplete */}
      {showMentions && filteredMentions.length > 0 && (
        <div className="mx-4 mb-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
          {filteredMentions.map((agent) => (
            <button
              key={agent.id}
              onClick={() => insertMention(agent.name)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left cursor-pointer hover:bg-[var(--accent-glow)] transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  backgroundColor: `${getAgentColor(agent.name)}20`,
                  color: getAgentColor(agent.name),
                }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[var(--text-primary)]">{agent.name}</span>
              <span className="text-[var(--text-muted)] text-[10px] ml-auto">{agent.role}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex gap-1.5 items-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] focus-within:border-[var(--accent)] transition-all px-1.5">
          <button
            onClick={() => { setInput(input + "@"); setShowMentions(true); setMentionFilter(""); inputRef.current?.focus(); }}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer p-1 rounded transition-colors"
            title="Mention an agent"
          >
            <AtSign size={15} />
          </button>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent px-1 py-2.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            placeholder={agents.length > 0 ? `Message the team... (use @name to target)` : "Create an agent first..."}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend();
              if (e.key === "Escape") setShowMentions(false);
            }}
            disabled={agents.length === 0}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || agents.length === 0}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              input.trim() && agents.length > 0
                ? "text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                : "text-[var(--text-muted)]/20 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-[var(--text-muted)]">
          <span>Type <kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[9px] font-mono">@</kbd> to mention an agent</span>
        </div>
      </div>
    </div>
  );
}
