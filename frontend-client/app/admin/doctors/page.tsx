"use client";

import { approveDoctor, fetchPendingDoctors } from "@/lib/api";
import { DoctorApprovalItem } from "@/types/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DoctorsManagementPage() {
  const router = useRouter();
  const [pendingDoctors, setPendingDoctors] = useState<DoctorApprovalItem[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingNotice, setPendingNotice] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    if (token) loadPendingDoctors(token);
  }, []);

  const loadPendingDoctors = async (token: string) => {
    setLoadingPending(true);
    setPendingNotice("");
    try {
      const items = await fetchPendingDoctors(token);
      setPendingDoctors(items);
    } catch (error) {
      setPendingNotice(error instanceof Error ? error.message : "Failed to load pending doctors");
    } finally {
      setLoadingPending(false);
    }
  };

  const onApproveDoctor = async (doctorId: number) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    setPendingNotice("");
    try {
      await approveDoctor(token, doctorId);
      setPendingNotice("Doctor approved successfully");
      await loadPendingDoctors(token);
    } catch (error) {
      setPendingNotice(error instanceof Error ? error.message : "Failed to approve doctor");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Health Professionals</h1>
        <p className="text-slate-500">Manage and approve doctor credentials and system access.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Pending Approvals</h2>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {pendingDoctors.length} Requests
          </span>
        </div>

        {loadingPending && <p className="animate-pulse text-sm text-slate-500">Updating registry...</p>}
        {pendingNotice && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-100">
            {pendingNotice}
          </div>
        )}

        {!loadingPending && pendingDoctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <p className="font-medium text-slate-900">All caught up!</p>
            <p className="text-sm text-slate-500">There are no pending doctor registrations at this time.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {doctor.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    {doctor.firstName} {doctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{doctor.email}</p>
                </div>
              </div>
              <button
                onClick={() => void onApproveDoctor(doctor.id)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-indigo-200"
              >
                Approve Access
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder for All Doctors List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Verified Doctors</h2>
        <div className="overflow-hidden rounded-xl border border-slate-100">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 font-bold text-slate-600">
               <tr>
                 <th className="px-6 py-4">Name</th>
                 <th className="px-6 py-4">Specialty</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Join Date</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               <tr className="text-slate-400 italic">
                 <td colSpan={4} className="px-6 py-8 text-center">List view integration pending backend doctor registry sync.</td>
               </tr>
             </tbody>
           </table>
        </div>
      </section>
    </div>
  );
}
