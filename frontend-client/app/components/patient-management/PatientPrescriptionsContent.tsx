"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePatientPrescriptions } from "@/app/hooks/usePatientPrescriptions";

function formatDate(date: string | null): string {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function PatientPrescriptionsContent() {
  const { loading, error, prescriptions, patientName } = usePatientPrescriptions();

  const orderedPrescriptions = useMemo(
    () => [...prescriptions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [prescriptions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-200 selection:bg-[#06b6d4]/30">
      {error && (
        <div className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-400 backdrop-blur-md flex items-center gap-3">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <p><span className="font-bold underline">Connection Error:</span> {error}</p>
        </div>
      )}

      {/* Prescription List */}
      {orderedPrescriptions.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white backdrop-blur-xl p-20 text-center flex flex-col items-center">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
             <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h3 className="text-2xl font-bold text-slate-900 mb-2">No Prescriptions Issued</h3>
           <p className="text-slate-500 max-w-sm">Your medical records will appear here as soon as they are finalized by your doctor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {orderedPrescriptions.map((rx) => (
            <article key={rx.id} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#06b6d4]/5 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative flex flex-col lg:flex-row justify-between gap-8 mb-8 border-b border-slate-100 pb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#06b6d4] rounded-xl p-3 shadow-lg shadow-[#06b6d4]/20">
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">Record Identifier</p>
                      <h2 className="text-xl font-mono font-bold text-slate-900 tracking-tighter">RX-{rx.id.toString().slice(0, 8).toUpperCase()}</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:flex items-center gap-x-8 gap-y-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Issue Date</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(rx.createdAt)}</p>
                     </div>
                     <div className="sm:border-l sm:border-slate-100 sm:pl-8">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Follow-up</p>
                        <p className={`text-sm font-bold ${rx.followUpRequired ? 'text-[#06b6d4]' : 'text-slate-400'}`}>
                          {rx.followUpRequired ? formatDate(rx.followUpDate) : "Not Required"}
                        </p>
                     </div>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-3">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                    rx.status === "ISSUED" ? "bg-emerald-50 text-white border-emerald-200" :
                    rx.status === "DRAFT" ? "bg-amber-500 text-white border-amber-200" :
                    "bg-rose-500 text-white border-rose-200"
                  }`}>
                    {rx.status}
                  </span>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#06b6d4] transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Report Copy (PDF)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                  <p className="text-[10px] uppercase font-bold text-[#06b6d4] tracking-widest mb-3 flex items-center gap-2">
                     <span className="w-1 h-1 bg-[#06b6d4] rounded-full"></span>
                     Diagnosis
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                    {rx.diagnosis || "No formal diagnosis captured for this record."}
                  </p>
                </div>
                
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                  <p className="text-[10px] uppercase font-bold text-[#06b6d4] tracking-widest mb-3 flex items-center gap-2">
                     <span className="w-1 h-1 bg-[#06b6d4] rounded-full"></span>
                     Clinical Directives
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rx.clinicalNotes || "No specific therapeutic instructions provided."}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Therapeutic Items</p>
                   <span className="text-[10px] font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded-full">{rx.items.length} Medications</span>
                </div>
                
                {rx.items.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 italic text-sm">
                    No pharmacological items listed in this prescription.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500">Medicine Name</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500">Dosage</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500">Frequency</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500 text-right">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-900 font-bold">{item.medicineName}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{item.dosage}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{item.frequency}</td>
                            <td className="px-6 py-4 text-[#06b6d4] font-black text-right uppercase text-[10px] tracking-widest">
                              {item.duration} <span className="text-slate-400 font-bold ml-1">({item.quantity} units)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
