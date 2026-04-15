"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type ConsultationType  = "ONLINE" | "PHYSICAL";

export interface Appointment {
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

export interface DoctorProfile {
  id: string;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  category: string;
  qualification: string;
  experienceYears: number;
  hospitalOrClinic: string;
  consultationFee: number;
  consultationMode: string;
  bio: string;
  profileImageUrl: string | null;
  licenseNumber: string;
  verified: boolean;
  active: boolean;
}

export interface UseAppointmentsResult {
  appointments: Appointment[];
  doctor: DoctorProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateAppointmentStatus: (
    id: string,
    status: AppointmentStatus,
    notes?: string
  ) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCTOR_API  = process.env.NEXT_PUBLIC_DOCTOR_API_BASE      ?? "http://localhost:8082";
const APPT_API    = process.env.NEXT_PUBLIC_APPOINTMENT_API_BASE  ?? "http://localhost:8083";

// ─── JWT userId extractor ─────────────────────────────────────────────────────
// The admin JwtService stores userId as a Number (Long) claim: extraClaims.put("userId", user.getId())
// JSON serialises this as a plain integer, e.g. {"userId": 42, "role": "DOCTOR", "sub": "..."}

function decodeUserId(token: string): number | null {
  try {
    // Standard base64url → base64 conversion then parse
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded: Record<string, unknown> = JSON.parse(atob(padded));

    // Claim name is "userId" (confirmed in service-admin JwtService.java)
    const raw = decoded["userId"];

    if (typeof raw === "number") return raw;            // Number (most common from JJWT)
    if (typeof raw === "string") {
      const n = Number(raw);
      return isNaN(n) ? null : n;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Safe JSON helper ─────────────────────────────────────────────────────────

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor]             = useState<DoctorProfile | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [tick, setTick]                 = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get JWT from localStorage
        const token = localStorage.getItem("smart_admin_token");
        if (!token) throw new Error("No authentication token found. Please log in.");

        // 2. Decode userId from JWT
        const userId = decodeUserId(token);
        if (!userId) throw new Error("Could not extract user ID from token.");

        // 3. Fetch doctor profile by userId
        const doctorRes = await fetch(`${DOCTOR_API}/api/v1/doctors/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const doctorProfile = await safeJson<DoctorProfile>(doctorRes);

        if (cancelled) return;
        setDoctor(doctorProfile);

        // 4. Fetch appointments for THIS doctor only
        const apptRes = await fetch(
          `${APPT_API}/api/v1/appointments?doctorId=${doctorProfile.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        const apptData = await safeJson<Appointment[]>(apptRes);

        if (cancelled) return;
        setAppointments(Array.isArray(apptData) ? apptData : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load appointments.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [tick]);

  // ── PATCH status ────────────────────────────────────────────────────────────

  const updateAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus, notes?: string) => {
      const token = localStorage.getItem("smart_admin_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${APPT_API}/api/v1/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes: notes ?? null }),
      });

      await safeJson<Appointment>(res);

      // Optimistically update local state
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, notes: notes ?? a.notes } : a))
      );
    },
    []
  );

  return { appointments, doctor, loading, error, refetch, updateAppointmentStatus };
}
