"use client";

import { useEffect, useState, useRef } from "react";
import { fetchChatHistory, sendSupportMessage } from "@/lib/api";
import { SupportMessageResponse } from "@/types/api";

interface SupportChatProps {
  currentUserEmail: string;
  withEmail: string;
  title?: string;
  onClose?: () => void;
}

export default function SupportChat({ currentUserEmail, withEmail, title, onClose }: SupportChatProps) {
  const [messages, setMessages] = useState<SupportMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token") || localStorage.getItem("smart_doctor_token") || localStorage.getItem("smart_token");
    if (token && withEmail) {
      loadHistory(token);
      const interval = setInterval(() => loadHistory(token), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [withEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async (token: string) => {
    try {
      const history = await fetchChatHistory(token, withEmail);
      setMessages(history);
    } catch (error) {
      console.error("Chat load error:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("smart_admin_token") || localStorage.getItem("smart_doctor_token") || localStorage.getItem("smart_token");
    if (!token) return;

    setLoading(true);
    try {
      await sendSupportMessage(token, {
        recipientEmail: withEmail,
        content: newMessage.trim(),
      });
      setNewMessage("");
      loadHistory(token);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
            {withEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold truncate max-w-[150px]">{title || withEmail}</h3>
            <p className="text-[10px] text-slate-400">Support Chat (Asynchronous)</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderEmail === currentUserEmail;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                isMine 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   {isMine && msg.read && (
                     <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
}
