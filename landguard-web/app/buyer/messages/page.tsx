"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MessageSquareText, Send, Shield } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { messagesAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

interface Conversation {
  _id: string;
  participants?: { _id?: string; personalInfo?: { firstName?: string; lastName?: string } }[];
  propertyId?: { title?: string };
  lastMessage?: { text?: string; body?: string };
}

interface Message {
  _id: string;
  body?: string;
  text?: string;
  senderId?: { _id?: string; personalInfo?: { firstName?: string; lastName?: string } };
  createdAt?: string;
}

function getOtherParticipantName(conv: Conversation): string {
  const others = (conv.participants ?? []).filter((p) => p._id !== undefined);
  const p = others[0];
  if (!p) return "Seller";
  const name = `${p.personalInfo?.firstName ?? ""} ${p.personalInfo?.lastName ?? ""}`.trim();
  return name || "Seller";
}

export default function BuyerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      const list: Conversation[] = res.data?.data ?? [];
      setConversations(list);
      if (!activeConvId && list.length > 0) setActiveConvId(list[0]._id);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeConvId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    setLoadingMsgs(true);
    messagesAPI
      .getMessages(activeConvId)
      .then((res) => setMessages(res.data?.data ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeConvId) return;
    setInputText("");
    setSending(true);
    try {
      const res = await messagesAPI.sendMessage(activeConvId, { body: text });
      setMessages((prev) => [...prev, res.data?.data ?? { _id: Date.now().toString(), body: text }]);
    } catch {
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeConvId);
  const unreadCount = conversations.length; // backend doesn't expose unread count in list

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Messages Center"
      subtitle="Chat directly with sellers, review property context, and keep records for legal protection."
      navItems={navItems}
      stats={[
        { label: "Conversations", value: String(conversations.length || 0), icon: MessageSquareText },
        { label: "Active Threads", value: String(unreadCount || 0), icon: Shield },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: 520 }}>
        {/* Conversation list */}
        <Panel title="Conversations" subtitle="Your message threads with sellers">
          {loadingConvs ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
              No conversations yet.{" "}Contact a seller from a property listing to start a thread.
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const name = getOtherParticipantName(conv);
                const lastMsg = conv.lastMessage?.text ?? conv.lastMessage?.body ?? "";
                const isActive = conv._id === activeConvId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full text-left rounded-lg px-3 py-3 transition ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-800 dark:text-blue-200" : "text-slate-800 dark:text-slate-100"}`}>{name}</p>
                        {conv.propertyId?.title && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">re: {conv.propertyId.title}</p>
                        )}
                        {lastMsg && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{lastMsg}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Chat panel */}
        <div className="lg:col-span-2">
          <Panel
            title={activeConv ? getOtherParticipantName(activeConv) : "Select a conversation"}
            subtitle={activeConv?.propertyId?.title ? `re: ${activeConv.propertyId.title}` : "Choose a thread from the left"}
          >
            <div className="flex flex-col" style={{ height: 400 }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                {loadingMsgs ? (
                  <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
                ) : !activeConvId ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center pt-8">Select a conversation to view messages.</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center pt-8">No messages yet. Start the conversation below.</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = !msg.senderId?._id;
                    const text = msg.body ?? msg.text ?? "";
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="flex items-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                <textarea
                  className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message…"
                  rows={2}
                  maxLength={500}
                  value={inputText}
                  disabled={!activeConvId}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !inputText.trim() || !activeConvId}
                  className="rounded-xl bg-blue-600 text-white p-2.5 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        Message records are tamper-resistant and can support legal review if a transaction dispute occurs.
      </div>
    </PortalShell>
  );
}
