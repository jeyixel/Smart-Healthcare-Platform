"use client";

import { useState, useEffect } from "react";
import { useDoctorContext } from "@/app/context/DoctorContext";
import { useAppointments } from "@/app/hooks/useAppointments";

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
  const { doctor, refetch } = useAppointments();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  // Add pulse animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const sideWidth = sidebarCollapsed ? 72 : 260;

  const notifications = [
    { id: 1, text: "New appointment request from Patient #4821", time: "2 min ago", unread: true, type: "appointment" },
    { id: 2, text: "Lab results ready for Mr. Kamal Fernando", time: "18 min ago", unread: true, type: "lab" },
    { id: 3, text: "Telemedicine session starting in 10 minutes", time: "42 min ago", unread: false, type: "video" },
    { id: 4, text: "Prescription #3299 dispensed successfully", time: "1 hr ago", unread: false, type: "prescription" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleStatusChange = async () => {
    if (!doctor || updatingStatus) return;
    
    setUpdatingStatus(true);
    try {
      const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_BASE ?? "http://localhost:8082";
      const token = localStorage.getItem("smart_admin_token");
      
      const response = await fetch(`${DOCTOR_API}/api/v1/doctors/${doctor.id}/active?active=${!doctor.active}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update active status");
      }

      // Show success feedback
      const newStatus = !doctor.active;
      console.log(`Doctor status updated to: ${newStatus ? "Active" : "Inactive"}`);
      
      // Refetch doctor data to get updated status
      await refetch();
    } catch (error) {
      console.error("Error updating doctor status:", error);
    } finally {
      setUpdatingStatus(false);
      setProfileOpen(false);
    }
  };

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

        {/* Profile avatar with dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "6px 12px 6px 6px",
              background: profileOpen ? "rgba(6,182,212,0.1)" : "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px", cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg,#06b6d4,#0284c7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "13px",
              boxShadow: "0 0 10px rgba(6,182,212,0.35)",
            }}>
              {session?.displayName?.replace("Dr. ", "").charAt(0).toUpperCase() || "D"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{session?.displayName || "Doctor"}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>General Physician</p>
            </div>
            <svg width="16" height="16" fill="none" stroke="#64748b" viewBox="0 0 24 24" style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: "280px", background: "#fff",
              borderRadius: "16px", border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 200,
              overflow: "hidden",
            }}>
              {/* Profile Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                    boxShadow: "0 0 12px rgba(6,182,212,0.4)",
                  }}>
                    {session?.displayName?.replace("Dr. ", "").charAt(0).toUpperCase() || "D"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{session?.displayName || "Doctor"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>General Physician</p>
                  </div>
                </div>
              </div>

              {/* Active Status Section */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Active Status</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 500,
                    color: doctor?.active ? "#10b981" : "#ef4444",
                    background: doctor?.active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    padding: "2px 8px", borderRadius: "999px",
                  }}>
                    {doctor?.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
                  {doctor?.active 
                    ? "You are currently accepting new appointments and patient requests."
                    : "You are not accepting new appointments. Patients cannot book with you."
                  }
                </p>
                <button
                  onClick={handleStatusChange}
                  disabled={updatingStatus}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: doctor?.active 
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: updatingStatus ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: updatingStatus ? 0.7 : 1,
                  }}
                >
                  {updatingStatus ? "Updating..." : doctor?.active ? "Set as Inactive" : "Set as Active"}
                </button>
              </div>

              {/* Menu Items */}
              <div style={{ padding: "8px 0" }}>
                <button style={{
                  width: "100%", padding: "10px 20px",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: "12px",
                  cursor: "pointer", transition: "background 0.2s",
                  fontSize: "13px", color: "#334155",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </button>
                <button style={{
                  width: "100%", padding: "10px 20px",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: "12px",
                  cursor: "pointer", transition: "background 0.2s",
                  fontSize: "13px", color: "#334155",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <div style={{ height: "1px", background: "#f1f5f9", margin: "8px 0" }} />
                <button style={{
                  width: "100%", padding: "10px 20px",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: "12px",
                  cursor: "pointer", transition: "background 0.2s",
                  fontSize: "13px", color: "#ef4444",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Status Indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 12px", borderRadius: "999px",
          background: doctor?.active 
            ? "rgba(16,185,129,0.1)" 
            : "rgba(239,68,68,0.1)",
          border: `1px solid ${doctor?.active ? "#10b981" : "#ef4444"}30`,
        }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: doctor?.active ? "#10b981" : "#ef4444",
            boxShadow: doctor?.active 
              ? "0 0 6px rgba(16,185,129,0.6)" 
              : "0 0 6px rgba(239,68,68,0.6)",
            animation: doctor?.active ? "pulse 2s infinite" : "none",
          }} />
          <span style={{
            fontSize: "12px", fontWeight: 600,
            color: doctor?.active ? "#10b981" : "#ef4444",
          }}>
            {doctor?.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </header>
  );
}
