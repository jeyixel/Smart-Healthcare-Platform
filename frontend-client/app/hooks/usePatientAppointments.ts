"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type ConsultationType = "ONLINE" | "PHYSICAL";

export interface PatientAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;   // "YYYY-MM-DD"
  appointmentTime: string;   // "HH:mm:ss"
  consultationType: ConsultationType;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSearchResponse {
  id: string;
  fullName: string;
  specialty: string;
  category: string;
  qualification: string;
  experienceYears: number;
  hospitalOrClinic: string;
  consultationFee: number;
  consultationMode: "ONLINE" | "PHYSICAL";
  verified: boolean;
  active: boolean;
  profileImageUrl: string | null;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // LocalDate
  appointmentTime: string; // LocalTime
  consultationType: ConsultationType;
  reason?: string;
}

export interface RescheduleAppointmentRequest {
  appointmentDate: string; // LocalDate
  appointmentTime: string; // LocalTime
}

export interface UsePatientAppointmentsResult {
  appointments: PatientAppointment[];
  patient: { id: string; email: string; firstName: string; lastName: string } | null;
  doctors: DoctorSearchResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createAppointment: (data: CreateAppointmentRequest) => Promise<void>;
  rescheduleAppointment: (id: string, data: RescheduleAppointmentRequest) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string };
      throw new Error(parsed.message ?? parsed.error ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(body || `HTTP ${res.status}`);
    }
  }
  return (await res.json()) as T;
}

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload !== null && typeof payload === "object") {
    const wrapped = payload as Record<string, unknown>;
    const candidates = ["value", "data", "content", "items", "results"];

    for (const key of candidates) {
      if (Array.isArray(wrapped[key])) {
        return wrapped[key] as T[];
      }
    }
  }

  return [];
}

function extractFirstObjectArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload !== null && typeof payload === "object") {
    const values = Object.values(payload as Record<string, unknown>);
    for (const value of values) {
      if (Array.isArray(value)) {
        return value as T[];
      }
      const nested = extractFirstObjectArray<T>(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function showToast(message: string, type: "success" | "error") {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("patient-appointment-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "patient-appointment-toast";
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)"};
    color: #fff;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"};
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    min-width: 280px;
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  `;
  icon.innerHTML = type === "success"
    ? `<svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : `<svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>`;

  const content = document.createElement("div");
  content.innerHTML = `
    <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${type === "success" ? "Success!" : "Error!"}</h4>
    <p style="margin: 0; font-size: 14px; opacity: 0.9;">${message}</p>
  `;

  toast.appendChild(icon); toast.appendChild(content);
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3000);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePatientAppointments(): UsePatientAppointmentsResult {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [patient, setPatient] = useState<{ id: string; email: string; firstName: string; lastName: string } | null>(null);
  const [doctors, setDoctors] = useState<DoctorSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("smart_admin_token");
        const role = localStorage.getItem("smart_admin_role");
        const email = localStorage.getItem("smart_admin_email");

        if (!token || role !== "PATIENT" || !email) {
          throw new Error("Patient authentication required");
        }

        // 1. Get patient by email
        const patientRes = await fetch(`${API_GATEWAY}/api/v1/patients/email/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const patientData = await safeJson<{ id: string; email: string; firstName: string; lastName: string }>(patientRes);
        if (cancelled) return;
        setPatient(patientData);

        // 2. Get patient appointments
        const apptRes = await fetch(`${API_GATEWAY}/api/v1/appointments/patient/${patientData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const apptData = await safeJson<unknown>(apptRes);
        if (cancelled) return;
        setAppointments(normalizeListResponse<PatientAppointment>(apptData));

        // 3. Get list of doctors for creation dropdown
        const doctorsRes = await fetch(`${API_GATEWAY}/api/v1/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const doctorsData = await safeJson<unknown>(doctorsRes);
        if (cancelled) return;
        const parsedDoctors = normalizeListResponse<DoctorSearchResponse>(doctorsData);
        setDoctors(parsedDoctors.length > 0 ? parsedDoctors : extractFirstObjectArray<DoctorSearchResponse>(doctorsData));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load appointments");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Create appointment ────────────────────────────────────────────────

  const createAppointment = useCallback(async (data: CreateAppointmentRequest) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_GATEWAY}/api/v1/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const created = await safeJson<PatientAppointment>(response);
      setAppointments((prev) => [...prev, created]);
      showToast("Appointment created successfully!", "success");
    } catch (e) {
      console.error("Create appointment error:", e);
      showToast(e instanceof Error ? e.message : "Failed to create appointment", "error");
      throw e;
    }
  }, []);

  // ── Reschedule appointment (only pending allowed) ─────────────────────

  const rescheduleAppointment = useCallback(async (id: string, data: RescheduleAppointmentRequest) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_GATEWAY}/api/v1/appointments/${id}/reschedule`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const updated = await safeJson<PatientAppointment>(response);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast("Appointment rescheduled successfully!", "success");
    } catch (e) {
      console.error("Reschedule appointment error:", e);
      showToast(e instanceof Error ? e.message : "Failed to reschedule appointment", "error");
      throw e;
    }
  }, []);

  // ── Delete appointment ────────────────────────────────────────────────

  const deleteAppointment = useCallback(async (id: string) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_GATEWAY}/api/v1/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        await safeJson<unknown>(response);
      }

      setAppointments((prev) => prev.filter((a) => a.id !== id));
      showToast("Appointment cancelled successfully!", "success");
    } catch (e) {
      console.error("Delete appointment error:", e);
      showToast(e instanceof Error ? e.message : "Failed to cancel appointment", "error");
      throw e;
    }
  }, []);

  return { appointments, patient, doctors, loading, error, refetch, createAppointment, rescheduleAppointment, deleteAppointment };
}

// Add CSS animations globally once
if (typeof document !== "undefined" && !document.getElementById("patient-appointment-toast-styles")) {
  const style = document.createElement("style");
  style.id = "patient-appointment-toast-styles";
  style.textContent = `
    @keyframes slideIn { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);
}
