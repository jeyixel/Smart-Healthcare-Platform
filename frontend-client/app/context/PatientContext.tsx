"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  | "ai-suggestions"
  | "telemedicine"
  | "profile";

interface PatientContextValue {
  session: PatientSession | null;
  setSession: (s: PatientSession | null) => void;
  activeSection: PatientNavSection;
  setActiveSection: (s: PatientNavSection) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [activeSection, setActiveSection] = useState<PatientNavSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        activeSection, setActiveSection, 
        sidebarCollapsed, toggleSidebar, 
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
