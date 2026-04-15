"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/lib/api";
import { useDoctorContext } from "@/app/context/DoctorContext";

/**
 * Handles all JWT token verification for the doctor dashboard.
 * Reads token from localStorage, validates it against /auth/me,
 * and populates the DoctorContext. Redirects to /login on failure.
 */
export function useDoctorAuth() {
  const router = useRouter();
  const { session, setSession } = useDoctorContext();

  useEffect(() => {
    // Already authenticated in this render cycle
    if (session) return;

    const verifyAccess = async () => {
      const token = localStorage.getItem("smart_admin_token");
      const role = localStorage.getItem("smart_admin_role");

      if (!token || role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      try {
        const profile = await fetchCurrentUser(token);

        if (profile.role !== "DOCTOR" || !profile.approved) {
          localStorage.removeItem("smart_admin_token");
          localStorage.removeItem("smart_admin_role");
          localStorage.removeItem("smart_admin_email");
          router.push("/login");
          return;
        }

        localStorage.setItem("smart_admin_email", profile.email);

        const namePart = profile.email.split("@")[0];
        const displayName = namePart
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        setSession({
          email: profile.email,
          role: profile.role,
          token,
          displayName: `Dr. ${displayName}`,
        });
      } catch {
        localStorage.removeItem("smart_admin_token");
        localStorage.removeItem("smart_admin_role");
        localStorage.removeItem("smart_admin_email");
        router.push("/login");
      }
    };

    void verifyAccess();
  }, [router, session, setSession]);

  return { session };
}
