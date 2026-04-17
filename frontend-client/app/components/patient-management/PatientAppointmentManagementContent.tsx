"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePatientAppointments, ConsultationType, AppointmentStatus } from "@/app/hooks/usePatientAppointments";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";

export function PatientAppointmentManagementContent() {
  const { appointments, patient, doctors, loading, error, createAppointment, rescheduleAppointment, deleteAppointment } = usePatientAppointments();
  const [activeTab, setActiveTab] = useState<'my-appointments' | 'book-appointment'>('my-appointments');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Search and filter states
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  const [createForm, setCreateForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "PHYSICAL" as ConsultationType,
    reason: "",
  });

  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
  });

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const doctor = doctors.find(d => d.id === appt.doctorId);
      const matchesSearch = !appointmentSearch || 
        doctor?.fullName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        appt.appointmentDate.includes(appointmentSearch) ||
        appt.consultationType.toLowerCase().includes(appointmentSearch.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, doctors, appointmentSearch, statusFilter]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = !doctorSearch || 
        doctor.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(doctorSearch.toLowerCase());
      
      const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, doctorSearch, specialtyFilter]);

  const handleCreate = async () => {
    if (!patient) return;
    await createAppointment({ ...createForm, patientId: patient.id });
    setShowBookModal(false);
    setSelectedDoctor(null);
    setCreateForm({ doctorId: "", appointmentDate: "", appointmentTime: "", consultationType: "PHYSICAL", reason: "" });
  };

  const handleReschedule = async () => {
    if (!editingId) return;
    await rescheduleAppointment(editingId, editForm);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAppointment(deleteId);
    setDeleteId(null);
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
      <div className="flex min-h-screen flex-col bg-[#0a0f1c]">
        <PatientNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4fd1c5] border-t-transparent"></div>
            <p className="text-slate-400 font-medium animate-pulse">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-[#4fd1c5]/30 pb-12">
      <PatientNavbar />
      
      <main className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Appointment Management</h1>
            <p className="text-slate-400 mt-1">Schedule consultations and track your health journey</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'my-appointments' 
                ? 'bg-[#4fd1c5] text-[#0a0f1c] shadow-lg shadow-[#4fd1c5]/20' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('book-appointment')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'book-appointment' 
                ? 'bg-[#4fd1c5] text-[#0a0f1c] shadow-lg shadow-[#4fd1c5]/20' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              Book New
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 backdrop-blur-md">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* --- My Appointments Tab --- */}
        {activeTab === 'my-appointments' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by specialty, doctor or date..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4fd1c5]/50 transition-all backdrop-blur-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#4fd1c5]/50 transition-all backdrop-blur-sm min-w-[160px]"
              >
                <option value="all" className="bg-[#0a0f1c]">All Statuses</option>
                <option value="PENDING" className="bg-[#0a0f1c]">Pending</option>
                <option value="CONFIRMED" className="bg-[#0a0f1c]">Confirmed</option>
                <option value="CANCELLED" className="bg-[#0a0f1c]">Cancelled</option>
                <option value="COMPLETED" className="bg-[#0a0f1c]">Completed</option>
              </select>
            </div>

            {/* Appointments Grid/Table */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold">Appointment Info</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold">Doctor</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold">Mode</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold">Status</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAppointments.map((appt) => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <tr key={appt.id} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-white font-bold">{new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="text-xs text-slate-400 mt-0.5">{appt.appointmentTime.slice(0, 5)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4fd1c5]/20 to-blue-600/20 flex items-center justify-center text-[#4fd1c5] border border-[#4fd1c5]/20 font-bold text-xs">
                                {doctor?.fullName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-200 text-sm font-medium">{doctor?.fullName ?? "Unknown Doctor"}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">{doctor?.specialty}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                              appt.consultationType === 'ONLINE' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                            }`}>
                              {appt.consultationType}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setSelectedAppointment(appt)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition" title="View Details">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              {appt.status === "PENDING" && (
                                <>
                                  <button onClick={() => startEdit(appt)} className="p-2 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition" title="Reschedule">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </button>
                                  <button onClick={() => setDeleteId(appt.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition" title="Cancel">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </>
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
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-600 border border-white/5">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Appointments Found</h3>
                  <p className="text-slate-400 max-w-xs mb-6">You haven't scheduled any consultations yet or none match your filters.</p>
                  <button onClick={() => setActiveTab('book-appointment')} className="rounded-xl bg-[#4fd1c5] px-6 py-2.5 font-bold text-[#0a0f1c] shadow-lg shadow-[#4fd1c5]/20 hover:scale-105 active:scale-95 transition">Book Your First Appointment</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Book Appointment Tab --- */}
        {activeTab === 'book-appointment' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4fd1c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, specialty or clinic..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4fd1c5]/50 transition-all backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#4fd1c5]/50 transition-all backdrop-blur-sm flex-1"
                >
                  <option value="all" className="bg-[#0a0f1c]">All Specialties</option>
                  {[...new Set(doctors.map(d => d.specialty))].map(specialty => (
                    <option key={specialty} value={specialty} className="bg-[#0a0f1c]">{specialty}</option>
                  ))}
                </select>
                <div className="hidden lg:flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-xs font-bold text-[#4fd1c5]">
                   <span className="w-2 h-2 rounded-full bg-[#4fd1c5] animate-pulse"></span>
                   {filteredDoctors.length} Doctors Available
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg transition-all hover:scale-[1.02] hover:bg-white/10 duration-300">
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#4fd1c5]/10 to-blue-600/10 opacity-50 group-hover:opacity-80 transition-opacity rounded-t-3xl"></div>
                  
                  <div className="relative flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#4fd1c5] to-blue-600 flex items-center justify-center text-white text-2xl font-bold p-1 overflow-hidden shadow-xl ring-2 ring-white/10">
                      {doctor.profileImageUrl ? (
                        <img src={doctor.profileImageUrl} alt={doctor.fullName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        doctor.fullName.charAt(0)
                      )}
                    </div>
                    
                    <h3 className="mt-4 text-xl font-bold text-white tracking-tight">{doctor.fullName}</h3>
                    <p className="text-sm font-bold text-[#4fd1c5] uppercase tracking-widest mt-1">{doctor.specialty}</p>
                    
                    <div className="mt-6 w-full grid grid-cols-2 gap-4">
                       <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Exp.</p>
                          <p className="text-sm font-bold text-white">{doctor.experienceYears} Years</p>
                       </div>
                       <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Fee</p>
                          <p className="text-sm font-bold text-emerald-400">LKR {doctor.consultationFee}</p>
                       </div>
                    </div>

                    <div className="mt-4 w-full flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="text-xs text-slate-400 truncate">{doctor.hospitalOrClinic}</span>
                    </div>

                    <button
                      onClick={() => handleDoctorSelect(doctor)}
                      className="mt-6 w-full rounded-2xl bg-white/10 border border-white/10 py-3.5 text-sm font-bold text-white transition hover:bg-[#4fd1c5] hover:text-[#0a0f1c] hover:border-[#4fd1c5] active:scale-95 shadow-sm group/btn"
                    >
                      Reserve Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="py-24 text-center">
                 <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-600 border border-white/5 mb-6">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">No Specialists Found</h3>
                 <p className="text-slate-400 max-w-sm mx-auto">Try broadening your search criteria or selecting a different specialty filter.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- Modals --- */}
      
      {/* Booking Modal */}
      {showBookModal && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4fd1c5] to-blue-600"></div>
            
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Schedule Consultation</h2>
            
            <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4fd1c5] flex items-center justify-center text-[#0a0f1c] font-black">{selectedDoctor.fullName.charAt(0)}</div>
              <div>
                <p className="font-bold text-white">{selectedDoctor.fullName}</p>
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
                   onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Select Time</label>
                 <input
                   type="time"
                   value={createForm.appointmentTime}
                   onChange={(e) => setCreateForm({ ...createForm, appointmentTime: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Consultation Mode</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setCreateForm({ ...createForm, consultationType: 'PHYSICAL' })}
                      className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${createForm.consultationType === 'PHYSICAL' ? 'bg-[#4fd1c5] border-[#4fd1c5] text-[#0a0f1c]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                      Physical Visit
                    </button>
                    <button 
                      onClick={() => setCreateForm({ ...createForm, consultationType: 'ONLINE' })}
                      className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${createForm.consultationType === 'ONLINE' ? 'bg-[#4fd1c5] border-[#4fd1c5] text-[#0a0f1c]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                      Online Consult
                    </button>
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Reason for Visit</label>
                <textarea
                  placeholder="Tell the doctor briefly about your concern..."
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#4fd1c5]/50 outline-none transition resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setShowBookModal(false); setSelectedDoctor(null); }} 
                className="flex-1 px-4 py-3 border border-white/10 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Discard
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!createForm.appointmentDate || !createForm.appointmentTime}
                className="flex-1 bg-[#4fd1c5] text-[#0a0f1c] px-4 py-3 rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-[#4fd1c5]/20 hover:scale-[1.02] active:scale-95 transition"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
           <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-xl font-bold text-white tracking-tight text-center w-full">Appointment Dossier</h2>
                 <button onClick={() => setSelectedAppointment(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fd1c5] to-blue-600 flex items-center justify-center text-white text-3xl font-black mb-2 shadow-xl border-4 border-[#0a0f1c]">
                     {doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName.charAt(0)}
                   </div>
                   <h3 className="text-lg font-bold text-white">{doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName}</h3>
                   <p className="text-xs font-bold text-[#4fd1c5] tracking-widest uppercase">{doctors.find(d => d.id === selectedAppointment.doctorId)?.specialty}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date & Time</p>
                      <p className="text-sm text-white font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{selectedAppointment.appointmentTime.slice(0, 5)}</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status & Mode</p>
                      <span className={`inline-block mb-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span>
                      <p className="text-xs text-slate-400 uppercase font-black tracking-tighter">{selectedAppointment.consultationType}</p>
                   </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Patient Concern</p>
                   <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedAppointment.reason || "No specific reason provided."}"</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button onClick={() => setSelectedAppointment(null)} className="flex-1 bg-white/10 text-white px-4 py-3 rounded-2xl font-bold hover:bg-white/20 transition">Close</button>
                 {selectedAppointment.status === "PENDING" && (
                   <button onClick={() => { setSelectedAppointment(null); setDeleteId(selectedAppointment.id); }} className="flex-1 bg-rose-500/20 text-rose-500 border border-rose-500/20 px-4 py-3 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition">Cancel</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
           <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-white mb-6">Modify Schedule</h2>
             <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Date</label>
                 <input
                   type="date"
                   value={editForm.appointmentDate}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Time</label>
                 <input
                   type="time"
                   value={editForm.appointmentTime}
                   onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#4fd1c5]/50 outline-none transition"
                 />
              </div>
             </div>
             <div className="flex gap-3 mt-8">
               <button onClick={() => setEditingId(null)} className="flex-1 px-4 py-3 border border-white/10 rounded-2xl font-bold text-slate-400 hover:text-white transition">Discard</button>
               <button onClick={handleReschedule} className="flex-1 bg-[#4fd1c5] text-[#0a0f1c] px-4 py-3 rounded-2xl font-bold shadow-lg shadow-[#4fd1c5]/20 hover:scale-[1.02] active:scale-95 transition">Apply Changes</button>
             </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Cancel Appointment?</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">This action will remove your reservation. You may not be able to reclaim this time slot later.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-3 border border-white/10 rounded-2xl font-bold text-slate-400 hover:text-white transition">Keep Appointment</button>
              <button onClick={handleDelete} className="flex-1 bg-rose-500 text-white px-4 py-3 rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition active:scale-95">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
