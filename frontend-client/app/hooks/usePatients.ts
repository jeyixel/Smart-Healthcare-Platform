"use client";

import { useState, useEffect, useCallback } from "react";
import { Patient } from "@/types/api";

// ─── Constants ────────────────────────────────────────────────────────────────

// API Gateway - Routes all requests through a single endpoint (port 8080)
// The gateway automatically routes /api/v1/patients/** to Patient Service (8081)
const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

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

export function usePatients(patientIds: string[]) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("smart_admin_token");
      if (!token) throw new Error("No authentication token found.");

      // Fetch patients in parallel
      const promises = ids.map(id =>
        fetch(`${API_GATEWAY}/api/v1/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => safeJson<Patient>(res))
      );

      const patientData = await Promise.all(promises);
      setPatients(patientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(patientIds);
  }, [patientIds, fetchPatients]);

  return { patients, loading, error, refetch: () => fetchPatients(patientIds) };
}