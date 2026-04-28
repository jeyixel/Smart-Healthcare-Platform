"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePatientAppointments, ConsultationType, AppointmentStatus } from "@/app/hooks/usePatientAppointments";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

// ─── Palette helpers ──────────────────────────────────────────────────────────

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; bg: string; color: string; dot: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "rgba(245,158,11,0.10)",
    color: "#d97706",
    dot: "#f59e0b",
    border: "rgba(245,158,11,0.25)",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "rgba(99,102,241,0.10)",
    color: "#4f46e5",
    dot: "#6366f1",
    border: "rgba(99,102,241,0.25)",
  },
  COMPLETED: {
    label: "Completed",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
};

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  ONLINE:   { icon: "🖥️", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  PHYSICAL: { icon: "🏥", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

const PAYMENT_STATUS_META: Record<string, { label: string; bg: string; color: string; dot: string; border: string }> = {
  PENDING: {
    label: "Pending",
    bg: "rgba(245,158,11,0.10)",
    color: "#d97706",
    dot: "#f59e0b",
    border: "rgba(245,158,11,0.25)",
  },
  PAID: {
    label: "Paid",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  COMPLETED: {
    label: "Paid",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  SUCCESS: {
    label: "Paid",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  PAYMENT_COMPLETED: {
    label: "Paid",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  EXPIRED: {
    label: "Expired",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
  PAYMENT_EXPIRED: {
    label: "Expired",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
  FAILED: {
    label: "Failed",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
  PAYMENT_FAILED: {
    label: "Failed",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
};

function statusPill(status: AppointmentStatus) {
  const m = STATUS_META[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: 700,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        padding: "3px 10px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

function paymentStatusPill(paymentStatus: string) {
  const m = PAYMENT_STATUS_META[paymentStatus] || PAYMENT_STATUS_META.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: 700,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        padding: "3px 10px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " at " + d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function avatarColor(str: string): number {
  const hues = [210, 160, 280, 30, 340, 190, 120, 50];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00");
  return today.toDateString() === date.toDateString();
}

function isFuture(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00");
  return date > today;
}

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00");
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return "";
}

export function PatientAppointmentManagementContent({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const { appointments, patient, doctors, loading, error, refetch, createAppointment, rescheduleAppointment, deleteAppointment } = usePatientAppointments();
  const [activeTab, setActiveTab] = useState<'my-appointments' | 'today-appointments' | 'book-appointment'>('my-appointments');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showDoctorDetailsModal, setShowDoctorDetailsModal] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState<any>(null);
  const [successBooking, setSuccessBooking] = useState<{ id: string, amount: number, doctorName: string } | null>(null);

  // Book New Filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Loading states for operations
  const [isCreating, setIsCreating] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Search and filter states
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");

  // Sorting states
  const [appointmentSortBy, setAppointmentSortBy] = useState<'date' | 'time'>('date');
  const [appointmentSortOrder, setAppointmentSortOrder] = useState<'asc' | 'desc'>('asc');

  const [createForm, setCreateForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "PHYSICAL" as ConsultationType,
    reason: "",
  });

  const [formErrors, setFormErrors] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
  });

  useEffect(() => {
    let ignore = false;

    const syncPaymentFromReturn = async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order_id");
      const paymentId = params.get("payment_id");

      if (!orderId) return;

      const token = localStorage.getItem("smart_admin_token");
      if (!token) return;

      try {
        const response = await fetch(`${API_GATEWAY}/api/payments/appointments/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "PAID",
            transactionId: paymentId || `PAYHERE_${Date.now()}`,
            amount: 0,
          }),
        });

        if (response.ok && !ignore) {
          refetch();
        }
      } catch {
        // If sync fails, keep current UI state and let normal fetch flow continue.
      } finally {
        params.delete("order_id");
        params.delete("payment_id");
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        window.history.replaceState({}, "", next);
      }
    };

    void syncPaymentFromReturn();
    return () => {
      ignore = true;
    };
  }, [refetch]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appt => {
      const doctor = doctors.find(d => d.id === appt.doctorId);
      const matchesSearch = !appointmentSearch || 
        doctor?.fullName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        appt.appointmentDate.includes(appointmentSearch) ||
        appt.consultationType.toLowerCase().includes(appointmentSearch.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (appointmentSortBy === 'date') {
        const dateA = new Date(a.appointmentDate).getTime();
        const dateB = new Date(b.appointmentDate).getTime();
        return appointmentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (appointmentSortBy === 'time') {
        const timeA = a.appointmentTime;
        const timeB = b.appointmentTime;
        return appointmentSortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
      }
      return 0;
    });
  }, [appointments, doctors, appointmentSearch, statusFilter, appointmentSortBy, appointmentSortOrder]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // Search filter
      const matchesSearch = !doctorSearch || 
        doctor.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(doctorSearch.toLowerCase());
      
      // Specialty filter
      const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || doctor.category === categoryFilter;
      
      // Price range filter
      let matchesPrice = true;
      if (priceRange.min || priceRange.max) {
        const fee = doctor.consultationFee;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        matchesPrice = fee >= min && fee <= max;
      }
      
      return matchesSearch && matchesSpecialty && matchesCategory && matchesPrice;
    });
  }, [doctors, doctorSearch, specialtyFilter, categoryFilter, priceRange]);

  const validateCreateForm = () => {
    const errors = {
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
    };
    
    let isValid = true;

    // Validate date (not past)
    if (!createForm.appointmentDate) {
      errors.appointmentDate = "Please select a date";
      isValid = false;
    } else {
      const selectedDate = new Date(createForm.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.appointmentDate = "Cannot select past dates";
        isValid = false;
      }
    }

    // Validate time (not past for today, minimum 2 hours from now)
    if (!createForm.appointmentTime) {
      errors.appointmentTime = "Please select a time";
      isValid = false;
    } else if (createForm.appointmentDate) {
      const selectedDate = new Date(createForm.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if selected date is today
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      if (isToday) {
        const selectedTime = createForm.appointmentTime.split(':');
        const selectedHour = parseInt(selectedTime[0]);
        const selectedMinute = parseInt(selectedTime[1]);
        const now = new Date();
        
        // Create full datetime objects for accurate comparison
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(selectedHour, selectedMinute, 0, 0);
        
        const minimumDateTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours in milliseconds
        
        // Debug logging (remove in production)
        console.log('Time validation debug:', {
          selectedDate: selectedDate.toDateString(),
          today: today.toDateString(),
          isToday,
          selectedDateTime: selectedDateTime.toLocaleString(),
          minimumDateTime: minimumDateTime.toLocaleString(),
          now: now.toLocaleString()
        });
        
        if (selectedDateTime <= minimumDateTime) {
          errors.appointmentTime = "Appointment must be at least 2 hours from current time";
          isValid = false;
        }
      }
    }

    // Validate reason (minimum 10 characters)
    if (!createForm.reason || createForm.reason.trim().length < 10) {
      errors.reason = "Reason must be at least 10 characters long";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreate = async () => {
    if (!patient) return;
    
    if (!validateCreateForm()) {
      return;
    }
    
    setIsCreating(true);
    try {
      const createdAppt = await createAppointment({ ...createForm, patientId: patient.id });
      setShowBookModal(false);
      setSuccessBooking({
        id: createdAppt.id,
        amount: selectedDoctor.consultationFee,
        doctorName: selectedDoctor.fullName
      });
      setCreateForm({ doctorId: "", appointmentDate: "", appointmentTime: "", consultationType: "PHYSICAL", reason: "" });
      setFormErrors({ appointmentDate: "", appointmentTime: "", reason: "" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleReschedule = async () => {
    if (!editingId) return;
    setIsRescheduling(true);
    try {
      await rescheduleAppointment(editingId, editForm);
      setEditingId(null);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (appt: any) => {
    setEditingId(appt.id);
    setEditForm({ appointmentDate: appt.appointmentDate, appointmentTime: appt.appointmentTime });
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setCreateForm({ ...createForm, doctorId: doctor.id });
    setShowBookModal(true);
  };

  const handleViewDoctor = (doctor: any) => {
    setViewingDoctor(doctor);
    setShowDoctorDetailsModal(true);
  };

  const statusColor = (s: AppointmentStatus) => {
    switch (s) {
      case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "CONFIRMED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "CANCELLED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "COMPLETED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        {!hideNavbar && <PatientNavbar />}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex flex-col items-center gap-8 max-w-md w-full">
            {/* Enhanced Loading Animation */}
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-[#4fd1c5]/20 border-t-[#4fd1c5]"></div>
              <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 animation-delay-150"></div>
              <div className="absolute inset-2 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#4fd1c5]/10 to-blue-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-[#4fd1c5] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading Text with Enhanced Styling */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 animate-pulse">Loading Your Appointments</h2>
              <p className="text-slate-600 font-medium">Please wait while we fetch your medical appointments...</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 rounded-full bg-[#4fd1c5] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-[#4fd1c5] animate-bounce animation-delay-200"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#4fd1c5] to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading Tips */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4fd1c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Did You Know?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regular health check-ups and preventive care can help detect potential health issues early, leading to better treatment outcomes and overall wellness.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${hideNavbar ? "" : "bg-[#f8fafc]"} text-slate-900 selection:bg-[#4fd1c5]/30 pb-12`}>
      {!hideNavbar && <PatientNavbar />}
      
      <main className={`mx-auto max-w-7xl px-4 ${hideNavbar ? "pt-4" : "pt-32"} sm:px-6 lg:px-8`}>
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointment Management</h1>
            <p className="text-slate-600 mt-1">Schedule consultations and track your health journey</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'my-appointments' 
                ? 'bg-[#4fd1c5] text-white shadow-lg shadow-[#4fd1c5]/20' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('today-appointments')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'today-appointments' 
                ? 'bg-[#4fd1c5] text-white shadow-lg shadow-[#4fd1c5]/20' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today's Appointments
            </button>
            <button
              onClick={() => setActiveTab('book-appointment')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'book-appointment' 
                ? 'bg-[#4fd1c5] text-white shadow-lg shadow-[#4fd1c5]/20' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Book New
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* --- My Appointments Tab --- */}
        {activeTab === 'my-appointments' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {appointments.filter(appt => isToday(appt.appointmentDate)).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {appointments.filter(appt => appt.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {appointments.filter(appt => appt.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by specialty, doctor or date..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#4fd1c5]/50 transition-all shadow-sm"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
                className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none focus:border-[#4fd1c5]/50 transition-all shadow-sm min-w-[160px]"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Appointments Grid/Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">#</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Doctor</th>
                      <th 
                      onClick={() => {
                        setAppointmentSortBy('date');
                        setAppointmentSortOrder(appointmentSortBy === 'date' && appointmentSortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold cursor-pointer hover:text-slate-800 transition-colors"
                      style={{
                        background: "linear-gradient(135deg,rgba(6,182,212,0.04),rgba(99,102,241,0.02))",
                        userSelect: "none",
                        transition: "color 0.15s",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>Date & Time</span>
                        <span style={{ fontSize: "10px", marginLeft: "3px" }}>
                          ↕{appointmentSortBy === 'date' ? (appointmentSortOrder === 'asc' ? " ▲" : " ▼") : ""}
                        </span>
                      </div>
                    </th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Mode</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Status</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Payment</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAppointments.map((appt, index) => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      const typeMeta = TYPE_META[appt.consultationType] ?? TYPE_META.PHYSICAL;
                      const today = isToday(appt.appointmentDate);
                      const upcoming = isFuture(appt.appointmentDate);
                      const hue = avatarColor(appt.doctorId);
                      const normalizedPaymentStatus = String(appt.paymentStatus ?? "PENDING").trim().toUpperCase();
                      const isUnpaid = !["PAID", "COMPLETED", "SUCCESS", "PAYMENT_COMPLETED"].includes(normalizedPaymentStatus);
                      
                      return (
                        <tr 
                          key={appt.id} 
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAppointment(appt)}
                        >
                          <td className="px-6 py-4 text-slate-500 font-semibold text-sm">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  flexShrink: 0,
                                  boxShadow: `0 2px 10px hsl(${hue},70%,55%)33`,
                                }}
                              >
                                {doctor?.fullName?.charAt(0) || "D"}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    color: "#0f172a",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "160px",
                                  }}
                                >
                                  {`Dr. ${doctor?.fullName ?? "Unknown Doctor"}`}
                                </p>
                                <p
                                  style={{
                                    margin: "2px 0 0",
                                    fontSize: "11px",
                                    color: "#64748b",
                                    fontWeight: 500,
                                  }}
                                >
                                  {doctor?.specialty ?? "General"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>
                                {formatDate(appt.appointmentDate)}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                {formatTime(appt.appointmentTime)}
                              </p>
                              {today && (
                                <span
                                  style={{
                                    marginLeft: "8px",
                                    fontSize: "10px",
                                    background: "rgba(6,182,212,0.12)",
                                    color: "#0891b2",
                                    padding: "1px 8px",
                                    borderRadius: "999px",
                                    fontWeight: 700,
                                  }}
                                >
                                  TODAY
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: typeMeta.bg,
                                color: typeMeta.color,
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ fontSize: "14px" }}>{typeMeta.icon}</span>
                              {appt.consultationType}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {statusPill(appt.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {paymentStatusPill(normalizedPaymentStatus)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isUnpaid && appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                                <Link 
                                  href={`/patient/payment/${appt.id}?amount=${doctor?.consultationFee || 0}`}
                                  className="px-3 py-1.5 bg-[#4fd1c5] text-white text-xs font-bold rounded-lg hover:bg-[#0891b2] transition-colors shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Pay Now
                                </Link>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }} 
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" 
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {appt.status === "PENDING" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); startEdit(appt); }} 
                                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors" 
                                  title="Reschedule"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              )}
                              {(appt.status === "PENDING" || appt.status === "CANCELLED") && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteId(appt.id); }} 
                                  className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors" 
                                  title="Cancel"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredAppointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Found</h3>
                  <p className="text-slate-500 max-w-xs mb-6">You haven't scheduled any consultations yet or none match your filters.</p>
                  <button 
                    onClick={() => setActiveTab('book-appointment')} 
                    className="rounded-xl bg-[#4fd1c5] px-6 py-2.5 font-bold text-white shadow-lg shadow-[#4fd1c5]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Today's Appointments Tab --- */}
        {activeTab === 'today-appointments' && (
          <div className="space-y-6">
            {/* Today's Appointments List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">#</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Doctor</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Date & Time</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Mode</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Status</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Payment</th>
                      <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {appointments.filter(appt => isToday(appt.appointmentDate)).map((appt, index) => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      const typeMeta = TYPE_META[appt.consultationType] ?? TYPE_META.PHYSICAL;
                      const hue = avatarColor(appt.doctorId);
                      const normalizedPaymentStatus = String(appt.paymentStatus ?? "PENDING").trim().toUpperCase();
                      const isUnpaid = !["PAID", "COMPLETED", "SUCCESS", "PAYMENT_COMPLETED"].includes(normalizedPaymentStatus);
                      
                      return (
                        <tr 
                          key={appt.id} 
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAppointment(appt)}
                        >
                          <td className="px-6 py-4 text-slate-500 font-semibold text-sm">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  flexShrink: 0,
                                  boxShadow: `0 2px 10px hsl(${hue},70%,55%)33`,
                                }}
                              >
                                {doctor?.fullName?.charAt(0) || "D"}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    color: "#0f172a",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "160px",
                                  }}
                                >
                                  {`Dr. ${doctor?.fullName ?? "Unknown Doctor"}`}
                                </p>
                                <p
                                  style={{
                                    margin: "2px 0 0",
                                    fontSize: "11px",
                                    color: "#64748b",
                                    fontWeight: 500,
                                  }}
                                >
                                  {doctor?.specialty ?? "General"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>
                                {formatDate(appt.appointmentDate)}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                {formatTime(appt.appointmentTime)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: typeMeta.bg,
                                color: typeMeta.color,
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ fontSize: "14px" }}>{typeMeta.icon}</span>
                              {appt.consultationType}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {statusPill(appt.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {paymentStatusPill(normalizedPaymentStatus)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isUnpaid && appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                                <Link 
                                  href={`/patient/payment/${appt.id}?amount=${doctor?.consultationFee || 0}`}
                                  className="px-3 py-1.5 bg-[#4fd1c5] text-white text-xs font-bold rounded-lg hover:bg-[#0891b2] transition-colors shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Pay Now
                                </Link>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }} 
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" 
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {appt.status === "PENDING" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); startEdit(appt); }} 
                                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors" 
                                  title="Reschedule"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              )}
                              {(appt.status === "PENDING" || appt.status === "CANCELLED") && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteId(appt.id); }} 
                                  className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors" 
                                  title="Cancel"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {appointments.filter(appt => isToday(appt.appointmentDate)).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Today</h3>
                  <p className="text-slate-500 max-w-xs mb-6">You don't have any appointments scheduled for today.</p>
                  <button 
                    onClick={() => setActiveTab('book-appointment')} 
                    className="rounded-xl bg-[#4fd1c5] px-6 py-2.5 font-bold text-white shadow-lg shadow-[#4fd1c5]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Book an Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Book Appointment Tab --- */}
        {activeTab === 'book-appointment' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className="px-6 py-8 bg-gradient-to-br from-gray-300 via-white to-gray-500/30 rounded-2xl shadow-lg shadow-gray-400/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4fd1c5]/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      placeholder="Search by name, specialty..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="relative w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl py-4 pl-5 pr-12 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#4fd1c5]/50 focus:ring-2 focus:ring-[#4fd1c5]/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4fd1c5] group-hover:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Specialty Filter */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <select
                      value={specialtyFilter}
                      onChange={(e) => setSpecialtyFilter(e.target.value)}
                      className="relative w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl py-3 pl-5 pr-10 text-sm text-slate-900 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="all">All Specialties</option>
                      {[...new Set(doctors.map(d => d.specialty))].map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="relative w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl py-3 pl-5 pr-10 text-sm text-slate-900 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {[...new Set(doctors.map(d => d.category))].map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="number"
                      placeholder="Min Price (LKR)"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="relative w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl py-4 px-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="number"
                      placeholder="Max Price (LKR)"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="relative w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl py-4 px-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4fd1c5] animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Found <span className="text-[#4fd1c5] font-bold">{filteredDoctors.length}</span> {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDoctorSearch('');
                    setSpecialtyFilter('all');
                    setCategoryFilter('all');
                    setPriceRange({ min: '', max: '' });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/60"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear All Filters
                  </span>
                </button>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="group relative bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200/50 p-6 shadow-lg hover:shadow-2xl hover:border-[#4fd1c5]/60 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                  {/* Enhanced gradient overlay */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4fd1c5]/20 via-blue-500/20 to-[#4fd1c5]/20 opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl"></div>
                  
                  {/* Background decoration */}
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#4fd1c5]/5 to-blue-500/5 blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/5 to-[#4fd1c5]/5 blur-2xl"></div>
                  
                  <div className="relative flex flex-col items-center">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#4fd1c5] via-blue-500 to-[#4fd1c5] flex items-center justify-center text-white text-3xl font-bold p-1 overflow-hidden shadow-2xl ring-4 ring-white/20 group-hover:ring-[#4fd1c5]/30 transition-all duration-500">
                        {doctor.profileImageUrl ? (
                          <img src={doctor.profileImageUrl} alt={`Dr. ${doctor.fullName}`} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          doctor.fullName.charAt(0)
                        )}
                      </div>
                      {/* Status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Enhanced Name and Specialty */}
                    <div className="text-center mt-3">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-[#4fd1c5] transition-colors duration-300">{`Dr. ${doctor.fullName}`}</h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#4fd1c5] uppercase tracking-wider">{doctor.specialty}</span>
                        <div className="w-1 h-1 rounded-full bg-[#4fd1c5]/50"></div>
                        <span className="text-xs text-slate-500 font-medium">{doctor.verified ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Stats Grid */}
                    <div className="mt-4 w-full grid grid-cols-2 gap-3">
                       <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-3 border border-slate-200/50 text-center hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-center mb-1">
                            <svg className="w-3 h-3 text-[#4fd1c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-[10px] uppercase font-bold text-slate-600 mb-1">Experience</p>
                          <p className="text-sm font-bold text-slate-900">{doctor.experienceYears} Years</p>
                       </div>
                       <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-3 border border-emerald-200/50 text-center hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-center mb-1">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Consultation</p>
                          <p className="text-sm font-bold text-emerald-700">LKR {doctor.consultationFee}</p>
                       </div>
                    </div>

                    {/* Enhanced Hospital Info */}
                    <div className="mt-4 w-full bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-3 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#4fd1c5]/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#4fd1c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-0.5">Hospital/Clinic</p>
                          <p className="text-xs text-slate-900 font-medium truncate">{doctor.hospitalOrClinic}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Buttons */}
                    <div className="mt-5 flex gap-2 w-full">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300/50 py-3 px-4 text-xs font-bold text-slate-700 transition-all duration-300 hover:from-slate-200 hover:to-slate-300 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Profile
                        </span>
                      </button>
                      <button
                        onClick={() => handleDoctorSelect(doctor)}
                        className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4fd1c5] to-blue-500 border border-[#4fd1c5]/50 py-3 px-4 text-xs font-bold text-white transition-all duration-300 hover:from-blue-500 hover:to-[#4fd1c5] hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center justify-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="py-24 text-center">
                 <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">No Specialists Found</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Try broadening your search criteria or selecting a different specialty filter.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- Modals --- */}
      
      {/* Booking Modal */}
      {showBookModal && selectedDoctor && (
        <div 
          onClick={() => { setShowBookModal(false); setSelectedDoctor(null); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Schedule Consultation
                </p>
                <h3 style={{ margin: "4px 0 0", color: "#fff", fontSize: "16px", fontWeight: 700 }}>
                  {`Dr. ${selectedDoctor.fullName}`}
                </h3>
              </div>
              <button
                onClick={() => { setShowBookModal(false); setSelectedDoctor(null); }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4fd1c5] flex items-center justify-center text-white font-black">{selectedDoctor.fullName.charAt(0)}</div>
                <div>
                  <p className="font-bold text-slate-900">{`Dr. ${selectedDoctor.fullName}`}</p>
                  <p className="text-xs font-bold text-[#4fd1c5] uppercase tracking-widest">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Select Date</label>
                   <input
                     type="date"
                     value={createForm.appointmentDate}
                     min={new Date().toISOString().split('T')[0]}
                     onChange={(e) => {
                       setCreateForm({ ...createForm, appointmentDate: e.target.value });
                       setFormErrors({ ...formErrors, appointmentDate: "" });
                     }}
                     className={`w-full bg-white border rounded-xl p-3 text-sm outline-none transition ${
                       formErrors.appointmentDate 
                         ? 'border-rose-300 text-rose-900 focus:border-rose-500' 
                         : 'border-slate-200 text-slate-900 focus:border-[#4fd1c5]/50'
                     }`}
                   />
                   {formErrors.appointmentDate && (
                     <p className="text-xs text-rose-600 mt-1">{formErrors.appointmentDate}</p>
                   )}
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Select Time</label>
                   <input
                     type="time"
                     value={createForm.appointmentTime}
                     onChange={(e) => {
                       setCreateForm({ ...createForm, appointmentTime: e.target.value });
                       setFormErrors({ ...formErrors, appointmentTime: "" });
                     }}
                     className={`w-full bg-white border rounded-xl p-3 text-sm outline-none transition ${
                       formErrors.appointmentTime 
                         ? 'border-rose-300 text-rose-900 focus:border-rose-500' 
                         : 'border-slate-200 text-slate-900 focus:border-[#4fd1c5]/50'
                     }`}
                   />
                   {formErrors.appointmentTime && (
                     <p className="text-xs text-rose-600 mt-1">{formErrors.appointmentTime}</p>
                   )}
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Consultation Mode</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setCreateForm({ ...createForm, consultationType: 'PHYSICAL' })}
                        className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                          createForm.consultationType === 'PHYSICAL' 
                            ? 'bg-[#4fd1c5] border-[#4fd1c5] text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Physical Visit
                      </button>
                      <button 
                        onClick={() => setCreateForm({ ...createForm, consultationType: 'ONLINE' })}
                        className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                          createForm.consultationType === 'ONLINE' 
                            ? 'bg-[#4fd1c5] border-[#4fd1c5] text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Online Consult
                      </button>
                   </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Reason for Visit</label>
                    <span className={`text-xs ${createForm.reason.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {createForm.reason.trim().length}/10 characters
                    </span>
                  </div>
                  <textarea
                    placeholder="Tell the doctor briefly about your concern..."
                    value={createForm.reason}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, reason: e.target.value });
                      setFormErrors({ ...formErrors, reason: "" });
                    }}
                    className={`w-full bg-white border rounded-xl p-3 text-sm outline-none transition resize-none ${
                      formErrors.reason 
                        ? 'border-rose-300 text-rose-900 focus:border-rose-500' 
                        : 'border-slate-200 text-slate-900 focus:border-[#4fd1c5]/50'
                    }`}
                    rows={3}
                  />
                  {formErrors.reason && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.reason}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => { setShowBookModal(false); setSelectedDoctor(null); }} 
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={isCreating}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "none",
                    background: isCreating
                      ? "#94a3b8"
                      : "linear-gradient(135deg,#06b6d4,#0891b2)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: isCreating ? "not-allowed" : "pointer",
                    boxShadow: isCreating ? "none" : "0 4px 14px rgba(6,182,212,0.4)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {isCreating ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                      </svg>
                      Creating…
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div 
          onClick={() => setSelectedAppointment(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 900,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 95vw)",
              background: "#fff",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              animation: "slideRight 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Top strip */}
            <div
              style={{
                background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#06b6d4",
                    background: "rgba(6,182,212,0.15)",
                    border: "1px solid rgba(6,182,212,0.25)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  Appointment Details
                </span>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 700 }}>
                {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}
              </h2>
            </div>

            {/* Content */}
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                 <div 
                   style={{
                     width: "60px",
                     height: "60px",
                     borderRadius: "50%",
                     background: `linear-gradient(135deg,hsl(${avatarColor(selectedAppointment.doctorId)},70%,55%),hsl(${avatarColor(selectedAppointment.doctorId) + 30},60%,45%))`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "#fff",
                     fontSize: "20px",
                     fontWeight: 800,
                     marginBottom: "12px",
                     boxShadow: `0 4px 20px hsl(${avatarColor(selectedAppointment.doctorId)},70%,55%)33`,
                   }}
                 >
                   {doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName?.charAt(0) || "D"}
                 </div>
                 <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: 700, textAlign: "center" }}>
                   {doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName}
                 </h3>
                 <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                   {doctors.find(d => d.id === selectedAppointment.doctorId)?.specialty}
                 </p>
              </div>

              {/* Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date & Time</p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{formatDate(selectedAppointment.appointmentDate)}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>{formatTime(selectedAppointment.appointmentTime)}</p>
                 </div>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status & Mode</p>
                    <div style={{ marginBottom: "4px" }}>{statusPill(selectedAppointment.status)}</div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: TYPE_META[selectedAppointment.consultationType]?.bg || "rgba(16,185,129,0.08)",
                        color: TYPE_META[selectedAppointment.consultationType]?.color || "#10b981",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>{TYPE_META[selectedAppointment.consultationType]?.icon || "🏥"}</span>
                      {selectedAppointment.consultationType}
                    </div>
                 </div>
              </div>

              {/* Payment Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Status</p>
                    <div style={{ marginBottom: "8px" }}>{paymentStatusPill(selectedAppointment.paymentStatus || 'PENDING')}</div>
                    {selectedAppointment.paymentDeadline && (
                      <div style={{ marginTop: "8px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Deadline</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: 500 }}>
                          {formatDateTime(selectedAppointment.paymentDeadline)}
                        </p>
                      </div>
                    )}
                 </div>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Consultation Fee</p>
                    <p style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: 700 }}>
                      LKR {doctors.find(d => d.id === selectedAppointment.doctorId)?.consultationFee || 0}
                    </p>
                 </div>
              </div>

              {/* Reason */}
              {selectedAppointment.reason && (
                <div style={{ marginTop: "16px" }}>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Reason for Visit
                  </p>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "16px",
                      fontSize: "14px",
                      color: "#334155",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedAppointment.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                gap: "12px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
               <button 
                 onClick={() => setSelectedAppointment(null)} 
                 style={{
                   flex: 1,
                   padding: "12px 16px",
                   borderRadius: "12px",
                   border: "1px solid #e2e8f0",
                   background: "#fff",
                   color: "#64748b",
                   fontWeight: 600,
                   fontSize: "14px",
                   cursor: "pointer",
                   transition: "all 0.2s ease",
                 }}
               >
                 Close
               </button>
               
               {/* PENDING: Show Cancel and Reschedule buttons */}
               {selectedAppointment.status === "PENDING" && (
                 <>
                   <button 
                     onClick={() => { setSelectedAppointment(null); setDeleteId(selectedAppointment.id); }} 
                     style={{
                       flex: 1,
                       padding: "12px 16px",
                       borderRadius: "12px",
                       border: "none",
                       background: "linear-gradient(135deg, #ef4444, #dc2626)",
                       color: "#fff",
                       fontWeight: 600,
                       fontSize: "14px",
                       cursor: "pointer",
                       boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                       transition: "all 0.2s ease",
                     }}
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => { setSelectedAppointment(null); startEdit(selectedAppointment); }} 
                     style={{
                       flex: 1,
                       padding: "12px 16px",
                       borderRadius: "12px",
                       border: "none",
                       background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                       color: "#fff",
                       fontWeight: 600,
                       fontSize: "14px",
                       cursor: "pointer",
                       boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
                       transition: "all 0.2s ease",
                     }}
                   >
                     Reschedule
                   </button>
                 </>
               )}
               
               {/* CANCELLED: Show Cancel button */}
               {selectedAppointment.status === "CANCELLED" && (
                 <button 
                   onClick={() => { setSelectedAppointment(null); setDeleteId(selectedAppointment.id); }} 
                   style={{
                     flex: 1,
                     padding: "12px 16px",
                     borderRadius: "12px",
                     border: "none",
                     background: "linear-gradient(135deg, #ef4444, #dc2626)",
                     color: "#fff",
                     fontWeight: 600,
                     fontSize: "14px",
                     cursor: "pointer",
                     boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                     transition: "all 0.2s ease",
                   }}
                 >
                     Cancel
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {editingId && (
        <div 
          onClick={() => setEditingId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Update Appointment
                </p>
                <h3 style={{ margin: "4px 0 0", color: "#fff", fontSize: "16px", fontWeight: 700 }}>
                  Modify Schedule
                </h3>
              </div>
              <button
                onClick={() => setEditingId(null)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <div className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Date</label>
                 <input
                   type="date"
                   value={editForm.appointmentDate}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Time</label>
                 <input
                   type="time"
                   value={editForm.appointmentTime}
                   onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>
             </div>
             <div className="flex gap-3 mt-8">
               <button 
                 onClick={() => setEditingId(null)} 
                 className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
               >
                 Discard
               </button>
               <button 
                 onClick={handleReschedule} 
                 disabled={isRescheduling}
                 style={{
                   flex: 1,
                   padding: "12px 16px",
                   borderRadius: "12px",
                   border: "none",
                   background: isRescheduling
                     ? "#94a3b8"
                     : "linear-gradient(135deg,#06b6d4,#0891b2)",
                   color: "#fff",
                   fontWeight: 700,
                   fontSize: "13px",
                   cursor: isRescheduling ? "not-allowed" : "pointer",
                   boxShadow: isRescheduling ? "none" : "0 4px 14px rgba(6,182,212,0.4)",
                   transition: "all 0.2s",
                   display: "flex",
                   alignItems: "center",
                   gap: "8px",
                 }}
               >
                 {isRescheduling ? (
                   <>
                     <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                       <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                       <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                     </svg>
                     Updating…
                   </>
                 ) : (
                   "Apply Changes"
                 )}
               </button>
             </div>
           </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div 
          onClick={() => setDeleteId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Cancel Appointment?
                </p>
                <h3 style={{ margin: "4px 0 0", color: "#fff", fontSize: "16px", fontWeight: 700 }}>
                  Confirm Cancellation
                </h3>
              </div>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div 
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(239,68,68,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                Cancel Appointment?
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
                This action will remove your reservation. You may not be able to reclaim this time slot later.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  Keep Appointment
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "none",
                    background: isDeleting
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    boxShadow: isDeleting ? "none" : "0 4px 14px rgba(239,68,68,0.4)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {isDeleting ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                      </svg>
                      Cancelling…
                    </>
                  ) : (
                    "Cancel Appointment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDoctorDetailsModal && viewingDoctor && (
        <div 
          onClick={() => { setShowDoctorDetailsModal(false); setViewingDoctor(null); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px 24px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  {viewingDoctor.fullName.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 700 }}>
                    Doctor Details
                  </h2>
                  <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "14px" }}>
                    {`Dr. ${viewingDoctor.fullName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowDoctorDetailsModal(false); setViewingDoctor(null); }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
                
                {/* Left Column - Profile & Basic Info */}
                <div>
                  {/* Profile Header */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", position: "relative" }}>
                     <div 
                       style={{
                         width: "100px",
                         height: "100px",
                         borderRadius: "50%",
                         background: `linear-gradient(135deg,hsl(${avatarColor(viewingDoctor.id)},70%,55%),hsl(${avatarColor(viewingDoctor.id) + 30},60%,45%))`,
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         color: "#fff",
                         fontSize: "32px",
                         fontWeight: 800,
                         marginBottom: "16px",
                         boxShadow: `0 12px 40px hsl(${avatarColor(viewingDoctor.id)},70%,55%)4`,
                         border: "3px solid rgba(255,255,255,0.1)",
                         position: "relative",
                       }}
                     >
                       {viewingDoctor.profileImageUrl ? (
                         <img src={viewingDoctor.profileImageUrl} alt={`Dr. ${viewingDoctor.fullName}`} className="w-full h-full object-cover rounded-full" />
                       ) : (
                         viewingDoctor.fullName.charAt(0)
                       )}
                       {/* Status Badge */}
                       <div style={{
                         position: "absolute",
                         bottom: "4px",
                         right: "4px",
                         width: "24px",
                         height: "24px",
                         borderRadius: "50%",
                         background: viewingDoctor.verified ? "#10b981" : "#f59e0b",
                         border: "3px solid #1e293b",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                       }}>
                         <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                         </svg>
                       </div>
                     </div>
                     
                     <h3 style={{ margin: 0, color: "#fff", fontSize: "20px", fontWeight: 700, textAlign: "center" }}>
                       {`Dr. ${viewingDoctor.fullName}`}
                     </h3>
                     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                       <span style={{ 
                         padding: "4px 12px", 
                         background: "rgba(6,182,212,0.2)", 
                         color: "#06b6d4", 
                         fontSize: "12px", 
                         fontWeight: 600, 
                         borderRadius: "20px",
                         textTransform: "uppercase",
                         letterSpacing: "0.05em"
                       }}>
                         {viewingDoctor.specialty}
                       </span>
                       <span style={{ 
                         padding: "4px 12px", 
                         background: viewingDoctor.verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", 
                         color: viewingDoctor.verified ? "#10b981" : "#f59e0b", 
                         fontSize: "11px", 
                         fontWeight: 600, 
                         borderRadius: "20px",
                         textTransform: "uppercase",
                         letterSpacing: "0.05em"
                       }}>
                         {viewingDoctor.verified ? "Verified" : "Pending"}
                       </span>
                     </div>
                   </div>

                  {/* Quick Stats */}
                  <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
                     <div style={{ 
                       background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.1))", 
                       border: "1px solid rgba(6,182,212,0.2)", 
                       borderRadius: "12px", 
                       padding: "16px"
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "50%", 
                            background: "rgba(6,182,212,0.2)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}>
                            <svg width="20" height="20" fill="#06b6d4" viewBox="0 0 24 24">
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div>
                            <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Experience</p>
                            <p style={{ margin: 0, fontSize: "18px", color: "#fff", fontWeight: 700 }}>
                              {viewingDoctor.experienceYears} <span style={{ fontSize: "12px", fontWeight: 500 }}>years</span>
                            </p>
                          </div>
                        </div>
                     </div>
                     <div style={{ 
                       background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))", 
                       border: "1px solid rgba(16,185,129,0.2)", 
                       borderRadius: "12px", 
                       padding: "16px"
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "50%", 
                            background: "rgba(16,185,129,0.2)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}>
                            <svg width="20" height="20" fill="#10b981" viewBox="0 0 24 24">
                              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div>
                            <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Consultation Fee</p>
                            <p style={{ margin: 0, fontSize: "18px", color: "#10b981", fontWeight: 700 }}>
                              LKR {viewingDoctor.consultationFee}
                            </p>
                          </div>
                        </div>
                     </div>
                     {viewingDoctor.rating && (
                       <div style={{ 
                         background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))", 
                         border: "1px solid rgba(245,158,11,0.2)", 
                         borderRadius: "12px", 
                         padding: "16px"
                       }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ 
                              width: "40px", 
                              height: "40px", 
                              borderRadius: "50%", 
                              background: "rgba(245,158,11,0.2)", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center"
                            }}>
                              <svg width="20" height="20" fill="#f59e0b" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rating</p>
                              <p style={{ margin: 0, fontSize: "18px", color: "#f59e0b", fontWeight: 700 }}>
                                {viewingDoctor.rating.toFixed(1)} <span style={{ fontSize: "12px", fontWeight: 500 }}>/5</span>
                              </p>
                            </div>
                          </div>
                       </div>
                     )}
                     {viewingDoctor.totalAppointments && (
                       <div style={{ 
                         background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.1))", 
                         border: "1px solid rgba(139,92,246,0.2)", 
                         borderRadius: "12px", 
                         padding: "16px"
                       }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ 
                              width: "40px", 
                              height: "40px", 
                              borderRadius: "50%", 
                              background: "rgba(139,92,246,0.2)", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center"
                            }}>
                              <svg width="20" height="20" fill="#8b5cf6" viewBox="0 0 24 24">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                              </svg>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Appointments</p>
                              <p style={{ margin: 0, fontSize: "18px", color: "#8b5cf6", fontWeight: 700 }}>
                                {viewingDoctor.totalAppointments}
                              </p>
                            </div>
                          </div>
                       </div>
                     )}
                  </div>
                </div>

                {/* Right Column - Details & Availability */}
                <div>
                  {/* About Section */}
                  {viewingDoctor.about && (
                    <div style={{ marginBottom: "24px" }}>
                      <h4 style={{ 
                        margin: "0 0 12px", 
                        fontSize: "14px", 
                        fontWeight: 700, 
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <svg width="16" height="16" fill="#06b6d4" viewBox="0 0 24 24">
                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        About
                      </h4>
                      <div style={{ 
                        background: "rgba(255,255,255,0.03)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "12px", 
                        padding: "16px"
                      }}>
                        <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0", lineHeight: 1.6 }}>
                          {viewingDoctor.about}
                        </p>
                      </div>
                    </div>
                  )}

              
                  
                  {/* Languages */}
                  {viewingDoctor.languages && viewingDoctor.languages.length > 0 && (
                    <div style={{ marginBottom: "24px" }}>
                      <h4 style={{ 
                        margin: "0 0 12px", 
                        fontSize: "14px", 
                        fontWeight: 700, 
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <svg width="16" height="16" fill="#06b6d4" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM3 14a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm1-4a1 1 0 100 2h1a1 1 0 100-2H4zm0-4a1 1 0 100 2h1a1 1 0 100-2H4zm7 8a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1-4a1 1 0 100 2h1a1 1 0 100-2h-1zm0-4a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
                        </svg>
                        Languages
                      </h4>
                      <div style={{ 
                        background: "rgba(255,255,255,0.03)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "12px", 
                        padding: "16px"
                      }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {viewingDoctor.languages.map((language: string, index: number) => (
                            <span key={index} style={{
                              padding: "6px 12px",
                              background: "rgba(6,182,212,0.1)",
                              color: "#06b6d4",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "20px",
                              border: "1px solid rgba(6,182,212,0.2)"
                            }}>
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

              {/* Professional Information */}
                  <div style={{ display: "grid", gap: "12px" }}>
                     <div style={{ 
                       background: "rgba(255,255,255,0.03)", 
                       border: "1px solid rgba(255,255,255,0.08)", 
                       borderRadius: "12px", 
                       padding: "16px",
                       display: "flex",
                       alignItems: "flex-start",
                       gap: "12px"
                     }}>
                       <div style={{
                         width: "32px",
                         height: "32px",
                         borderRadius: "8px",
                         background: "rgba(6,182,212,0.1)",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         flexShrink: 0
                       }}>
                         <svg width="16" height="16" fill="#06b6d4" viewBox="0 0 24 24">
                           <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                         </svg>
                       </div>
                       <div style={{ flex: 1 }}>
                         <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hospital/Clinic</p>
                         <p style={{ margin: 0, fontSize: "14px", color: "#fff", lineHeight: 1.5 }}>
                           {viewingDoctor.hospitalOrClinic}
                         </p>
                       </div>
                     </div>
                     
                     <div style={{ 
                       background: "rgba(255,255,255,0.03)", 
                       border: "1px solid rgba(255,255,255,0.08)", 
                       borderRadius: "12px", 
                       padding: "16px",
                       display: "flex",
                       alignItems: "flex-start",
                       gap: "12px"
                     }}>
                       <div style={{
                         width: "32px",
                         height: "32px",
                         borderRadius: "8px",
                         background: "rgba(168,85,247,0.1)",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         flexShrink: 0
                       }}>
                         <svg width="16" height="16" fill="#a855f7" viewBox="0 0 24 24">
                           <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                           <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                         </svg>
                       </div>
                       <div style={{ flex: 1 }}>
                         <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Qualification</p>
                         <p style={{ margin: 0, fontSize: "14px", color: "#fff", lineHeight: 1.5 }}>
                           {viewingDoctor.qualification}
                         </p>
                       </div>
                     </div>
                     
                     <div style={{ 
                       background: "rgba(255,255,255,0.03)", 
                       border: "1px solid rgba(255,255,255,0.08)", 
                       borderRadius: "12px", 
                       padding: "16px",
                       display: "flex",
                       alignItems: "flex-start",
                       gap: "12px"
                     }}>
                       <div style={{
                         width: "32px",
                         height: "32px",
                         borderRadius: "8px",
                         background: "rgba(34,197,94,0.1)",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         flexShrink: 0
                       }}>
                         <svg width="16" height="16" fill="#22c55e" viewBox="0 0 24 24">
                           <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                         </svg>
                       </div>
                       <div style={{ flex: 1 }}>
                         <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Consultation Mode</p>
                         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                           <span style={{
                             padding: "4px 8px",
                             background: viewingDoctor.consultationMode === 'ONLINE' ? "rgba(34,197,94,0.2)" : "rgba(6,182,212,0.2)",
                             color: viewingDoctor.consultationMode === 'ONLINE' ? "#22c55e" : "#06b6d4",
                             fontSize: "12px",
                             fontWeight: 600,
                             borderRadius: "6px",
                             textTransform: "uppercase"
                           }}>
                             {viewingDoctor.consultationMode}
                           </span>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                gap: "12px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
               <button 
                 onClick={() => { setShowDoctorDetailsModal(false); setViewingDoctor(null); }} 
                 style={{
                   flex: 1,
                   padding: "12px 16px",
                   borderRadius: "12px",
                   border: "1px solid rgba(255,255,255,0.2)",
                   background: "rgba(255,255,255,0.05)",
                   color: "#94a3b8",
                   fontWeight: 600,
                   fontSize: "14px",
                   cursor: "pointer",
                   transition: "all 0.2s ease",
                 }}
               >
                 Close
               </button>
               <button 
                 onClick={() => { 
                   setShowDoctorDetailsModal(false); 
                   setViewingDoctor(null);
                   handleDoctorSelect(viewingDoctor);
                 }} 
                 style={{
                   flex: 1,
                   padding: "12px 16px",
                   borderRadius: "12px",
                   border: "none",
                   background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                   color: "#fff",
                   fontWeight: 600,
                   fontSize: "14px",
                   cursor: "pointer",
                   boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
                   transition: "all 0.2s ease",
                 }}
               >
                 Reserve Appointment
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Booking Modal / Payment Prompt */}
      {successBooking && (
        <div 
          onClick={() => { setSuccessBooking(null); setSelectedDoctor(null); setActiveTab('my-appointments'); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "slideUp 0.25s ease",
            }}
          >
            <div style={{ padding: "30px", textAlign: "center" }}>
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Successful!</h3>
              <p className="text-slate-500 mb-6 text-sm">Your appointment with Dr. {successBooking.doctorName} has been scheduled. Would you like to pay the consultation fee (LKR {successBooking.amount}) now?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSuccessBooking(null); setSelectedDoctor(null); setActiveTab('my-appointments'); }} 
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  Pay Later
                </button>
                <Link
                  href={`/patient/payment/${successBooking.id}?amount=${successBooking.amount}`}
                  className="flex-1 rounded-xl font-bold text-white flex items-center justify-center transition"
                  style={{
                    background: "linear-gradient(135deg,#06b6d4,#0891b2)",
                    boxShadow: "0 4px 14px rgba(6,182,212,0.4)",
                  }}
                  onClick={() => { setSuccessBooking(null); setSelectedDoctor(null); }}
                >
                  Proceed & Pay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
