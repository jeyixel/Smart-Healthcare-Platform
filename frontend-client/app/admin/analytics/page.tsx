"use client";

import { useEffect, useState } from "react";
import { fetchPaymentAnalysis } from "@/lib/api";
import { PaymentAnalysis, DailyRevenue } from "@/types/api";

/* === Sub-components === */

function MetricCard({ label, value, delta, icon, color }: { label: string; value: string | number; delta: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8f0fe",
      borderRadius: "16px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      transition: "transform 0.2s",
      position: "relative",
      overflow: "hidden"
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 700, color: "#06b6d4",
          background: "rgba(6,182,212,0.1)",
          padding: "3px 10px", borderRadius: "999px",
        }}>
          {delta}
        </span>
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{value}</h3>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analysis, setAnalysis] = useState<PaymentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const token = localStorage.getItem("smart_admin_token");
        if (!token) return;
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#06b6d4", borderRadius: "50%" }}></div>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Aggregating telemetry...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* === KPI Row === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <MetricCard 
          label="Total Revenue" 
          value={`LKR ${analysis?.totalRevenue.toLocaleString()}`} 
          delta="+12% vs last month"
          color="#06b6d4"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          label="Transaction Yield" 
          value={analysis?.totalTransactions || 0} 
          delta="Nominal"
          color="#10b981"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <MetricCard 
          label="Success Rate" 
          value={`${analysis?.successRate.toFixed(1)}%`} 
          delta="High Priority"
          color="#8b5cf6"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px" }}>
        
        {/* Revenue Trends (Doctor Style Chart) */}
        <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Fiscal Trajectory</h2>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Daily revenue performance (LKR)</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#06b6d4", background: "rgba(6,182,212,0.1)", padding: "4px 10px", borderRadius: "8px", textTransform: "uppercase" }}>7-Day Span</span>
            </div>
          </div>
          
          <div style={{ height: "240px", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 12px", gap: "12px", borderBottom: "1px solid #f1f5f9" }}>
            {analysis?.trends.slice(-7).map((day, i) => {
              const maxRevenue = Math.max(...analysis.trends.map(t => t.revenue), 100);
              const height = (day.revenue / maxRevenue) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "36px", height: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ 
                      width: "100%", height: `${Math.max(height, 8)}%`, 
                      background: i === 6 ? "linear-gradient(180deg, #06b6d4, #0891b2)" : "linear-gradient(180deg, rgba(6,182,212,0.4), rgba(8,145,178,0.2))",
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: i === 6 ? "0 4px 12px rgba(6,182,212,0.3)" : "none"
                    }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: i === 6 ? "#06b6d4" : "#94a3b8", textTransform: "uppercase", paddingBottom: "12px" }}>
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Transmission Integrity (Doctor Style Status) */}
        <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", padding: "28px" }}>
          <h2 style={{ margin: "0 0 24px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Transmission Integrity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {analysis && Object.entries(analysis.statusBreakdown).map(([status, count]) => {
              const percentage = (count / analysis.totalTransactions) * 100;
              const color = status === 'SUCCESS' ? '#10b981' : status === 'FAILED' ? '#ef4444' : '#f59e0b';
              return (
                <div key={status} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{status}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{percentage.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: "8px", width: "100%", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: color, borderRadius: "4px", transition: "width 1s ease-out" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Global Performance Hub */}
        <section style={{ gridColumn: "1 / -1", background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", padding: "28px" }}>
          <h2 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>System Performance Benchmarks</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { label: "Peak Activity", value: "10:00 AM", sub: "Regional Load Spike" },
              { label: "Avg Engagement", value: "12.5 min", sub: "User Session Depth" },
              { label: "Growth Index", value: "+42", sub: "Daily New Uplinks" },
              { label: "System Latency", value: "99.98%", sub: "Service Uptime", highlight: true },
            ].map((bench) => (
              <div key={bench.label} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #f1f5f9", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{bench.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 900, color: bench.highlight ? "#06b6d4" : "#0f172a" }}>{bench.value}</p>
                <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#64748b", fontWeight: 500 }}>{bench.sub}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
