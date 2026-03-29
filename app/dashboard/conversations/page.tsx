"use client";

import { useState } from "react";
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
  CalendarCheck,
  AlertTriangle,
  Send,
  Mail,
  Phone,
  Camera,
  Globe,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type Channel = "whatsapp" | "instagram" | "email" | "phone" | "web";
type ConversationStatus = "active" | "waiting" | "handed_off" | "closed";

type Message = {
  id: string;
  sender: "ai" | "human" | "lead";
  text: string;
  timestamp: string;
};

type TimelineEvent = {
  id: string;
  type: "message_received" | "ai_replied" | "handoff" | "appointment" | "closed" | "reopened";
  label: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  leadName: string;
  channel: Channel;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  unread: boolean;
  messages: Message[];
  timeline: TimelineEvent[];
};

// ── Config ───────────────────────────────────────────────────────────

const channels: { key: Channel; label: string; icon: React.ReactNode }[] = [
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

const timelineIcons: Record<string, React.ReactNode> = {
  message_received: <MessageSquare size={12} />,
  ai_replied: <Bot size={12} />,
  handoff: <ArrowRightLeft size={12} />,
  appointment: <CalendarCheck size={12} />,
  closed: <CheckCircle2 size={12} />,
  reopened: <AlertTriangle size={12} />,
};

// ── Mock data ────────────────────────────────────────────────────────

const conversations: Conversation[] = [];

// ── Component ────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>("whatsapp");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [tab, setTab] = useState<"messages" | "timeline">("messages");

  const filtered = conversations.filter((c) => c.channel === activeChannel);

  const channelCounts = channels.map((ch) => ({
    ...ch,
    count: conversations.filter((c) => c.channel === ch.key).length,
    unread: conversations.filter((c) => c.channel === ch.key && c.unread).length,
  }));

  return (
    <div className="flex h-full">
      {/* ── Channel sidebar ─────────────────────────────────────── */}
      <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border/60 bg-card/20 py-4">
        {channelCounts.map((ch) => (
          <button
            key={ch.key}
            onClick={() => {
              setActiveChannel(ch.key);
              setSelected(null);
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
            {channels.find((c) => c.key === activeChannel)?.label}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {filtered.length} conversation{filtered.length !== 1 && "s"}
          </p>
          {/* Search */}
          <div className="mt-3 flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-muted/20 px-3 py-1.5">
            <Search size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Search...</span>
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((conv) => {
              const st = statusConfig[conv.status];
              const isSelected = selected?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelected(conv);
                    setTab("messages");
                  }}
                  className={`flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-accent/60"
                      : "hover:bg-accent/30"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/30 text-xs font-medium text-muted-foreground">
                    {conv.leadName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${conv.unread ? "text-foreground" : ""}`}>
                        {conv.leadName}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {conv.lastMessageAt}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {conv.lastMessage}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${st.color}`}
                      >
                        {st.icon}
                        {st.label}
                      </span>
                      {conv.unread && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
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
                  <h2 className="text-sm font-semibold">{selected.leadName}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusConfig[selected.status].color}`}
                  >
                    {statusConfig[selected.status].icon}
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {selected.messageCount} messages · {selected.id}
                </p>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 rounded-[var(--radius)] border border-border/60 bg-muted/20 p-1">
                <button
                  onClick={() => setTab("messages")}
                  className={`rounded-[calc(var(--radius)-2px)] px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    tab === "messages"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setTab("timeline")}
                  className={`rounded-[calc(var(--radius)-2px)] px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    tab === "timeline"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {tab === "messages" ? (
                <div className="space-y-0">
                  {selected.messages.length > 0 ? (
                    selected.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`px-6 py-4 ${
                          msg.sender === "lead" ? "bg-transparent" : "bg-muted/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              msg.sender === "ai"
                                ? "bg-violet-500/10 text-violet-400"
                                : msg.sender === "human"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {msg.sender === "ai" ? (
                              <Bot size={12} />
                            ) : msg.sender === "human" ? (
                              <User size={12} />
                            ) : (
                              <Send size={12} />
                            )}
                          </div>
                          <span className="text-xs font-medium">
                            {msg.sender === "ai"
                              ? "KAGAN AI"
                              : msg.sender === "human"
                                ? "Agent"
                                : selected.leadName}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              msg.sender === "ai"
                                ? "bg-violet-500/10 text-violet-400"
                                : msg.sender === "human"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            {msg.sender === "ai"
                              ? "AI"
                              : msg.sender === "human"
                                ? "Human"
                                : "Lead"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={9} />
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="mt-2 pl-8 text-sm text-foreground/90">
                          {msg.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        No messages yet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Timeline */
                <div className="px-6 py-6">
                  {selected.timeline.length > 0 ? (
                    <div className="relative ml-3 border-l border-border/60 pl-6">
                      {selected.timeline.map((event) => (
                        <div key={event.id} className="relative pb-6 last:pb-0">
                          <div className="absolute -left-[calc(1.5rem+5px)] flex h-[10px] w-[10px] items-center justify-center rounded-full border-2 border-border bg-card" />
                          <div className="flex items-start gap-2">
                            <span className="mt-px text-muted-foreground">
                              {timelineIcons[event.type] || <CircleDot size={12} />}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{event.label}</p>
                              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock size={9} />
                                {event.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        No timeline events yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
