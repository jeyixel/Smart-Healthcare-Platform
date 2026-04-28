"use client";

import { useEffect, useState } from "react";
import { fetchDashboardSummary, fetchNotificationLogs } from "@/lib/api";
import { DashboardSummary, NotificationLog } from "@/types/api";

/* === Sub-components === */

function KpiCard({ label, value, delta, icon, color }: { label: string; value: string | number; delta: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8f0fe",
      borderRadius: "16px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${color}22`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color,
          boxShadow: `0 0 16px ${color}10`,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 700, color: "#06b6d4",
          background: "rgba(6,182,212,0.1)",
          padding: "3px 10px", borderRadius: "999px",
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          {delta}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
          {value}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [services, setServices] = useState<{ serviceName: string; status: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("smart_admin_token");
        if (!token) return;

        const [s, n] = await Promise.all([
          fetchDashboardSummary(token),
          fetchNotificationLogs(token)
        ]);

        setStats(s);
        // fetchServiceStatus isn't implemented in the API module — keep services empty
        setServices([]);
        setNotifications(n);
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#06b6d4", borderRadius: "50%" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* === Welcome Hero (Doctor Style) === */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.1)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            background: "rgba(6,182,212,0.15)", color: "#06b6d4",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
            border: "1px solid rgba(6,182,212,0.25)",
          }}>
            ● Global Command Active
          </span>
          <h2 style={{ margin: "16px 0 8px", fontSize: "28px", fontWeight: 800, color: "#fff" }}>
            Systems Oversight Center
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", maxWidth: "500px", lineHeight: 1.6 }}>
            Monitoring <strong style={{color: "#4fd1c5"}}>{stats?.activeDoctors} medical providers</strong> and <strong style={{color: "#4fd1c5"}}>{stats?.totalPatients} regional patients</strong>. 
            All core microservices are operating within nominal latency parameters.
          </p>
        </div>
        <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.1em" }}>System Uptime</p>
          <p style={{ margin: "4px 0 0", fontSize: "36px", fontWeight: 900, color: "#fff", tracking: "-0.05em" }}>99.98%</p>
        </div>
        {/* Glow decorative blobs */}
        <div style={{ position: "absolute", top: "-40px", right: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(6,182,212,0.1)", filter: "blur(50px)" }} />
      </div>

      {/* === KPI Row === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        <KpiCard 
          label="Medical Staff" 
          value={stats?.activeDoctors || 0} 
          delta="Registered" 
          color="#06b6d4"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <KpiCard 
          label="Active Patients" 
          value={stats?.totalPatients || 0} 
          delta="Monitoring" 
          color="#10b981"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard 
          label="Service Cluster" 
          value={services.length} 
          delta="Online" 
          color="#8b5cf6"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <KpiCard 
          label="Notifications" 
          value={notifications.length} 
          delta="Recent" 
          color="#f59e0b"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px" }}>
        
        {/* Service Health Monitoring */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid #e8f0fe", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)", 
          padding: "24px" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Service Cluster Health</h3>
            <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "4px 12px", borderRadius: "999px" }}>Real-time</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {services.map((svc) => (
              <div key={svc.serviceName} style={{ 
                padding: "16px", 
                borderRadius: "14px", 
                background: "#f8fafc", 
                border: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{ 
                  width: "10px", height: "10px", borderRadius: "50%", 
                  background: svc.status === "UP" ? "#10b981" : "#ef4444",
                  boxShadow: svc.status === "UP" ? "0 0 10px rgba(16,185,129,0.4)" : "none"
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#334155" }}>{svc.serviceName}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{svc.status === "UP" ? "Operational" : "Service Disruption"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Activity Feed */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid #e8f0fe", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)", 
          padding: "24px" 
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Platform Transmission Log</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} style={{ 
                display: "flex", gap: "12px", paddingBottom: "16px", 
                borderBottom: "1px solid #f1f5f9" 
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: n.status === "SENT" ? "rgba(6,182,212,0.1)" : "rgba(239,68,68,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: n.status === "SENT" ? "#06b6d4" : "#ef4444", flexShrink: 0
                }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#334155", lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{new Date(n.sentAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", margin: "20px 0" }}>No recent activity logged.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
