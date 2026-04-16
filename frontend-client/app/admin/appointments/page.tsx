"use client";

import { fetchAdminAppointments, updateAppointmentStatus } from "@/lib/api";
import { AdminAppointment } from "@/types/api";
import { useEffect, useState } from "react";

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    try {
      const data = await fetchAdminAppointments(token);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: "SCHEDULED" | "COMPLETED" | "CANCELLED") => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    try {
      await updateAppointmentStatus(token, id, status);
      await loadAppointments();
    } catch (err) {
      alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const virtualCount = appointments.filter(a => a.consultationType === "VIRTUAL").length;
  const virtualRatio = appointments.length > 0 ? Math.round((virtualCount / appointments.length) * 100) : 0;
  const completionRate = appointments.length > 0 ? Math.round((appointments.filter(a => a.status === "COMPLETED").length / appointments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Appointment Ledger</h1>
        <p className="text-slate-500">Global view and scheduling oversight for all micro-clinics.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total System Load</p>
           <h3 className="text-2xl font-black text-slate-900">{appointments.length} Appointments</h3>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Virtual Ratio</p>
           <h3 className="text-2xl font-black text-indigo-600">{virtualRatio}% Remote</h3>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
           <h3 className="text-2xl font-black text-emerald-600">{completionRate}% Compliance</h3>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Live Consultation Registry</h2>
          <button onClick={loadAppointments} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            Refresh Stream 🔄
          </button>
        </div>

        {loading && <div className="py-20 text-center text-slate-400 animate-pulse">Syncing with appointment microservice...</div>}
        {error && <div className="py-20 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Doctor ID</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{apt.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{apt.patientId.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-slate-600">{apt.doctorId.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{apt.appointmentDate}</span>
                      <span className="text-xs text-slate-500">{apt.appointmentTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${apt.consultationType === 'VIRTUAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {apt.consultationType === 'VIRTUAL' ? '🌐 Virtual' : '📍 Physical'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : 
                      apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value as any)}
                    >
                      <option value="SCHEDULED">Re-Schedule</option>
                      <option value="COMPLETED">Mark Complete</option>
                      <option value="CANCELLED">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && appointments.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">
            No appointments found in the system.
          </div>
        )}
      </section>
    </div>
  );
}
