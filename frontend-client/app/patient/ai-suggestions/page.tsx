"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
import { fetchPatientByEmail, fetchPatientMedicalHistory } from "@/lib/api";
import type { MedicalHistory } from "@/types/api";

export default function PatientAISuggestionsPage() {
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [patientId, setPatientId] = useState<string | null>(null);
  const router = useRouter();

  const STORAGE_KEY = (id: string) => `ai_history_${id}`;

  // Load patient id and medical history on mount (but DO NOT call AI automatically)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const token = localStorage.getItem("smart_admin_token");
        const email = localStorage.getItem("smart_admin_email");
        if (!token || !email) {
          setHistoryError("You must be logged in to view medical history.");
          setHistory([]);
          setHistoryLoading(false);
          return;
        }

        // Resolve patientId
        const patient = await fetchPatientByEmail(token, email);
        if (!patient || !patient.id) {
          setHistoryError("Unable to resolve patient identity.");
          setHistoryLoading(false);
          return;
        }

        if (!mounted) return;
        setPatientId(patient.id);

        // Try sessionStorage cache first
        try {
          const cached = sessionStorage.getItem(STORAGE_KEY(patient.id));
          if (cached) {
            const parsed = JSON.parse(cached) as MedicalHistory[];
            setHistory(parsed);
            setHistoryLoading(false);
            return;
          }
        } catch {
          // ignore parse errors and continue to fetch
        }

        // Fetch from API
        const list = await fetchPatientMedicalHistory(token, patient.id);
        if (!mounted) return;
        setHistory(list || []);

        // Cache in sessionStorage (cleared on unmount)
        try {
          sessionStorage.setItem(STORAGE_KEY(patient.id), JSON.stringify(list || []));
        } catch {
          // ignore storage errors
        }

      } catch (err: any) {
        setHistoryError(err?.message || "Failed to load medical history.");
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      // Clear cached history for this session to honour user's request
      try {
        const token = localStorage.getItem("smart_admin_token");
        const email = localStorage.getItem("smart_admin_email");
        if (token && email) {
          fetchPatientByEmail(token, email).then((p) => {
            if (p && p.id) sessionStorage.removeItem(STORAGE_KEY(p.id));
          }).catch(() => {});
        }
      } catch {}
    };
  }, []);

  const handleGetAISuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    setSuggestions(null);

    try {
      const token = localStorage.getItem("smart_admin_token");
      if (!token || !patientId) {
        setAiError("You must be logged in to request suggestions.");
        setAiLoading(false);
        return;
      }

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || "Failed to generate suggestions.");
      } else {
        setSuggestions(data.suggestions || null);
      }
    } catch (err: any) {
      setAiError(err?.message || "Unexpected error while fetching suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearSuggestions = () => {
    setSuggestions(null);
    setAiError(null);
  };

  return (
    <>
      <PatientNavbar />
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Health Suggestions</h1>
            <p className="text-sm text-slate-600 mt-1">Personalized preliminary tips generated from your recent medical history.</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Medical History */}
              <section className="lg:w-1/2 p-4 border rounded-md bg-gray-50">
                <h2 className="text-lg font-semibold mb-3">Recent Medical History</h2>
                {historyLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading medical history…</div>
                ) : historyError ? (
                  <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">{historyError}</div>
                ) : history.length === 0 ? (
                  <div className="text-slate-600">No recent medical history found. When your doctor updates records, they'll appear here.</div>
                ) : (
                  <ul className="space-y-3 max-h-[480px] overflow-auto pr-2">
                    {history.map((item) => (
                      <li key={item.id} className="rounded-md bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-slate-900">{item.diagnosis || item.symptoms || "Medical Entry"}</h3>
                            <p className="text-xs text-slate-500">{item.date ? new Date(item.date).toLocaleDateString() : "Unknown date"}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                          {item.notes || item.treatment || item.symptoms || "—"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Right: AI Controls & Output */}
              <section className="lg:w-1/2 p-4">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Generate Suggestions</h2>
                    <p className="text-sm text-slate-500">Click the button below to generate AI suggestions based on the medical history shown.</p>
                  </div>

                  <div className="mb-4">
                    <button
                      className={`rounded-lg px-5 py-2 font-semibold text-white ${aiLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={handleGetAISuggestions}
                      disabled={aiLoading || historyLoading || !patientId}
                    >
                      {aiLoading ? 'Generating…' : 'Get AI suggestions'}
                    </button>
                    <button
                      className="ml-3 rounded bg-slate-100 px-4 py-2"
                      onClick={handleClearSuggestions}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex-1 rounded border border-slate-100 bg-white p-4 overflow-auto">
                    {aiLoading ? (
                      <div className="text-center py-8 text-slate-500">Generating suggestions…</div>
                    ) : aiError ? (
                      <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">{aiError}</div>
                    ) : suggestions ? (
                      <div className="prose max-w-none whitespace-pre-wrap text-slate-800">{suggestions}</div>
                    ) : (
                      <div className="text-slate-500">No suggestions yet. Click &ldquo;Get AI suggestions&rdquo; to start.</div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="rounded bg-slate-200 px-4 py-2" onClick={() => router.back()}>Back</button>
                    {suggestions && (
                      <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={handleGetAISuggestions} disabled={aiLoading}>Regenerate</button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

