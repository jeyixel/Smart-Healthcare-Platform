"use client";

import AdminSidebar from "@/app/components/common/navbar/AdminSidebar";
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
      <div style={{
        display: "flex", height: "100vh", width: "100%",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg,#0a1628,#0d1b3e)",
        color: "white", fontSize: "14px", fontWeight: 600
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", animation: "pulse 2s infinite"
          }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ margin: 0, color: "#94a3b8" }}>Authorizing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AdminSidebar />
      <main style={{ flex: 1, paddingLeft: "260px", transition: "padding-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
