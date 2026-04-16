"use client";

import { useEffect, useState } from "react";
import { fetchPaymentAnalysis } from "@/lib/api";
import { PaymentAnalysis, DailyRevenue } from "@/types/api";

export default function AnalyticsPage() {
  const [analysis, setAnalysis] = useState<PaymentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        const data = await fetchPaymentAnalysis(token);
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment analysis");
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Analytics</h1>
        <p className="text-slate-500">Deep dive into platform usage, revenue trends, and operational metrics.</p>
      </header>

      {/* Payment Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">LKR {analysis?.totalRevenue.toLocaleString()}</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Transactions</p>
          <h3 className="text-2xl font-black text-slate-900">{analysis?.totalTransactions}</h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
          <h3 className="text-2xl font-black text-indigo-600">{analysis?.successRate.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends Chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 font-display">Revenue Trend (Daily)</h2>
            <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full bg-slate-50 rounded-xl flex items-end justify-between px-8 py-4 border border-dashed border-slate-200 gap-2">
            {analysis?.trends.length ? (
              analysis.trends.slice(-7).map((day, i) => {
                const maxRevenue = Math.max(...analysis.trends.map(t => day.revenue), 100);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex flex-col items-center">
                       <div 
                         className="w-full max-w-[24px] bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600 peer" 
                         style={{ height: `${Math.max(height, 5)}%` }}
                       ></div>
                       {/* Tooltip */}
                       <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-10">
                         LKR {day.revenue.toLocaleString()}
                       </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 rotate-45 mt-2">{day.date.substring(5)}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center text-slate-400 font-medium italic">
                No revenue data for the selected period
              </div>
            )}
          </div>
        </section>

        {/* Status Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">Transaction Status</h2>
          <div className="space-y-4">
            {analysis && Object.entries(analysis.statusBreakdown).map(([status, count]) => {
              const percentage = (count / analysis.totalTransactions) * 100;
              const colorClass = status === 'SUCCESS' ? 'bg-emerald-500' : status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500';
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{status}</span>
                    <span>{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {!analysis || Object.keys(analysis.statusBreakdown).length === 0 && (
              <p className="text-center text-slate-400 italic py-8">No transaction data available</p>
            )}
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">System Utilization Summary</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Peak Hour</p>
                 <p className="text-lg font-black text-slate-900">10:00 AM</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Patient Session</p>
                 <p className="text-lg font-black text-slate-900">12.5 min</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily New Users</p>
                 <p className="text-lg font-black text-slate-900">42</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Uptime</p>
                 <p className="text-lg font-black text-emerald-600">99.98%</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

