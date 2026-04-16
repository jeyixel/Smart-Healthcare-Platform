"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  active: boolean;
  lastVisit: string;
}

export default function PatientsManagementPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock data for initial UI presentation
    setPatients([
      { id: "PX-1021", firstName: "Alice", lastName: "Johnson", email: "alice.j@example.com", status: "Active", active: true, lastVisit: "2026-04-12" },
      { id: "PX-1022", firstName: "Bob", lastName: "Smith", email: "bob.smith@example.com", status: "Inactive", active: false, lastVisit: "2026-03-28" },
      { id: "PX-1023", firstName: "Charlie", lastName: "Davis", email: "charlie.d@example.com", status: "Active", active: true, lastVisit: "2026-04-14" },
    ]);
  }, []);

  const toggleStatus = (id: string) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active, status: !p.active ? "Active" : "Inactive" } : p
    ));
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 font-bold text-slate-600">
            <tr>
              <th className="px-6 py-4">Patient ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Visit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{p.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                    <span className="text-xs text-slate-500">{p.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{p.lastVisit}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleStatus(p.id)}
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
            ))}
          </tbody>
        </table>
        {filteredPatients.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 italic">No patients found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
