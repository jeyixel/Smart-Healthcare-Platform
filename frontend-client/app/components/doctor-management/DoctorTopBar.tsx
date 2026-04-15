"use client";

import { useState, useEffect } from "react";
import { useDoctorContext } from "@/app/context/DoctorContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: "Overview", subtitle: "Welcome back to your clinical workspace" },
  appointments:  { title: "Appointments", subtitle: "Manage and review your scheduled appointments" },
  patients:      { title: "My Patients", subtitle: "View and manage your patient records" },
  prescriptions: { title: "Prescriptions", subtitle: "Create and track medical prescriptions" },
  telemedicine:  { title: "Telemedicine", subtitle: "Start or join video consultations" },
  schedule:      { title: "My Schedule", subtitle: "Manage your availability and working hours" },
  reports:       { title: "Reports & Analytics", subtitle: "Insights into your clinical performance" },
  settings:      { title: "Settings", subtitle: "Manage your profile and preferences" },
};

export function DoctorTopBar() {
  const { session, activeSection, sidebarCollapsed } = useDoctorContext();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const page = pageTitles[activeSection] ?? pageTitles.dashboard;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const sideWidth = sidebarCollapsed ? 72 : 260;

  const notifications = [
    { id: 1, text: "New appointment request from Patient #4821", time: "2 min ago", unread: true, type: "appointment" },
    { id: 2, text: "Lab results ready for Mr. Kamal Fernando", time: "18 min ago", unread: true, type: "lab" },
    { id: 3, text: "Telemedicine session starting in 10 minutes", time: "42 min ago", unread: false, type: "video" },
    { id: 4, text: "Prescription #3299 dispensed successfully", time: "1 hr ago", unread: false, type: "prescription" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: sideWidth,
      right: 0,
      height: "72px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(6,182,212,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      zIndex: 90,
      transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: "0 1px 20px rgba(0,0,0,0.06)",
    }}>
      {/* Left: page title */}
      <div>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
          {page.title}
        </h1>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
          {page.subtitle}
        </p>
      </div>

      {/* Center: live search */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "8px 14px",
        gap: "10px",
        width: "min(340px, 30vw)",
        transition: "border-color 0.2s",
      }}>
        <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients, appointments..."
          style={{
            border: "none", background: "transparent", outline: "none",
            fontSize: "13px", color: "#334155", flex: 1, fontFamily: "inherit",
          }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Right: time, notifs, profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Date/time */}
        <div style={{ textAlign: "right", marginRight: "4px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{currentTime}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{currentDate}</p>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "32px", background: "#e2e8f0" }} />

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            style={{
              position: "relative", background: notifOpen ? "rgba(6,182,212,0.1)" : "#f8fafc",
              border: "1px solid #e2e8f0", borderRadius: "10px",
              width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#475569", transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "6px", right: "6px",
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 6px rgba(239,68,68,0.7)",
              }} />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: "340px", background: "#fff",
              borderRadius: "16px", border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 200,
              overflow: "hidden",
            }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Notifications</p>
                <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "999px", padding: "2px 8px" }}>{unreadCount} new</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={{
                  padding: "14px 20px",
                  background: n.unread ? "rgba(6,182,212,0.03)" : "#fff",
                  borderBottom: "1px solid #f8fafc",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", marginTop: "5px", flexShrink: 0,
                    background: n.unread ? "#06b6d4" : "#e2e8f0",
                    boxShadow: n.unread ? "0 0 6px rgba(6,182,212,0.5)" : "none",
                  }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>{n.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 20px", textAlign: "center" }}>
                <button style={{ background: "none", border: "none", color: "#06b6d4", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        {session && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "6px 12px 6px 6px",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "12px", cursor: "pointer",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg,#06b6d4,#0284c7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "13px",
              boxShadow: "0 0 10px rgba(6,182,212,0.35)",
            }}>
              {session.displayName.replace("Dr. ", "").charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{session.displayName}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>General Physician</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
