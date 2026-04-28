"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctorContext, DoctorNavSection } from "@/app/context/DoctorContext";
import { ConfirmationModal } from "./ConfirmationModal";
import { getDoctorName } from "@/app/utils/tokenUtils";

interface NavItem {
  id: DoctorNavSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "patients",
    label: "My Patients",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "telemedicine",
    label: "Telemedicine",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    badge: 1,
  },
  {
    id: "schedule",
    label: "My Schedule",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function DoctorSidebar() {
  const router = useRouter();
  const { session, activeSection, setActiveSection, sidebarCollapsed, toggleSidebar, logout } = useDoctorContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <aside style={{
      width: sidebarCollapsed ? "72px" : "260px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0f1e 0%, #0d1529 40%, #0b1220 100%)",
      borderRight: "1px solid rgba(6,182,212,0.12)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
    }}>
      {/* Logo + collapse */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: sidebarCollapsed ? "center" : "space-between",
        padding: sidebarCollapsed ? "20px 0" : "20px 20px",
        borderBottom: "1px solid rgba(6,182,212,0.08)",
        minHeight: "72px",
      }}>
        {!sidebarCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(6,182,212,0.4)",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "13px", letterSpacing: "0.02em" }}>SmartHealth</p>
              <p style={{ margin: 0, color: "#06b6d4", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Doctor Portal</p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(6,182,212,0.35)",
          }}>
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
            </svg>
          </div>
        )}
        <button onClick={toggleSidebar} style={{
          background: "rgba(6,182,212,0.1)", border: "none", cursor: "pointer",
          color: "#94a3b8", padding: "6px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
          flexShrink: 0,
          marginLeft: sidebarCollapsed ? "0" : "auto",
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarCollapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />}
          </svg>
        </button>
      </div>

      {/* Nav label */}
      {!sidebarCollapsed && (
        <p style={{ margin: "8px 20px 6px", color: "#475569", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Navigation
        </p>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: "auto", padding: sidebarCollapsed ? "8px 10px" : "4px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "telemedicine") {
                  router.push("/doctor/telemedicine");
                } else {
                  setActiveSection(item.id);
                }
              }}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: sidebarCollapsed ? "12px" : "11px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: isActive
                  ? "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(8,145,178,0.12))"
                  : "transparent",
                color: isActive ? "#06b6d4" : "#94a3b8",
                fontWeight: isActive ? 600 : 400,
                fontSize: "14px",
                transition: "all 0.2s ease",
                width: "100%",
                textAlign: "left",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                borderLeft: isActive && !sidebarCollapsed ? "3px solid #06b6d4" : "3px solid transparent",
                position: "relative",
              }}
            >
              <span style={{
                flexShrink: 0,
                filter: isActive ? "drop-shadow(0 0 6px rgba(6,182,212,0.6))" : "none",
              }}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!sidebarCollapsed && item.badge !== undefined && (
                <span style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "999px",
                  padding: "1px 7px",
                  minWidth: "18px",
                  textAlign: "center",
                  boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: sidebarCollapsed ? "12px 10px" : "12px", borderTop: "1px solid rgba(6,182,212,0.08)" }}>
        <button
          onClick={() => setShowLogoutModal(true)}
          title={sidebarCollapsed ? "Logout" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: sidebarCollapsed ? "12px" : "11px 14px",
            borderRadius: "10px", border: "none",
            cursor: "pointer", transition: "all 0.2s",
            background: "rgba(239, 68, 68, 0.1)", color: "#ef4444",
            fontSize: "14px", fontWeight: 500,
            width: "100%", textAlign: "left",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.1)"; }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
