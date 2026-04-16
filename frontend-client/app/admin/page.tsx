"use client";

import { useEffect, useState } from "react";
import { fetchDashboardSummary, fetchRecentEvents } from "@/lib/api";
import { DashboardSummary, SystemEvent } from "@/types/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        setSyncError("Authentication token not found.");
        setLoading(false);
        return;
      }

      try {
        const [sumData, eventData] = await Promise.all([
          fetchDashboardSummary(token),
          fetchRecentEvents(token)
        ]);
        setSummary(sumData);
        setEvents(eventData);
        setSyncError(null);
      } catch (err) {
        console.error("Dashboard sync failed:", err);
        setSyncError(err instanceof Error ? err.message : "Failed to synchronize with backend services.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
    const interval = setInterval(() => void loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const statsList = [
    { label: "Total Platform Users", value: summary?.totalSystemUsers ?? "...", icon: "👥", color: "blue", trend: "+12%" },
    { label: "Active Doctors", value: summary?.activeDoctors ?? "...", icon: "⚕️", color: "indigo", trend: "+3%" },
    { label: "Registered Patients", value: summary?.totalPatients ?? "...", icon: "🏥", color: "emerald", trend: "+8%" },
    { label: "Total Appointments", value: summary?.totalAppointments ?? "...", icon: "📅", color: "amber", trend: "+24%" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Overview</h1>
          <p className="text-slate-500">Real-time snapshots of the Smart Healthcare ecosystem.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200">
          <span className={`flex h-2 w-2 rounded-full ${syncError ? 'bg-amber-500' : 'bg-emerald-500'} ml-2 animate-pulse`}></span>
          <span className="text-xs font-bold text-slate-600 pr-3 uppercase tracking-wider">
            {syncError ? 'Network Congestion' : 'Kafka Network Live'}
          </span>
        </div>
      </header>

      {syncError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          ⚠️ {syncError} - Some data may be temporarily outdated.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsList.map((item) => (
          <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
            <div className={`absolute top-0 right-0 h-24 w-24 translate-x-12 translate-y-[-12px] opacity-10 blur-2xl bg-indigo-600`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-1">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{item.value}</h3>
                  <span className="text-xs font-bold text-emerald-600">{item.trend}</span>
                </div>
              </div>
              <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity Feed */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Live Health Event Stream</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post-Kafka Trace</span>
          </div>
          <div className="flex-1 min-h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Syncing event registry...</div>
            ) : events.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900"><span className="font-bold">{event.requestedBy}</span> {event.description}</p>
                      <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">KAFKA_PUB</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">No system events recorded.</div>
            )}
          </div>
          <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Connect to WebSocket Feed →</button>
          </div>
        </section>

        {/* Quick Actions / System Health */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Core Service Status</h3>
            <div className="space-y-4">
               {[
                 { name: "Auth (Admin)", status: "Healthy", u: 99.8 },
                 { name: "Patient API", status: "Healthy", u: 99.9 },
                 { name: "Appointment", status: "Healthy", u: 98.2 },
                 { name: "Notification", status: "Healthy", u: 100 },
               ].map((svc) => (
                 <div key={svc.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{svc.name}</p>
                      <p className="text-[10px] text-slate-500">{svc.u}% Uptime</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${svc.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {svc.status}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">
             <h3 className="font-bold mb-2">New Security Protocol</h3>
             <p className="text-sm text-indigo-100 mb-4">All administrative actions must now be signed with an X-Admin-User header for audit compliance.</p>
             <button className="w-full rounded-xl bg-white py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">Learn More</button>
          </div>
        </section>
      </div>
    </div>
  );
}
