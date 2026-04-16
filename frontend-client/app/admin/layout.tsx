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
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <p className="animate-pulse">Authorizing session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar />
      <main className="flex-1 pl-[260px]">
        <div className="mx-auto max-w-7xl p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
