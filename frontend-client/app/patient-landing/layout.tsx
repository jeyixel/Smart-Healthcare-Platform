"use client";

import PatientSidebar from "@/app/components/common/navbar/PatientSidebar";
import PatientTopBar from "@/app/components/common/navbar/PatientTopBar";
import { usePathname } from "next/navigation";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If we are on login/register or some other page that shouldn't have the shell,
  // we could handle it here. But for /patient-landing/**/* it's usually safe.

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <PatientSidebar />
      
      <div style={{ 
        marginLeft: "260px",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
        position: "relative"
      }}>
        <PatientTopBar />
        
        <main style={{ 
          padding: "104px 32px 32px", // 72px topbar + 32px gap
          maxWidth: "1600px",
          margin: "0 auto"
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
