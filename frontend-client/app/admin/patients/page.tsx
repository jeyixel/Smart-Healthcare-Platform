"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchPatients, updatePatientStatus } from "@/lib/api";
import { Patient } from "@/types/api";

export default function PatientsManagementPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        router.push("/login?role=ADMIN");
        return;
      }

      const data = await fetchPatients(token);
      setPatients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("smart_admin_token");
      const user = localStorage.getItem("smart_admin_user");
      const adminData = user ? JSON.parse(user) : null;
      const adminEmail = adminData?.email || "system-admin";

      if (!token) return;

      const nextStatus = !currentStatus;
      await updatePatientStatus(token, id, nextStatus, adminEmail);

      // Optimistic update
      setPatients(prev => prev.map(p => 
        p.id === id ? { ...p, active: nextStatus } : p
      ));
    } catch (err: any) {
      alert("Error updating patient status: " + err.message);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "No history";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Patient Registry</h1>
        <p className="text-slate-500">Monitor and manage patient access and health records.</p>
      </header>

      {/* Search and Filters */}
      <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, ID, or email..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Filters</button>
        <button className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">+ Register New</button>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={loadPatients} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Modified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-slate-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{p.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                        <span className="text-xs text-slate-500">{p.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(p.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(p.id, p.active)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${p.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        >
                          {p.active ? "Deactivate" : "Activate"}
                        </button>
                        <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                          View EHR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredPatients.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 italic">No patients found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
