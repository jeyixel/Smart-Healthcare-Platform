"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientTopBar() {
  const pathname = usePathname();
  const [patientName, setPatientName] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email") || "";
    if (email) {
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      setPatientName(name);
    }
  }, []);

  const getPageTitle = () => {
    if (pathname === "/patient-landing") return "Patient Dashboard";
    if (pathname.includes("/book")) return "Book Appointment";
    if (pathname.includes("/prescriptions")) return "My Prescriptions";
    if (pathname.includes("/telemedicine")) return "Telemedicine";
    if (pathname.includes("/profile")) return "Medical Profile";
    if (pathname.includes("/notifications")) return "Notifications";
    return "Patient Portal";
  };

  return (
    <header style={{
      height: "72px",
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      position: "fixed",
      top: 0,
      right: 0,
      left: "260px",
      zIndex: 90,
      transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      {/* Left: Breadcrumbs / Title */}
      <div>
        <h1 style={{ 
          margin: 0, 
          fontSize: "18px", 
          fontWeight: 700, 
          color: "#0f172a",
          letterSpacing: "-0.01em"
        }}>
          {getPageTitle()}
        </h1>
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
          <span>SmartHealth</span>
          <span>/</span>
          <span style={{ color: "#06b6d4", fontWeight: 500 }}>{getPageTitle()}</span>
        </div>
      </div>

      {/* Center: Search Bar (Premium look) */}
      <div style={{ 
        flex: "0 1 400px", 
        margin: "0 40px",
        position: "relative" 
      }}>
        <div style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: searchFocused ? "#06b6d4" : "#94a3b8",
          transition: "color 0.2s"
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search appointments, doctors, or records..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%",
            height: "42px",
            background: "#f1f5f9",
            border: searchFocused ? "1px solid #06b6d4" : "1px solid transparent",
            borderRadius: "12px",
            padding: "0 16px 0 46px",
            fontSize: "14px",
            color: "#1e293b",
            transition: "all 0.2s",
            outline: "none",
            boxShadow: searchFocused ? "0 0 10px rgba(6, 182, 212, 0.1)" : "none"
          }}
        />
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button style={{
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          position: "relative",
          padding: "8px"
        }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "8px",
            height: "8px",
            background: "#ef4444",
            borderRadius: "50%",
            border: "2px solid #fff"
          }} />
        </button>

        <div style={{
          width: "1px",
          height: "24px",
          background: "#e2e8f0"
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right", display: "none" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{patientName}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Patient</p>
          </div>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #06b6d4, #0891b2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            boxShadow: "0 4px 10px rgba(6, 182, 212, 0.25)"
          }}>
            {patientName.charAt(0) || "P"}
          </div>
        </div>
      </div>
    </header>
  );
}
