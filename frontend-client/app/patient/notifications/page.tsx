"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchNotifications } from "@/lib/api";
import { NotificationLog } from "@/types/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "PATIENT") {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const logs = await fetchNotifications(token!);
        setNotifications(logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "All") return true;
    return n.subject.toLowerCase().includes(filter.toLowerCase()) || 
           n.message.toLowerCase().includes(filter.toLowerCase());
  });

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const sent = new Date(dateStr);
    const diff = now.getTime() - sent.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return sent.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-700">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Center Communications</h1>
            <p className="text-slate-500 mt-1 font-medium">Keep up with updates, schedule changes, and health reminders</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {["All", "Appointment", "Payment"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  filter === f 
                  ? 'bg-[#06b6d4] text-white shadow-lg shadow-[#06b6d4]/30' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f === "All" ? "Everything" : f}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center flex flex-col items-center shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Clear Inbox</h3>
             <p className="text-slate-500 max-w-sm">We'll alert you here when new reports or appointment updates are available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((n) => {
              const isAppointment = n.subject.toLowerCase().includes("appointment");
              const isPrescription = n.subject.toLowerCase().includes("prescription");
              
              return (
                <div key={n.id} className="group flex items-start gap-6 bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:border-[#06b6d4]/30">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isAppointment ? "bg-blue-50 text-blue-500" :
                    isPrescription ? "bg-purple-50 text-purple-500" :
                    "bg-slate-50 text-[#06b6d4]"
                  }`}>
                    {isAppointment && (
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {isPrescription && (
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {(!isAppointment && !isPrescription) && (
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight">{n.subject}</h4>
                      <span className="text-xs font-bold text-slate-400">{getTimeAgo(n.sentAt)}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">{n.message}</p>
                    <div className="mt-4 flex items-center gap-4">
                       <button className="text-[10px] uppercase font-bold text-[#06b6d4] tracking-widest hover:underline transition-all">Mark as read</button>
                       <button className="text-[10px] uppercase font-bold text-slate-400 tracking-widest hover:text-slate-900 transition-all">Archive</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
