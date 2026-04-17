"use client";

import AdminSidebar from "@/app/components/common/navbar/AdminSidebar";
import AdminTopBar from "@/app/components/common/navbar/AdminTopBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "ADMIN") {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div suppressHydrationWarning style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 50%,#0a1628 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}>
        <div suppressHydrationWarning style={{
          width: "60px", height: "60px", borderRadius: "16px",
          background: "linear-gradient(135deg,#06b6d4,#0891b2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px rgba(6,182,212,0.5)",
          animation: "pulse 2s infinite",
        }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
          </svg>
        </div>
        <div suppressHydrationWarning style={{ textAlign: "center" }}>
          <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 700, fontSize: "16px" }}>SmartHealth Admin</p>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>Security clearance required…</p>
        </div>
        <style>{`
          @keyframes pulse { 0%,100%{box-shadow:0 0 32px rgba(6,182,212,0.5)} 50%{box-shadow:0 0 48px rgba(6,182,212,0.8)} }
        `}</style>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <AdminSidebar />
      <AdminTopBar />
      <main style={{
        marginLeft: "260px",
        paddingTop: "72px",
        minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "28px 28px 40px", maxWidth: "1600px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
