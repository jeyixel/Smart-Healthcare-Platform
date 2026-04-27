"use client";

import { useEffect, useState } from "react";
import { fetchConversations, fetchCurrentUser } from "@/lib/api";
import SupportChat from "@/app/components/common/SupportChat";

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<String[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    if (token) {
      loadInitialData(token);
    }
  }, []);

  const loadInitialData = async (token: string) => {
    try {
      const [convs, me] = await Promise.all([
        fetchConversations(token),
        fetchCurrentUser(token)
      ]);
      setConversations(convs);
      setAdminEmail(me.email);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Support Hub</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Patient Conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-20 text-center opacity-30 italic text-sm">No conversations yet.</div>
          ) : (
            conversations.map((email) => (
              <button
                key={email.toString()}
                onClick={() => setSelectedPatient(email.toString())}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedPatient === email 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  selectedPatient === email ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left truncate">
                  <p className="font-bold text-sm truncate">{email}</p>
                  <p className={`text-[10px] ${selectedPatient === email ? 'text-white/70' : 'text-slate-400'}`}>Click to open chat</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col rounded-2xl bg-white/50 relative">
        {selectedPatient ? (
          <SupportChat 
            currentUserEmail={adminEmail} 
            withEmail={selectedPatient} 
            title={`Patient Support: ${selectedPatient}`}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-5xl mb-6">📨</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Select a Conversation</h3>
            <p className="text-slate-500 max-w-sm">Choose a patient from the sidebar to view history and respond to support requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
