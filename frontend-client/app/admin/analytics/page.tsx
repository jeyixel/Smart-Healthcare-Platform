"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Analytics</h1>
        <p className="text-slate-500">Deep dive into platform usage, health trends, and operational metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">User Growth (Last 30 Days)</h2>
           <div className="h-64 w-full bg-slate-50 rounded-xl flex items-end justify-between px-8 py-4 border border-dashed border-slate-200">
              {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-8 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600" style={{ height: `${h}%` }}></div>
              ))}
           </div>
           <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 px-2 tracking-widest uppercase">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
           </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">Consultation Distribution</h2>
           <div className="flex items-center justify-center h-64">
              <div className="relative h-48 w-48 rounded-full border-[16px] border-indigo-600 flex items-center justify-center">
                 <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">72%</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Virtual</p>
                 </div>
                 {/* Decorative slices */}
                 <div className="absolute inset-0 rounded-full border-[16px] border-slate-100 border-t-transparent border-r-transparent rotate-45"></div>
              </div>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                 <span className="h-3 w-3 rounded-full bg-indigo-600"></span>
                 <span className="text-xs font-bold text-slate-600">Telemedicine</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="h-3 w-3 rounded-full bg-slate-200"></span>
                 <span className="text-xs font-bold text-slate-600">In-Person</span>
              </div>
           </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">Regional Service Heatmap</h2>
           <div className="h-80 w-full bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <p className="text-indigo-400 font-mono text-sm opacity-50">GIS_VISUALIZATION_LAYER_PENDING</p>
              {/* Decorative nodes */}
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="absolute h-2 w-2 rounded-full bg-indigo-500 animate-ping" style={{ 
                  top: `${Math.random() * 80 + 10}%`, 
                  left: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.5}s`
                }}></div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
