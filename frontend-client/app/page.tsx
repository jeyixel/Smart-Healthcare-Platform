"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientLandingPage from "@/app/components/common/landing/PatientLandingPage";

/**
 * Root Route: /
 * This page serves as the public landing page.
 * If a user is already authenticated, it redirects them to their respective dashboard.
 */
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (token && role) {
      // Redirect authenticated users to their dashboards
      if (role === "DOCTOR") {
        router.push("/doctor");
      } else if (role === "PATIENT") {
        router.push("/patient/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        setLoading(false);
      }
    } else {
      // Not logged in, show landing page
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 50%,#0a1628 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(6,182,212,0.1)",
          borderTop: "3px solid #06b6d4",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <PatientLandingPage />;
}
