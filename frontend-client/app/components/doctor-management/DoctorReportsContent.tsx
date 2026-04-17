"use client";

import { useState, useEffect, useMemo } from "react";
import { useDoctorContext } from "@/app/context/DoctorContext";
import { useAppointments, Appointment } from "@/app/hooks/useAppointments";
import { usePrescriptions } from "@/app/hooks/usePrescriptions";
import { usePatients } from "@/app/hooks/usePatients";

// Types
interface TimeRange {
  label: string;
  value: string;
  days: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

interface TopPatient {
  id: string;
  name: string;
  visits: number;
  lastVisit: string;
  condition: string;
  avatar: string;
  trend: "up" | "down" | "stable";
}

interface RevenueData {
  month: string;
  revenue: number;
  appointments: number;
}

// Time ranges for filtering
const timeRanges: TimeRange[] = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 3 Months", value: "3m", days: 90 },
  { label: "Last 6 Months", value: "6m", days: 180 },
  { label: "Last Year", value: "1y", days: 365 },
];

// Chart colors
const chartColors = {
  primary: "#06b6d4",
  secondary: "#10b981", 
  tertiary: "#8b5cf6",
  quaternary: "#f59e0b",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
};

// Gradient definitions
const gradients = {
  primary: "linear-gradient(135deg, #06b6d4, #0891b2)",
  secondary: "linear-gradient(135deg, #10b981, #059669)",
  tertiary: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  quaternary: "linear-gradient(135deg, #f59e0b, #d97706)",
  success: "linear-gradient(135deg, #22c55e, #16a34a)",
  danger: "linear-gradient(135deg, #ef4444, #dc2626)",
};

// Sub-components
function MetricCard({ card }: { card: MetricCard }) {
  return (
    <div
      style={{
        background: card.bgColor,
        border: `1px solid ${card.borderColor}`,
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px ${card.color}25`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Decorative gradient orb */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: `${card.color}15`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `${card.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: card.color,
            boxShadow: `0 0 20px ${card.color}30`,
          }}
        >
          {card.icon}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "999px",
            background: card.trend === "up" ? "rgba(16,185,129,0.1)" : 
                      card.trend === "down" ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.1)",
            border: `1px solid ${
              card.trend === "up" ? "rgba(16,185,129,0.2)" : 
              card.trend === "down" ? "rgba(239,68,68,0.2)" : "rgba(107,114,128,0.2)"
            }`,
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            stroke={
              card.trend === "up" ? "#10b981" : 
              card.trend === "down" ? "#ef4444" : "#6b7280"
            }
            strokeWidth={2}
            viewBox="0 0 24 24"
            style={{
              transform: card.trend === "down" ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l5-5 5 5" />
          </svg>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: card.trend === "up" ? "#10b981" : 
                    card.trend === "down" ? "#ef4444" : "#6b7280",
            }}
          >
            {card.change}
          </span>
        </div>
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {card.value}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "14px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          {card.title}
        </p>
      </div>
    </div>
  );
}

function MiniChart({ data, color }: { data: ChartData[]; color: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 80 - (d.value / maxValue) * 70; // Adjusted for more space
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ width: "100%", height: "80px", position: "relative" }}>
      <svg width="100%" height="60" viewBox="0 0 100 60" style={{ overflow: "hidden" }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,60 L ${points} L 100,60 Z`}
          fill={`url(#gradient-${color})`}
        />
        <path
          d={`M ${points}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 100}
            cy={80 - (d.value / maxValue) * 70}
            r="3"
            fill={color}
          />
        ))}
      </svg>
      {/* X-axis labels */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "10px",
        color: "#64748b",
        padding: "0 4px",
      }}>
        {data.map((d, i) => (
          <span key={i} style={{
            textAlign: "center",
            flex: 1,
            fontSize: "9px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function PatientRow({ patient, index }: { patient: TopPatient; index: number }) {
  const trendColors = {
    up: "#10b981",
    down: "#ef4444",
    stable: "#6b7280",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fff";
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, hsl(${index * 30}, 70%, 60%), hsl(${index * 30 + 20}, 65%, 50%))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {patient.avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {patient.name}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 6px",
              borderRadius: "999px",
              background: `${trendColors[patient.trend]}15`,
              border: `1px solid ${trendColors[patient.trend]}30`,
            }}
          >
            <svg
              width="10"
              height="10"
              fill="none"
              stroke={trendColors[patient.trend]}
              strokeWidth={2}
              viewBox="0 0 24 24"
              style={{
                transform: patient.trend === "down" ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l5-5 5 5" />
            </svg>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: trendColors[patient.trend],
              }}
            >
              {patient.trend === "stable" ? "Stable" : patient.trend === "up" ? "Improving" : "Declining"}
            </span>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {patient.condition} · Last visit: {patient.lastVisit}
        </p>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {patient.visits}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#64748b",
          }}
        >
          visits
        </p>
      </div>
    </div>
  );
}

// Main Component
export function DoctorReportsContent() {
  const { setActiveSection } = useDoctorContext();
  const { appointments, doctor, loading: aptLoading } = useAppointments();
  const { prescriptions, loading: prescLoading } = usePrescriptions();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[1]); // 30 days
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "patients" | "appointments">("revenue");

  // Calculate metrics based on selected time range using real appointment data
  const calculateMetrics = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() - selectedTimeRange.days * 24 * 60 * 60 * 1000);
    
    const filteredAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate + 'T12:00:00') >= startDate && new Date(apt.appointmentDate + 'T12:00:00') <= now
    );
    
    const filteredPrescriptions = prescriptions.filter(presc => 
      new Date(presc.createdAt) >= startDate && new Date(presc.createdAt) <= now
    );

    const completedAppointments = filteredAppointments.filter(apt => apt.status === "COMPLETED");
    
    // Get consultation fee from doctor profile (real data)
    const consultationFee = doctor?.consultationFee || 150; // Fallback to 150 if not available
    const totalRevenue = completedAppointments.length * consultationFee;
    
    // Calculate previous period for growth comparison
    const previousStartDate = new Date(startDate.getTime() - selectedTimeRange.days * 24 * 60 * 60 * 1000);
    const previousPeriodAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate) >= previousStartDate && new Date(apt.appointmentDate) < startDate
    );
    const previousCompletedAppointments = previousPeriodAppointments.filter(apt => apt.status === "COMPLETED");
    const previousPeriodRevenue = previousCompletedAppointments.length * consultationFee;
    
    // Calculate revenue growth
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
      : "0.0";

    // Get unique patients (count each patient only once)
    const uniquePatients = [...new Set(filteredAppointments.map(apt => apt.patientId))].length;
    const previousUniquePatients = [...new Set(previousPeriodAppointments.map(apt => apt.patientId))].length;
    
    // Calculate patient growth
    const patientGrowth = previousUniquePatients > 0
      ? ((uniquePatients - previousUniquePatients) / previousUniquePatients * 100).toFixed(1)
      : "0.0";

    // Calculate appointment growth
    const appointmentGrowth = previousCompletedAppointments.length > 0
      ? ((completedAppointments.length - previousCompletedAppointments.length) / previousCompletedAppointments.length * 100).toFixed(1)
      : "0.0";

    // Mock data for consultation time and satisfaction (keeping these as they're not in appointment data)
    const avgConsultationTime = 25;
    const previousAvgTime = 28;
    const timeImprovement = ((previousAvgTime - avgConsultationTime) / previousAvgTime * 100).toFixed(1);

    const patientSatisfaction = 4.8;
    const previousSatisfaction = 4.6;
    const satisfactionImprovement = ((patientSatisfaction - previousSatisfaction) / previousSatisfaction * 100).toFixed(1);

    return {
      totalRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      uniquePatients,
      patientGrowth: parseFloat(patientGrowth),
      completedAppointments: completedAppointments.length,
      appointmentGrowth: parseFloat(appointmentGrowth),
      avgConsultationTime,
      timeImprovement: parseFloat(timeImprovement),
      patientSatisfaction,
      satisfactionImprovement: parseFloat(satisfactionImprovement),
    };
  }, [appointments, prescriptions, selectedTimeRange, doctor]);

  // Metric cards data
  const metricCards: MetricCard[] = [
    {
      title: "Total Revenue",
      value: `Rs ${(calculateMetrics.totalRevenue / 1000).toFixed(1)}k`,
      change: `${calculateMetrics.revenueGrowth > 0 ? "+" : ""}${calculateMetrics.revenueGrowth}%`,
      trend: calculateMetrics.revenueGrowth > 0 ? "up" : "down",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: chartColors.primary,
      bgColor: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(8,145,178,0.04))",
      borderColor: "rgba(6,182,212,0.2)",
    },
    {
      title: "Total Patients",
      value: calculateMetrics.uniquePatients,
      change: `${calculateMetrics.patientGrowth > 0 ? "+" : ""}${calculateMetrics.patientGrowth}%`,
      trend: calculateMetrics.patientGrowth > 0 ? "up" : "down",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: chartColors.secondary,
      bgColor: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))",
      borderColor: "rgba(16,185,129,0.2)",
    },
    {
      title: "Completed Appointments",
      value: calculateMetrics.completedAppointments,
      change: `+${calculateMetrics.appointmentGrowth}%`,
      trend: "up",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: chartColors.tertiary,
      bgColor: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(124,58,237,0.04))",
      borderColor: "rgba(139,92,246,0.2)",
    },
    {
      title: "Avg. Consultation Time",
      value: `${calculateMetrics.avgConsultationTime}m`,
      change: `-${calculateMetrics.timeImprovement}%`,
      trend: calculateMetrics.timeImprovement > 0 ? "up" : "down",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: chartColors.quaternary,
      bgColor: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04))",
      borderColor: "rgba(245,158,11,0.2)",
    },
  ];

  // Real chart data based on selected metric
  const chartData: ChartData[] = useMemo(() => {
    const data: ChartData[] = [];
    const now = new Date();
    const consultationFee = doctor?.consultationFee || 150;
    
    // Generate data points based on selected time range
    const dataPoints = Math.min(7, Math.max(4, Math.floor(selectedTimeRange.days / 7)));
    const dayInterval = Math.ceil(selectedTimeRange.days / dataPoints);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * dayInterval * 24 * 60 * 60 * 1000);
      const endDate = new Date(date.getTime() + dayInterval * 24 * 60 * 60 * 1000);
      
      let value = 0;
      
      if (selectedMetric === "revenue") {
        // Count completed appointments in this period and calculate revenue
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          // Parse appointment date and normalize to local timezone (add 12 hours to avoid UTC issues)
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate && apt.status === "COMPLETED";
        });
        value = appointmentsInPeriod.length * consultationFee;
      } else if (selectedMetric === "appointments") {
        // Count all appointments in this period
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate;
        });
        value = appointmentsInPeriod.length;
      } else if (selectedMetric === "patients") {
        // Count unique patients in this period
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate;
        });
        const uniquePatients = [...new Set(appointmentsInPeriod.map(apt => apt.patientId))].length;
        value = uniquePatients;
      }
      
      data.push({
        name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value,
      });
    }
    
    return data;
  }, [appointments, selectedTimeRange, doctor, selectedMetric]);

  // Real top patients data based on appointments
  const topPatients: TopPatient[] = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() - selectedTimeRange.days * 24 * 60 * 60 * 1000);
    
    // Filter appointments within selected time range
    const filteredAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate + 'T12:00:00') >= startDate && new Date(apt.appointmentDate + 'T12:00:00') <= now
    );
    
    // Count visits per patient
    const patientVisitCount = new Map<string, number>();
    const patientLastVisit = new Map<string, Date>();
    const patientIds = new Set<string>();
    
    filteredAppointments.forEach(apt => {
      const patientId = apt.patientId;
      patientIds.add(patientId);
      patientVisitCount.set(patientId, (patientVisitCount.get(patientId) || 0) + 1);
      
      const aptDate = new Date(apt.appointmentDate);
      const currentLastVisit = patientLastVisit.get(patientId);
      if (!currentLastVisit || aptDate > currentLastVisit) {
        patientLastVisit.set(patientId, aptDate);
      }
    });
    
    // Convert to array and sort by visit count
    const patients: TopPatient[] = Array.from(patientVisitCount.entries())
      .map(([patientId, visits]) => {
        const lastVisit = patientLastVisit.get(patientId);
        const daysAgo = lastVisit 
          ? Math.floor((now.getTime() - lastVisit.getTime()) / (24 * 60 * 60 * 1000))
          : 0;
        
        return {
          id: patientId,
          name: `Patient ${patientId.slice(-4)}`, // Show last 4 chars of patient ID
          visits,
          lastVisit: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
          condition: "Patient", // Default since we don't have condition data
          avatar: patientId.slice(-1).toUpperCase(), // Last character as avatar
          trend: "stable" as const, // Default trend
        };
      })
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5); // Top 5 patients
    
    return patients;
  }, [appointments, selectedTimeRange]);

  // Dynamic data based on selected metric and time range
  const displayData: RevenueData[] = useMemo(() => {
    const consultationFee = doctor?.consultationFee || 150;
    const now = new Date();
    const data: RevenueData[] = [];
    
    // Generate data points based on selected time range
    const dataPoints = Math.min(6, Math.max(3, Math.floor(selectedTimeRange.days / 30)));
    const dayInterval = Math.ceil(selectedTimeRange.days / dataPoints);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * dayInterval * 24 * 60 * 60 * 1000);
      const endDate = new Date(date.getTime() + dayInterval * 24 * 60 * 60 * 1000);
      
      let revenue = 0;
      let appointmentCount = 0;
      
      if (selectedMetric === "revenue") {
        // Count completed appointments in this period and calculate revenue
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate && apt.status === "COMPLETED";
        });
        revenue = appointmentsInPeriod.length * consultationFee;
        appointmentCount = appointmentsInPeriod.length;
      } else if (selectedMetric === "appointments") {
        // Count all appointments in this period
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate;
        });
        appointmentCount = appointmentsInPeriod.length;
        revenue = appointmentsInPeriod.length * consultationFee; // Still calculate for consistency
      } else if (selectedMetric === "patients") {
        // Count unique patients in this period
        const appointmentsInPeriod = appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
          return aptDate >= date && aptDate < endDate;
        });
        const uniquePatients = [...new Set(appointmentsInPeriod.map(apt => apt.patientId))].length;
        appointmentCount = uniquePatients;
        revenue = uniquePatients * consultationFee; // Still calculate for consistency
      }
      
      data.push({
        month: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
        appointments: appointmentCount,
      });
    }
    
    return data;
  }, [appointments, selectedTimeRange, doctor, selectedMetric]);

  // Calculate upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filter appointments from today to next 7 days
    const upcoming = appointments.filter((apt: Appointment) => {
      const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
      return aptDate >= today && aptDate <= nextWeek;
    });
    
    // Sort by date
    upcoming.sort((a, b) => {
      const dateA = new Date(a.appointmentDate + 'T12:00:00');
      const dateB = new Date(b.appointmentDate + 'T12:00:00');
      return dateA.getTime() - dateB.getTime();
    });
    
    return upcoming.slice(0, 5); // Show next 5 appointments
  }, [appointments]);

  if (aptLoading || prescLoading) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "40px 20px",
      }}
      >
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: gradients.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(6,182,212,0.3)",
          animation: "pulse 2s infinite",
        }}
        >
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            Loading Reports
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
            Analyzing your clinical data and generating insights...
          </p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(6,182,212,0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(6,182,212,0.5); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "32px",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.1)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          top: "-40px",
          right: "20%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(6,182,212,0.08)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30px",
          right: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(139,92,246,0.06)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{
              background: "rgba(6,182,212,0.15)",
              color: "#06b6d4",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(6,182,212,0.25)",
            }}>
              Clinical Analytics
            </span>
            <h2 style={{
              margin: "12px 0 6px",
              fontSize: "clamp(20px,2.5vw,28px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
            }}>
              Reports & Insights
            </h2>
            <p style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "14px",
              maxWidth: "500px",
              lineHeight: 1.6,
            }}>
              Comprehensive analysis of your clinical performance, patient outcomes, and practice growth over time.
            </p>
          </div>

          {/* Time Range Selector */}
          <div style={{
            display: "flex",
            gap: "8px",
            padding: "4px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: selectedTimeRange.value === range.value
                    ? "rgba(6,182,212,0.2)"
                    : "transparent",
                  color: selectedTimeRange.value === range.value ? "#06b6d4" : "#e2e8f0",
                  fontSize: "12px",
                  fontWeight: selectedTimeRange.value === range.value ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedTimeRange.value !== range.value) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTimeRange.value !== range.value) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px" }}>
        {metricCards.map((card, index) => (
          <MetricCard key={index} card={card} />
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Revenue Trend Chart */}
        <div style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #e8f0fe",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                {selectedMetric === "revenue" ? "Revenue Trend" : 
                 selectedMetric === "appointments" ? "Appointment Trend" : "Patient Trend"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                {selectedMetric === "revenue" ? "Monthly revenue and appointment volume" :
                 selectedMetric === "appointments" ? "Monthly appointment volume and trends" : "Monthly patient acquisition and trends"}
              </p>
            </div>
            <div style={{
              display: "flex",
              gap: "8px",
              padding: "4px",
              background: "#f8fafc",
              borderRadius: "8px",
            }}>
              {[
                { key: "revenue", label: "Revenue" },
                { key: "patients", label: "Patients" },
                { key: "appointments", label: "Appointments" },
              ].map((metric) => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key as any)}
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    background: selectedMetric === metric.key
                      ? chartColors.primary
                      : "transparent",
                    color: selectedMetric === metric.key ? "#fff" : "#64748b",
                    fontSize: "11px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <MiniChart data={chartData} color={chartColors.primary} />
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "16px",
            }}>
              {displayData.slice(0, 3).map((data, index) => {
                let displayValue = "";
                let displayLabel = data.month;
                
                if (selectedMetric === "revenue") {
                  displayValue = `Rs ${(data.revenue / 1000).toFixed(1)}k`;
                } else if (selectedMetric === "appointments") {
                  displayValue = data.appointments.toString();
                } else if (selectedMetric === "patients") {
                  displayValue = data.appointments.toString(); // Already calculated as unique patients
                }
                
                return (
                  <div key={index} style={{ textAlign: "center" }}>
                    <p style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}>
                      {displayValue}
                    </p>
                    <p style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}>
                      {displayLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #e8f0fe",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Upcoming Appointments
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                Next 7 days schedule
              </p>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: "rgba(6,182,212,0.1)",
              borderRadius: "20px",
              border: "1px solid rgba(6,182,212,0.2)",
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#06b6d4",
              }} />
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#06b6d4",
              }}>
                {upcomingAppointments.length} scheduled
              </span>
            </div>
          </div>

          <div style={{ padding: "8px" }}>
            {upcomingAppointments.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#64748b",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 12px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="24" height="24" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
                  No upcoming appointments
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                  Your schedule is clear for the next week
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {upcomingAppointments.map((apt, index) => {
                  const aptDate = new Date(apt.appointmentDate + 'T12:00:00');
                  const isToday = aptDate.toDateString() === new Date().toDateString();
                  const isTomorrow = aptDate.getTime() - new Date().setHours(0,0,0,0) === 24 * 60 * 60 * 1000;
                  
                  return (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "12px",
                      background: isToday ? "rgba(6,182,212,0.05)" : "#f8fafc",
                      border: isToday ? "1px solid rgba(6,182,212,0.2)" : "1px solid #f1f5f9",
                      transition: "all 0.2s",
                    }}>
                      <div style={{
                        minWidth: "40px",
                        textAlign: "center",
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                        }}>
                          {aptDate.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}>
                          {aptDate.getDate()}
                        </p>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                        }}>
                          <span style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#0f172a",
                          }}>
                            Patient {apt.patientId.slice(-4)}
                          </span>
                          {isToday && (
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              background: "#06b6d4",
                              color: "#fff",
                              borderRadius: "10px",
                            }}>
                              Today
                            </span>
                          )}
                          {isTomorrow && (
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              background: "#f59e0b",
                              color: "#fff",
                              borderRadius: "10px",
                            }}>
                              Tomorrow
                            </span>
                          )}
                        </div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                          <span style={{
                            fontSize: "11px",
                            color: "#64748b",
                          }}>
                            {apt.consultationType || "In-person"}
                          </span>
                          <span style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                          }}>
                            ·
                          </span>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: apt.status === "CONFIRMED" ? "#10b981" : "#f59e0b",
                          }}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: apt.status === "CONFIRMED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        border: `1px solid ${apt.status === "CONFIRMED" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                      }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: apt.status === "CONFIRMED" ? "#10b981" : "#f59e0b",
                        }}>
                          Rs {doctor?.consultationFee || 150}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Patients */}
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        border: "1px solid #e8f0fe",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              Top Patients by Visits
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              Most engaged patients in your practice
            </p>
          </div>
          <button
            onClick={() => setActiveSection("patients")}
            style={{
              padding: "8px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#fff",
              color: "#64748b",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f8fafc";
              (e.currentTarget as HTMLElement).style.color = "#06b6d4";
              (e.currentTarget as HTMLElement).style.borderColor = "#06b6d4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fff";
              (e.currentTarget as HTMLElement).style.color = "#64748b";
              (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
            }}
          >
            View All Patients
          </button>
        </div>

        <div>
          {topPatients.map((patient, index) => (
            <PatientRow key={patient.id} patient={patient} index={index} />
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(124,58,237,0.02))",
        borderRadius: "18px",
        border: "1px solid rgba(139,92,246,0.15)",
        padding: "24px",
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
          Performance Insights
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                {calculateMetrics.patientGrowth > 0 ? "Excellent Growth" : "Steady Performance"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                Patient base {calculateMetrics.patientGrowth > 0 ? `increased by ${calculateMetrics.patientGrowth}%` : `maintained at ${calculateMetrics.uniquePatients} patients`} this period
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                Strong Performance
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                {calculateMetrics.completedAppointments} appointments completed this period
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                Revenue Success
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                Rs {(calculateMetrics.totalRevenue / 1000).toFixed(1)}k generated from consultations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
