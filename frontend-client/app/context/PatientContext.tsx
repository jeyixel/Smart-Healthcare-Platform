"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Patient } from "@/types/api";
import { fetchPatientByEmail } from "@/lib/api";

export interface PatientSession {
  email: string;
  role: string;
  token: string;
  displayName: string;
}

export type PatientNavSection =
  | "dashboard"
  | "appointments"
  | "prescriptions"
  | "reports"
  | "ai-suggestions"
  | "telemedicine"
  | "profile"
  | "help-support";

interface PatientContextValue {
  session: PatientSession | null;
  setSession: (s: PatientSession | null) => void;
  patient: Patient | null;
  loadingProfile: boolean;
  activeSection: PatientNavSection;
  setActiveSection: (s: PatientNavSection) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeSection, setActiveSection] = useState<PatientNavSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session) return;
    setLoadingProfile(true);
    try {
      const data = await fetchPatientByEmail(session.token, session.email);
      setPatient(data);
    } catch (err) {
      console.error("Failed to refresh patient profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && !patient) {
      refreshProfile();
    }
  }, [session, patient, refreshProfile]);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const logout = useCallback(() => {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    setSession(null);
    window.location.href = "/login";
  }, []);

  return (
    <PatientContext.Provider
      value={{ 
        session, setSession, 
        patient, loadingProfile,
        activeSection, setActiveSection, 
        sidebarCollapsed, toggleSidebar, 
        refreshProfile,
        logout 
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatientContext must be used inside <PatientProvider>");
  return ctx;
}
