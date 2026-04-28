"use client";

import { useState, useEffect } from "react";
import { usePatientContext } from "@/app/context/PatientContext";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "../doctor-management/ConfirmationModal";
import { getPatientName } from "@/app/utils/tokenUtils";

export function PatientTopBar() {
  const { activeSection, setActiveSection, sidebarCollapsed, logout } = usePatientContext();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const patientName = getPatientName();

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard:      { title: "Dashboard", subtitle: `Welcome back, ${patientName.split(" ")[0]}!` },
    appointments:   { title: "Appointments", subtitle: "Manage your medical consultations" },
    prescriptions:  { title: "Prescriptions", subtitle: "View and track your medical prescriptions" },
    "ai-suggestions": { title: "AI Health Insights", subtitle: "Personalized suggestions for your well-being" },
    telemedicine:   { title: "Telemedicine", subtitle: "Connect with doctors via video call" },
    profile:        { title: "My Profile", subtitle: "Manage your personal information and health records" },
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = document.getElementById('patient-profile-dropdown');
      if (dropdown && !dropdown.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sideWidth = sidebarCollapsed ? 72 : 260;

  return (
    <>
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

        {/* Center: Search */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "8px 14px",
          gap: "10px",
          width: "min(340px, 30vw)",
        }}>
          <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search health records, doctors..."
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: "13px", color: "#334155", flex: 1,
            }}
          />
        </div>

        {/* Right: time, profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right", marginRight: "4px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{currentTime}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{currentDate}</p>
          </div>

          <div style={{ width: "1px", height: "32px", background: "#e2e8f0" }} />

          {/* Profile avatar */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "6px 12px",
                background: profileOpen ? "rgba(6,182,212,0.1)" : "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px", cursor: "pointer",
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "13px",
              }}>
                {patientName.charAt(0).toUpperCase()}
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div id="patient-profile-dropdown" style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: "240px", background: "#fff",
                borderRadius: "16px", border: "1px solid #e2e8f0",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 200,
                overflow: "hidden",
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{patientName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Patient</p>
                </div>
                <div style={{ padding: "8px 0" }}>
                  <button onClick={() => { setActiveSection("profile"); setProfileOpen(false); }}
                    style={{ width: "100%", padding: "10px 20px", background: "none", border: "none", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "13px", color: "#334155" }}>
                    View Profile
                  </button>
                  <div style={{ height: "1px", background: "#f1f5f9", margin: "8px 0" }} />
                  <button onClick={() => setShowLogoutModal(true)}
                    style={{ width: "100%", padding: "10px 20px", background: "none", border: "none", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "13px", color: "#ef4444" }}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={logout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
