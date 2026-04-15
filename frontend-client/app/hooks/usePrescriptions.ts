import { useState, useCallback, useEffect } from "react";
import { useDoctorContext } from "../context/DoctorContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_BASE ?? "http://localhost:8082";
const PRESCRIPTION_API = process.env.NEXT_PUBLIC_PRESCRIPTION_API_BASE ?? "http://localhost:8088";

// ─── JWT userId extractor ─────────────────────────────────────────────────────
// The admin JwtService stores userId as a Number (Long) claim: extraClaims.put("userId", user.getId())
// JSON serialises this as a plain integer, e.g. {"userId": 42, "role": "DOCTOR", "sub": "..."}

function decodeUserId(token: string): number | null {
  try {
    // Standard base64url → base64 conversion then parse
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded: Record<string, unknown> = JSON.parse(atob(padded));

    // Claim name is "userId" (confirmed in service-admin JwtService.java)
    const raw = decoded["userId"];
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") return parseInt(raw, 10);
    return null;
  } catch {
    return null;
  }
}

export type PrescriptionStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  clinicalNotes: string;
  status: PrescriptionStatus;
  followUpRequired: boolean;
  followUpDate: string | null;
  digitalSignature?: string;
  issuedAt: string | null;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export function usePrescriptions() {
  const { session } = useDoctorContext();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorPrescriptions = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Decode userId from JWT
      const userId = decodeUserId(session.token);
      if (!userId) throw new Error("Could not extract user ID from token.");

      // 2. Fetch doctor profile by userId
      const docRes = await fetch(`${DOCTOR_API}/api/v1/doctors/user/${userId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      });
      if (!docRes.ok) throw new Error("Failed to fetch doctor");
      const docData = await docRes.json();

      // 3. Fetch prescriptions for THIS doctor only
      const res = await fetch(`${PRESCRIPTION_API}/api/v1/prescriptions/doctor/${docData.id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      const data = await res.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Could not load prescriptions");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const createPrescription = useCallback(
    async (payload: any) => {
      if (!session?.token) throw new Error("No token");
      const res = await fetch(`${PRESCRIPTION_API}/api/v1/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create prescription");
      }
      const newPrx = await res.json();
      setPrescriptions((prev) => [newPrx, ...prev]);
      return newPrx;
    },
    [session]
  );

  const updatePrescriptionStatus = useCallback(
    async (id: string, status: PrescriptionStatus) => {
      if (!session?.token) throw new Error("No token");
      const res = await fetch(`${PRESCRIPTION_API}/api/v1/prescriptions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update status");
      }
      const updated = await res.json();
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      return updated;
    },
    [session]
  );

  const updatePrescription = useCallback(
    async (id: string, payload: any) => {
      if (!session?.token) throw new Error("No token");
      const res = await fetch(`${PRESCRIPTION_API}/api/v1/prescriptions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update prescription");
      }
      const updated = await res.json();
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      return updated;
    },
    [session]
  );

  const deletePrescription = useCallback(
    async (id: string) => {
      if (!session?.token) throw new Error("No token");
      const res = await fetch(`${PRESCRIPTION_API}/api/v1/prescriptions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete prescription");
      }
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    },
    [session]
  );

  return {
    prescriptions,
    loading,
    error,
    fetchDoctorPrescriptions,
    createPrescription,
    updatePrescriptionStatus,
    updatePrescription,
    deletePrescription,
  };
}
