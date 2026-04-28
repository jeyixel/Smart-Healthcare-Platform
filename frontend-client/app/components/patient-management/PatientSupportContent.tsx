"use client";

import { usePatientContext } from "@/app/context/PatientContext";
import SupportChat from "../common/SupportChat";

export function PatientSupportContent() {
  const { session } = usePatientContext();

  if (!session) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Support Hub</h1>
        <p className="text-slate-500 font-medium">Chat with our administration team for help with your account or appointments.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Help Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 shadow-sm shadow-indigo-50">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">How it works</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
              Our support chat is asynchronous. You can send a message now and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px]">1</span>
                Type your inquiry below
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px]">2</span>
                Get notified when we reply
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-200">
             <h4 className="text-lg font-bold mb-2">Emergency?</h4>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">If you are experiencing a medical emergency, please call your local emergency services immediately.</p>
             <button className="w-full rounded-2xl bg-white/10 py-3 text-sm font-bold hover:bg-white/20 transition-all border border-white/10">Find Nearest Hospital</button>
          </div>
        </div>

        {/* Chat Component */}
        <div className="lg:col-span-2 h-[600px]">
           <SupportChat 
             currentUserEmail={session.email} 
             withEmail="heshan.int@gmail.com" 
             title="SmartHealth Support Team"
           />
        </div>
      </div>
    </div>
  );
}
