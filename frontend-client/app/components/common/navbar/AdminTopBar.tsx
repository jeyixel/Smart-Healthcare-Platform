"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    "/admin": { title: "Overview", subtitle: "System-wide analytical telemetry" },
    "/admin/appointments": { title: "Appointments", subtitle: "Global scheduling oversight" },
    "/admin/doctors": { title: "Medical Staff", subtitle: "Manage provider credentials and access" },
    "/admin/patients": { title: "Patient Registry", subtitle: "Monitor regional health records" },
    "/admin/analytics": { title: "System Analytics", subtitle: "Deep dive into platform performance" },
    "/admin/profile": { title: "Security & Profile", subtitle: "Manage administrative settings" },
  };

  const page = pageTitles[pathname] ?? { title: "Administration", subtitle: "Smart Healthcare Management" };

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email") || "Admin";
    setAdminName(email.split("@")[0].toUpperCase());

    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: "260px",
      right: 0,
      height: "72px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(6, 182, 212, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      zIndex: 90,
      boxShadow: "0 1px 20px rgba(0,0,0,0.06)",
    }}>
      {/* Page Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
          {page.title}
        </h1>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
          {page.subtitle}
        </p>
      </div>

      {/* Center Search (Mock) */}
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
          placeholder="Search system registry..."
          style={{
            border: "none", background: "transparent", outline: "none",
            fontSize: "13px", color: "#334155", flex: 1,
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{currentTime}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{currentDate}</p>
        </div>
        
        <div style={{ width: "1px", height: "32px", background: "#e2e8f0" }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4, #0284c7)",
            display: "flex", alignItems: "center", justifyCenter: "center",
            color: "#fff", fontWeight: 700, fontSize: "13px",
            boxShadow: "0 0 10px rgba(6, 182, 212, 0.35)",
            textAlign: "center", lineHeight: "32px"
          }}>
            {adminName.charAt(0)}
          </div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Admin</p>
        </div>
      </div>
    </header>
  );
}
