"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PatientSession } from "@/app/context/PatientContext";

export function usePatientAuth() {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");
    const email = localStorage.getItem("smart_admin_email");

    if (!token || role !== "PATIENT") {
      router.push("/login");
      return;
    }

    setSession({
      token,
      role,
      email: email || "",
      displayName: email ? email.split("@")[0] : "Patient",
    });
    setLoading(false);
  }, [router]);

  return { session, loading };
}
