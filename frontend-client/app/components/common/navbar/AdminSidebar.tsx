"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/appointments",
    label: "Appointments",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/doctors",
    label: "Doctors",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/patients",
    label: "Patients",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/admin/profile",
    label: "Profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email") || "admin@smarthealth.com";
    setAdminEmail(email);
    const namePart = email.split("@")[0];
    setAdminName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    router.push("/login");
  };

  const sidebarWidth = collapsed ? "72px" : "260px";

  return (
    <>
      <aside style={{
        width: sidebarWidth,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a1628 0%, #0d1b3e 50%, #0a0f1e 100%)",
        borderRight: "1px solid rgba(99,102,241,0.12)",
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
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "20px 0" : "20px",
          borderBottom: "1px solid rgba(99,102,241,0.08)",
          minHeight: "72px",
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(99,102,241,0.4)", flexShrink: 0,
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "13px", letterSpacing: "0.02em" }}>SmartHealth</p>
                <p style={{ margin: 0, color: "#818cf8", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Console</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(99,102,241,0.35)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <button onClick={() => setCollapsed((c) => !c)} style={{
            background: "rgba(99,102,241,0.1)", border: "none", cursor: "pointer",
            color: "#94a3b8", padding: "6px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s", flexShrink: 0,
            marginLeft: collapsed ? "0" : "auto",
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />}
            </svg>
          </button>
        </div>

        {/* Nav label */}
        {!collapsed && (
          <p style={{ margin: "8px 20px 6px", color: "#475569", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Management
          </p>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "8px 10px" : "4px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                title={collapsed ? link.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: collapsed ? "12px" : "11px 14px",
                  borderRadius: "10px", border: "none", cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.12))"
                    : "transparent",
                  color: isActive ? "#818cf8" : "#94a3b8",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  width: "100%", textAlign: "left",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderLeft: isActive && !collapsed ? "3px solid #6366f1" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
              >
                <span style={{ flexShrink: 0, filter: isActive ? "drop-shadow(0 0 6px rgba(99,102,241,0.6))" : "none" }}>
                  {link.icon}
                </span>
                {!collapsed && <span style={{ flex: 1 }}>{link.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}>
          {!collapsed && (
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: "13px", flexShrink: 0,
              }}>
                {adminName.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminName}</p>
                <p style={{ margin: 0, color: "#6366f1", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>System Admin</p>
              </div>
            </div>
          )}
          <div style={{ padding: collapsed ? "12px 10px" : "0 12px 12px" }}>
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: collapsed ? "12px" : "11px 14px",
                borderRadius: "10px", border: "none",
                cursor: "pointer", transition: "all 0.2s",
                background: "rgba(239,68,68,0.1)", color: "#ef4444",
                fontSize: "14px", fontWeight: 500,
                width: "100%", textAlign: "left",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
