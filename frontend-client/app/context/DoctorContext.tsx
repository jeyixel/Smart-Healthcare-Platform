"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface DoctorSession {
  email: string;
  role: string;
  token: string;
  displayName: string;
}

export type DoctorNavSection =
  | "dashboard"
  | "appointments"
  | "patients"
  | "prescriptions"
  | "telemedicine"
  | "schedule"
  | "reports"
  | "profile";

interface DoctorContextValue {
  session: DoctorSession | null;
  setSession: (s: DoctorSession | null) => void;
  activeSection: DoctorNavSection;
  setActiveSection: (s: DoctorNavSection) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  logout: () => void;
  prescriptionDraftAppointment: any;
  setPrescriptionDraftAppointment: (appt: any) => void;
}

const DoctorContext = createContext<DoctorContextValue | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [activeSection, setActiveSection] = useState<DoctorNavSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [prescriptionDraftAppointment, setPrescriptionDraftAppointment] = useState<any>(null);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const logout = useCallback(() => {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    setSession(null);
    window.location.href = "/login";
  }, []);

  return (
    <DoctorContext.Provider
      value={{ 
        session, setSession, 
        activeSection, setActiveSection, 
        sidebarCollapsed, toggleSidebar, 
        logout,
        prescriptionDraftAppointment, setPrescriptionDraftAppointment 
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctorContext() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctorContext must be used inside <DoctorProvider>");
  return ctx;
}
