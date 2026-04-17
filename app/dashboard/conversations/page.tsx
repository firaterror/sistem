"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Bot,
  User,
  Clock,
  Search,
  ArrowRightLeft,
  CircleDot,
  CheckCircle2,
  PauseCircle,
  Send,
  Mail,
  Phone,
  Camera,
  Globe,
  Loader2,
  XCircle,
  HandMetal,
  RotateCcw,
} from "lucide-react";
import type {
  Conversation,
  Message,
  Channel,
  ConversationStatus,
} from "@/lib/types/conversation";

// ── Config ───────────────────────────────────────────────────────────

const channelsMeta: { key: Channel; label: string; icon: React.ReactNode }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: <MessageSquare size={16} /> },
  { key: "instagram", label: "Instagram", icon: <Camera size={16} /> },
  { key: "email", label: "Email", icon: <Mail size={16} /> },
  { key: "phone", label: "Phone", icon: <Phone size={16} /> },
  { key: "web", label: "Web Chat", icon: <Globe size={16} /> },
];

const statusConfig: Record<
  ConversationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-500",
    icon: <CircleDot size={10} />,
  },
  waiting: {
    label: "Waiting",
    color: "bg-amber-500/10 text-amber-500",
    icon: <PauseCircle size={10} />,
  },
  handed_off: {
    label: "Handed off",
    color: "bg-violet-500/10 text-violet-400",
    icon: <ArrowRightLeft size={10} />,
  },
  closed: {
    label: "Closed",
    color: "bg-muted/50 text-muted-foreground",
    icon: <CheckCircle2 size={10} />,
  },
};

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

// ── Component ────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>("whatsapp");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch conversations ──────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ channel: activeChannel });
      if (search) params.set("search", search);
      const res = await fetch(`/api/conversations?${params}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } finally {
      setLoading(false);
    }
  }, [activeChannel, search]);

  useEffect(() => {
    setLoading(true);
    setSelectedId(null);
    setMessages([]);
    fetchConversations();
  }, [fetchConversations]);

  // Poll for new conversations every 10s
  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // ── Fetch messages when selecting a conversation ─────────────────
  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const interval = setInterval(() => fetchMessages(selectedId), 5000);
    return () => clearInterval(interval);
  }, [selectedId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Mark as read when selecting ──────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    const conv = conversations.find((c) => c.id === selectedId);
    if (conv && conv.unread_count > 0) {
      fetch(`/api/conversations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unread_count: 0 }),
      }).then(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, unread_count: 0 } : c
          )
        );
      });
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ─────────────────────────────────────────────────
  async function handleSend() {
    if (!compose.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: compose.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setCompose("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  last_message_text: data.message.content,
                  last_message_at: data.message.created_at,
                }
              : c
          )
        );
      }
    } finally {
      setSending(false);
    }
  }

  // ── Update conversation status ───────────────────────────────────
  async function handleStatusChange(newStatus: ConversationStatus) {
    if (!selectedId) return;
    const res = await fetch(`/api/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, status: newStatus } : c
        )
      );
    }
  }

  // ── Derived state ────────────────────────────────────────────────
  const selected = conversations.find((c) => c.id === selectedId) || null;

  const channelCounts = channelsMeta.map((ch) => ({
    ...ch,
    count: 0,
    unread: 0,
  }));

  // We only have counts for the active channel from the fetched data
  const activeChIdx = channelCounts.findIndex((c) => c.key === activeChannel);
  if (activeChIdx !== -1) {
    channelCounts[activeChIdx].count = conversations.length;
    channelCounts[activeChIdx].unread = conversations.filter(
      (c) => c.unread_count > 0
    ).length;
  }

  return (
    <div className="flex h-full">
      {/* ── Channel sidebar ─────────────────────────────────────── */}
      <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border/60 bg-card/20 py-4">
        {channelCounts.map((ch) => (
          <button
            key={ch.key}
            onClick={() => {
              setActiveChannel(ch.key);
              setSearch("");
            }}
            className={`relative flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition-colors cursor-pointer ${
              activeChannel === ch.key
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
            title={ch.label}
          >
            {ch.icon}
            {ch.unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {ch.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Thread list ─────────────────────────────────────────── */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border/60 lg:w-80">
        {/* Header */}
        <div className="border-b border-border/60 px-4 py-4">
          <h2 className="text-sm font-semibold">
            {channelsMeta.find((c) => c.key === activeChannel)?.label}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {conversations.length} conversation
            {conversations.length !== 1 && "s"}
          </p>
          {/* Search */}
          <div className="mt-3 flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-muted/20 px-3 py-1.5">
            <Search size={12} className="text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XCircle size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const st = statusConfig[conv.status];
              const isSelected = selectedId === conv.id;
              const name = conv.contact_name || conv.contact_identifier;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors cursor-pointer ${
                    isSelected ? "bg-accent/60" : "hover:bg-accent/30"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/30 text-xs font-medium text-muted-foreground">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium truncate ${
                          conv.unread_count > 0 ? "text-foreground" : ""
                        }`}
                      >
                        {name}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelative(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {conv.last_message_text || "No messages yet"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${st.color}`}
                      >
                        {st.icon}
                        {st.label}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-muted-foreground">
                No conversations on this channel yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Conversation detail ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {selected.contact_name || selected.contact_identifier}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusConfig[selected.status].color}`}
                  >
                    {statusConfig[selected.status].icon}
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {messages.length} messages · {selected.contact_identifier}
                </p>
              </div>
              {/* Status actions */}
              <div className="flex items-center gap-1">
                {selected.status !== "handed_off" && (
                  <button
                    onClick={() => handleStatusChange("handed_off")}
                    className="flex items-center gap-1.5 rounded-[var(--radius)] border border-border/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
                    title="Hand off"
                  >
                    <HandMetal size={12} />
                    Handoff
                  </button>
                )}
                {selected.status !== "closed" ? (
                  <button
                    onClick={() => handleStatusChange("closed")}
                    className="flex items-center gap-1.5 rounded-[var(--radius)] border border-border/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
                    title="Close"
                  >
                    <CheckCircle2 size={12} />
                    Close
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("active")}
                    className="flex items-center gap-1.5 rounded-[var(--radius)] border border-border/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
                    title="Reopen"
                  >
                    <RotateCcw size={12} />
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={16}
                    className="animate-spin text-muted-foreground"
                  />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-0">
                  {messages.map((msg) => {
                    const senderType = msg.sender_type;
                    return (
                      <div
                        key={msg.id}
                        className={`px-6 py-4 ${
                          senderType === "lead" ? "bg-transparent" : "bg-muted/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              senderType === "ai"
                                ? "bg-violet-500/10 text-violet-400"
                                : senderType === "human"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {senderType === "ai" ? (
                              <Bot size={12} />
                            ) : senderType === "human" ? (
                              <User size={12} />
                            ) : (
                              <Send size={12} />
                            )}
                          </div>
                          <span className="text-xs font-medium">
                            {senderType === "ai"
                              ? "KAGAN AI"
                              : senderType === "human"
                                ? "Agent"
                                : selected.contact_name ||
                                  selected.contact_identifier}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              senderType === "ai"
                                ? "bg-violet-500/10 text-violet-400"
                                : senderType === "human"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            {senderType === "ai"
                              ? "AI"
                              : senderType === "human"
                                ? "Human"
                                : "Lead"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={9} />
                            {formatRelative(msg.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 pl-8 text-sm text-foreground/90">
                          {msg.content}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No messages yet.
                  </p>
                </div>
              )}
            </div>

            {/* Compose */}
            {selected.status !== "closed" && (
              <div className="border-t border-border/60 px-6 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-[var(--radius)] border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-border"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!compose.trim() || sending}
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
                <MessageSquare size={20} />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Select a conversation
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a thread from the list to view messages and timeline.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
