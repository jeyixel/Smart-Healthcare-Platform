"use client";

import { useDoctorContext } from "@/app/context/DoctorContext";

/* ─── Mock data ─────────────────────────────────────────────────── */

const kpiCards = [
  {
    label: "Today's Appointments",
    value: "8",
    delta: "+2 vs yesterday",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "#06b6d4",
    bg: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
    border: "rgba(6,182,212,0.25)",
  },
  {
    label: "Total Patients",
    value: "247",
    delta: "+12 this month",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "#10b981",
    bg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
    border: "rgba(16,185,129,0.25)",
  },
  {
    label: "Prescriptions Written",
    value: "1,083",
    delta: "All time",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "#8b5cf6",
    bg: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.08))",
    border: "rgba(139,92,246,0.25)",
  },
  {
    label: "Patient Rating",
    value: "4.9",
    delta: "Top 5% of doctors",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    color: "#f59e0b",
    bg: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.08))",
    border: "rgba(245,158,11,0.25)",
  },
];

const todayAppointments = [
  { id: "APT-001", name: "Amal Perera",      time: "09:00 AM", type: "Consultation",    status: "COMPLETED",  avatar: "A" },
  { id: "APT-002", name: "Nimal Silva",       time: "10:30 AM", type: "Follow-up",       status: "COMPLETED",  avatar: "N" },
  { id: "APT-003", name: "Sumudu Fernando",   time: "11:00 AM", type: "Check-up",        status: "IN_PROGRESS", avatar: "S" },
  { id: "APT-004", name: "Kasun Rajapaksha",  time: "12:30 PM", type: "Consultation",    status: "SCHEDULED",  avatar: "K" },
  { id: "APT-005", name: "Dilini Bandara",    time: "02:00 PM", type: "Follow-up",       status: "SCHEDULED",  avatar: "D" },
  { id: "APT-006", name: "Ruwan Gunasekara",  time: "03:30 PM", type: "Telemedicine",    status: "SCHEDULED",  avatar: "R" },
  { id: "APT-007", name: "Chamari Wickrama",  time: "04:00 PM", type: "Prescription",    status: "PENDING",    avatar: "C" },
  { id: "APT-008", name: "Pradeep Jayaweera", time: "04:45 PM", type: "Lab Review",      status: "PENDING",    avatar: "P" },
];

const recentPatients = [
  { name: "Amal Perera",     age: 34, condition: "Hypertension",    lastVisit: "Today",       avatar: "A", risk: "medium" },
  { name: "Nimal Silva",     age: 52, condition: "Type 2 Diabetes", lastVisit: "Today",       avatar: "N", risk: "high" },
  { name: "Sumudu Fernando", age: 28, condition: "Asthma",          lastVisit: "In progress", avatar: "S", risk: "low" },
  { name: "Kasun Rajapaksha",age: 41, condition: "Back Pain",       lastVisit: "12 Apr 2026", avatar: "K", risk: "low" },
  { name: "Dilini Bandara",  age: 37, condition: "Migraine",        lastVisit: "10 Apr 2026", avatar: "D", risk: "medium" },
];

const activityFeed = [
  { action: "Prescription written",  patient: "Amal Perera",      time: "09:45 AM", icon: "💊" },
  { action: "Appointment completed", patient: "Nimal Silva",       time: "10:58 AM", icon: "✅" },
  { action: "Lab result reviewed",   patient: "Kasun Rajapaksha",  time: "11:20 AM", icon: "🔬" },
  { action: "Note added",            patient: "Dilini Bandara",    time: "12:05 PM", icon: "📝" },
  { action: "Telemedicine scheduled",patient: "Ruwan Gunasekara",  time: "12:30 PM", icon: "📹" },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED:   { bg: "rgba(16,185,129,0.12)", color: "#059669", label: "Completed" },
  IN_PROGRESS: { bg: "rgba(6,182,212,0.12)",  color: "#0891b2", label: "In Progress" },
  SCHEDULED:   { bg: "rgba(99,102,241,0.12)", color: "#4f46e5", label: "Scheduled" },
  PENDING:     { bg: "rgba(245,158,11,0.12)", color: "#d97706", label: "Pending" },
};

const riskStyle: Record<string, { color: string; label: string }> = {
  high:   { color: "#ef4444", label: "High Risk" },
  medium: { color: "#f59e0b", label: "Moderate" },
  low:    { color: "#10b981", label: "Stable" },
};

/* ─── Sub-components ─────────────────────────────────────────── */

function KpiCard({ card }: { card: typeof kpiCards[0] }) {
  return (
    <div style={{
      background: card.bg,
      border: `1px solid ${card.border}`,
      borderRadius: "16px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${card.color}22`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${card.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: card.color,
          boxShadow: `0 0 16px ${card.color}33`,
        }}>
          {card.icon}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 600, color: card.positive ? "#059669" : "#ef4444",
          background: card.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          padding: "3px 8px", borderRadius: "999px",
        }}>
          {card.delta}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "30px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
          {card.value}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569", fontWeight: 500 }}>
          {card.label}
        </p>
      </div>
    </div>
  );
}

function WeeklyBar({ day, pct, active }: { day: string; pct: number; active?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
      <div style={{
        width: "100%", maxWidth: "28px", height: "80px",
        background: "rgba(226,232,240,0.5)", borderRadius: "6px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct}%`,
          background: active
            ? "linear-gradient(180deg,#06b6d4,#0891b2)"
            : "linear-gradient(180deg,rgba(6,182,212,0.4),rgba(8,145,178,0.2))",
          borderRadius: "6px",
          transition: "height 0.5s ease",
          boxShadow: active ? "0 0 10px rgba(6,182,212,0.4)" : "none",
        }} />
      </div>
      <span style={{ fontSize: "11px", color: active ? "#06b6d4" : "#94a3b8", fontWeight: active ? 700 : 400 }}>{day}</span>
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────── */

export function DoctorDashboardContent() {
  const { session } = useDoctorContext();

  const completed = todayAppointments.filter(a => a.status === "COMPLETED").length;
  const total = todayAppointments.length;
  const progressPct = Math.round((completed / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Welcome Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "28px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.1)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* decorative glow blobs */}
        <div style={{ position: "absolute", top: "-40px", right: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(6,182,212,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", right: "5%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(40px)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <span style={{
            background: "rgba(6,182,212,0.15)", color: "#06b6d4",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
            border: "1px solid rgba(6,182,212,0.25)",
          }}>
            ● Live Session
          </span>
          <h2 style={{ margin: "12px 0 6px", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},{" "}
            <span style={{ color: "#06b6d4" }}>{session?.displayName ?? "Doctor"}</span>
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", maxWidth: "460px", lineHeight: 1.6 }}>
            You have <strong style={{ color: "#06b6d4" }}>{todayAppointments.filter(a => a.status === "SCHEDULED" || a.status === "IN_PROGRESS" || a.status === "PENDING").length} appointments</strong> remaining today and{" "}
            <strong style={{ color: "#10b981" }}>2 pending prescription</strong> reviews.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button style={{
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              border: "none", color: "#fff", padding: "10px 22px",
              borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
              transition: "transform 0.2s",
            }}>
              Start Next Appointment
            </button>
            <button style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0", padding: "10px 20px",
              borderRadius: "10px", fontWeight: 500, fontSize: "13px", cursor: "pointer",
              transition: "background 0.2s",
            }}>
              View Full Schedule
            </button>
          </div>
        </div>

        {/* Progress ring area */}
        <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ textAlign: "center" }}>
            {/* SVG circle progress */}
            <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="8" />
              <circle
                cx="55" cy="55" r="46" fill="none"
                stroke="url(#cyanGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progressPct / 100)}`}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
              <defs>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>{progressPct}%</p>
              <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>Done</p>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
              {completed}/{total} appointments
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {kpiCards.map((c) => <KpiCard key={c.label} card={c} />)}
      </div>

      {/* ── Main Grid: Schedule + Patients + Mini-chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>

        {/* Today's Appointments */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Today&apos;s Appointments</h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <span style={{ background: "rgba(6,182,212,0.1)", color: "#0891b2", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", border: "1px solid rgba(6,182,212,0.2)" }}>
              {total} today
            </span>
          </div>

          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {todayAppointments.map((appt, i) => {
              const st = statusStyle[appt.status];
              return (
                <div key={appt.id} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 22px",
                  borderBottom: i < todayAppointments.length - 1 ? "1px solid #f8fafc" : "none",
                  background: appt.status === "IN_PROGRESS" ? "rgba(6,182,212,0.03)" : "#fff",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = appt.status === "IN_PROGRESS" ? "rgba(6,182,212,0.03)" : "#fff"; }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg,hsl(${i * 45},70%,55%),hsl(${i * 45 + 30},60%,45%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "14px",
                  }}>
                    {appt.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{appt.type}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#334155" }}>{appt.time}</p>
                    <span style={{
                      display: "inline-block", marginTop: "4px",
                      fontSize: "10px", fontWeight: 700,
                      background: st.bg, color: st.color,
                      padding: "2px 8px", borderRadius: "999px",
                    }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: patients + weekly chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Recent Patients */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Recent Patients</h3>
            </div>
            {recentPatients.map((p, i) => {
              const risk = riskStyle[p.risk];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 22px",
                  borderBottom: i < recentPatients.length - 1 ? "1px solid #f8fafc" : "none",
                  cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg,hsl(${i * 60 + 180},60%,55%),hsl(${i * 60 + 210},55%,45%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "13px",
                  }}>
                    {p.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{p.name}</p>
                    <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#64748b" }}>{p.condition} · Age {p.age}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: risk.color, background: `${risk.color}18`, padding: "2px 8px", borderRadius: "999px" }}>
                      {risk.label}
                    </span>
                    <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#94a3b8" }}>{p.lastVisit}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly volume mini-chart */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Weekly Appointments</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>This week vs avg</p>
              </div>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#06b6d4" }}>42</span>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
              {[
                { day: "Mon", pct: 75 },
                { day: "Tue", pct: 55 },
                { day: "Wed", pct: 90 },
                { day: "Thu", pct: 65 },
                { day: "Fri", pct: 100, active: true },
                { day: "Sat", pct: 40 },
                { day: "Sun", pct: 20 },
              ].map((b) => <WeeklyBar key={b.day} {...b} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Quick Actions + Activity Feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>

        {/* Quick Actions */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "New Prescription", icon: "💊", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
              { label: "Start Telemedicine", icon: "📹", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
              { label: "Add Patient Note", icon: "📝", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
              { label: "View Lab Results", icon: "🔬", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
              { label: "Request Consult", icon: "🩺", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
              { label: "Generate Report", icon: "📊", color: "#0284c7", bg: "rgba(2,132,199,0.08)" },
            ].map((a) => (
              <button key={a.label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "12px",
                background: a.bg, border: `1px solid ${a.color}22`,
                cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${a.color}22`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <span style={{ fontSize: "20px" }}>{a.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155", lineHeight: 1.3 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Today&apos;s Activity</h3>
            <button style={{ background: "none", border: "none", color: "#06b6d4", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {activityFeed.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", paddingBottom: i < activityFeed.length - 1 ? "16px" : "0", position: "relative" }}>
                {i < activityFeed.length - 1 && (
                  <div style={{ position: "absolute", left: "17px", top: "34px", bottom: 0, width: "2px", background: "linear-gradient(180deg,#e2e8f0,transparent)" }} />
                )}
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%", background: "#f8fafc",
                  border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0, zIndex: 1,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.action}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{item.patient} · <span style={{ color: "#94a3b8" }}>{item.time}</span></p>
                </div>
              </div>
            ))}
          </div>
          {/* System health strip */}
          <div style={{ marginTop: "20px", padding: "12px 16px", background: "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(5,150,105,0.03))", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#065f46" }}>All Systems Operational</span>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Last sync: just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
