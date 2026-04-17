"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPatientByEmail, fetchPatientPrescriptions } from "@/lib/api";
import { PrescriptionResponse } from "@/types/api";

export interface UsePatientPrescriptionsResult {
  loading: boolean;
  error: string | null;
  prescriptions: PrescriptionResponse[];
  patientName: string;
  refetch: () => Promise<void>;
}

export function usePatientPrescriptions(): UsePatientPrescriptionsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [patientName, setPatientName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("smart_admin_token");
      const role = localStorage.getItem("smart_admin_role");
      const email = localStorage.getItem("smart_admin_email");

      if (!token || role !== "PATIENT" || !email) {
        throw new Error("Patient authentication required");
      }

      const patient = await fetchPatientByEmail(token, email);
      setPatientName(`${patient.firstName} ${patient.lastName}`.trim());

      const list = await fetchPatientPrescriptions(token, patient.id);
      setPrescriptions(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    error,
    prescriptions,
    patientName,
    refetch: load,
  };
}
