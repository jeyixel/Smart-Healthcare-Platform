"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePatientAppointments, ConsultationType, AppointmentStatus } from "@/app/hooks/usePatientAppointments";

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
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "CONFIRMED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
      case "COMPLETED": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-700">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointment Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Schedule consultations and track your health journey</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'my-appointments' 
                ? 'bg-[#06b6d4] text-white shadow-lg shadow-[#06b6d4]/30' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('book-appointment')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'book-appointment' 
                ? 'bg-[#06b6d4] text-white shadow-lg shadow-[#06b6d4]/30' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Book New
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* --- My Appointments Tab --- */}
        {activeTab === 'my-appointments' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by specialty, doctor or date..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#06b6d4] focus:ring-4 focus:ring-[#06b6d4]/5 transition-all shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
                className="bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-700 outline-none focus:border-[#06b6d4] transition-all shadow-sm min-w-[180px] font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Appointments Grid/Table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Appointment Info</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Doctor</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Mode</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((appt) => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <tr key={appt.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-bold">{new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="text-xs text-slate-500 mt-0.5 font-medium">{appt.appointmentTime.slice(0, 5)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4] font-bold text-sm">
                                {doctor?.fullName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-900 text-sm font-bold">{doctor?.fullName ?? "Unknown Doctor"}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black">{doctor?.specialty}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                              appt.consultationType === 'ONLINE' ? 'text-indigo-600 border-indigo-100 bg-indigo-50' : 'text-emerald-600 border-emerald-100 bg-emerald-50'
                            }`}>
                              {appt.consultationType}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${statusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setSelectedAppointment(appt)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#06b6d4] transition" title="View Details">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              {appt.status === "PENDING" && (
                                <>
                                  <button onClick={() => startEdit(appt)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition" title="Reschedule">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </button>
                                  <button onClick={() => setDeleteId(appt.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition" title="Cancel">
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
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Found</h3>
                  <p className="text-slate-500 max-w-xs mb-6 font-medium">You haven't scheduled any consultations yet or none match your filters.</p>
                  <button onClick={() => setActiveTab('book-appointment')} className="rounded-xl bg-[#06b6d4] px-6 py-2.5 font-bold text-white shadow-lg shadow-[#06b6d4]/20 hover:scale-105 active:scale-95 transition">Book Your First Appointment</button>
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
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, specialty or clinic..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#06b6d4] focus:ring-4 focus:ring-[#06b6d4]/5 transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-700 outline-none focus:border-[#06b6d4] transition-all shadow-sm flex-1 font-bold"
                >
                  <option value="all">All Specialties</option>
                  {[...new Set(doctors.map(d => d.specialty))].map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold text-[#06b6d4]">
                   <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse"></span>
                   {filteredDoctors.length} Specialists Available
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:border-[#06b6d4]/30 duration-300">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#06b6d4]/5 to-blue-500/5 opacity-50 group-hover:opacity-80 transition-opacity rounded-t-3xl border-b border-slate-100"></div>
                  
                  <div className="relative flex flex-col items-center p-2">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#06b6d4] to-blue-600 flex items-center justify-center text-white text-3xl font-black p-0.5 overflow-hidden shadow-xl ring-4 ring-white">
                      {doctor.profileImageUrl ? (
                        <img src={doctor.profileImageUrl} alt={doctor.fullName} className="w-full h-full object-cover rounded-3xl" />
                      ) : (
                        doctor.fullName.charAt(0)
                      )}
                    </div>
                    
                    <h3 className="mt-6 text-xl font-extrabold text-slate-900 tracking-tight">{doctor.fullName}</h3>
                    <p className="text-xs font-black text-[#06b6d4] uppercase tracking-widest mt-1.5">{doctor.specialty}</p>
                    
                    <div className="mt-8 w-full grid grid-cols-2 gap-3">
                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Experience</p>
                          <p className="text-sm font-black text-slate-900">{doctor.experienceYears}Y+</p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Fee</p>
                          <p className="text-sm font-black text-[#059669]">LKR {doctor.consultationFee}</p>
                       </div>
                    </div>

                    <div className="mt-4 w-full flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                        <svg className="w-4 h-4 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">{doctor.hospitalOrClinic}</span>
                    </div>

                    <button
                      onClick={() => handleDoctorSelect(doctor)}
                      className="mt-6 w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/30 active:scale-95 shadow-sm group/btn"
                    >
                      Reserve Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="py-24 text-center">
                 <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100 mb-6 shadow-inner">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Specialists Found</h3>
                 <p className="text-slate-500 max-w-sm mx-auto font-medium">Try broadening your search criteria or selecting a different specialty filter.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Modals (Modernized for Light Mode) --- */}
      
      {/* Booking Modal */}
      {showBookModal && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#06b6d4] to-blue-600"></div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Schedule Consultation</h2>
            
            <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#06b6d4] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#06b6d4]/20">{selectedDoctor.fullName.charAt(0)}</div>
              <div>
                <p className="font-extrabold text-slate-900 text-lg leading-none">{selectedDoctor.fullName}</p>
                <p className="text-[10px] font-black text-[#06b6d4] uppercase tracking-widest mt-1.5">{selectedDoctor.specialty}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Date</label>
                 <input
                   type="date"
                   value={createForm.appointmentDate}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 font-bold focus:border-[#06b6d4] outline-none transition shadow-sm"
                 />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Time</label>
                 <input
                   type="time"
                   value={createForm.appointmentTime}
                   onChange={(e) => setCreateForm({ ...createForm, appointmentTime: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 font-bold focus:border-[#06b6d4] outline-none transition shadow-sm"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Consultation Mode</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setCreateForm({ ...createForm, consultationType: 'PHYSICAL' })}
                      className={`py-3.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${createForm.consultationType === 'PHYSICAL' ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg shadow-[#06b6d4]/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                    >
                      Physical Visit
                    </button>
                    <button 
                      onClick={() => setCreateForm({ ...createForm, consultationType: 'ONLINE' })}
                      className={`py-3.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${createForm.consultationType === 'ONLINE' ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg shadow-[#06b6d4]/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                    >
                      Online Consult
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason for Visit</label>
                <textarea
                  placeholder="Tell the doctor briefly about your concern..."
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 font-medium focus:border-[#06b6d4] outline-none transition resize-none shadow-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => { setShowBookModal(false); setSelectedDoctor(null); }} 
                className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                Discard
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!createForm.appointmentDate || !createForm.appointmentTime}
                className="flex-1 bg-[#06b6d4] text-white px-4 py-4 rounded-2xl font-extrabold shadow-xl shadow-[#06b6d4]/30 hover:scale-[1.03] active:scale-95 transition disabled:opacity-50"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
           <div className="bg-white border border-slate-200 rounded-3xl p-10 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-8 text-center w-full">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight w-full">Consultation Dossier</h2>
                 <button onClick={() => setSelectedAppointment(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center">
                   <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#06b6d4] to-blue-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl ring-4 ring-white">
                     {doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName.charAt(0)}
                   </div>
                   <h3 className="text-xl font-extrabold text-slate-900">{doctors.find(d => d.id === selectedAppointment.doctorId)?.fullName}</h3>
                   <p className="text-[10px] font-black text-[#06b6d4] tracking-widest uppercase mt-1">{doctors.find(d => d.id === selectedAppointment.doctorId)?.specialty}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule</p>
                      <p className="text-sm text-slate-900 font-extrabold">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 font-bold mt-1">{selectedAppointment.appointmentTime.slice(0, 5)}</p>
                   </div>
                   <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Metadata</p>
                      <span className={`inline-block mb-2 px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${statusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">{selectedAppointment.consultationType}</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Context</p>
                   <p className="text-sm text-slate-700 leading-relaxed font-semibold italic">"{selectedAppointment.reason || "No specific reason provided."}"</p>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                 <button onClick={() => setSelectedAppointment(null)} className="flex-1 bg-slate-100 text-slate-700 px-4 py-4 rounded-2xl font-extrabold hover:bg-slate-200 transition">Close Dossier</button>
                 {selectedAppointment.status === "PENDING" && (
                   <button onClick={() => { setSelectedAppointment(null); setDeleteId(selectedAppointment.id); }} className="flex-1 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-4 rounded-2xl font-extrabold hover:bg-rose-500 hover:text-white transition">Cancel Appt</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
           <div className="bg-white border border-slate-200 rounded-3xl p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Modify Schedule</h2>
             <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Date</label>
                 <input
                   type="date"
                   value={editForm.appointmentDate}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 font-bold focus:border-[#06b6d4] outline-none transition"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Time</label>
                 <input
                   type="time"
                   value={editForm.appointmentTime}
                   onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 font-bold focus:border-[#06b6d4] outline-none transition"
                 />
              </div>
             </div>
             <div className="flex gap-4 mt-10">
               <button onClick={() => setEditingId(null)} className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition font-extrabold">Discard</button>
               <button onClick={handleReschedule} className="flex-1 bg-[#06b6d4] text-white px-4 py-4 rounded-2xl font-extrabold shadow-xl shadow-[#06b6d4]/30 hover:scale-[1.02] active:scale-95 transition">Apply New Plan</button>
             </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-100 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Cancel Reservation?</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">This action will remove your confirmed slot. Re-booking this exact time later may not be possible.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="w-full bg-rose-500 text-white px-4 py-4 rounded-2xl font-extrabold hover:bg-rose-600 shadow-xl shadow-rose-500/30 transition active:scale-95">Yes, Cancel Appointment</button>
              <button onClick={() => setDeleteId(null)} className="w-full px-4 py-4 border border-slate-200 rounded-2xl font-extrabold text-slate-500 hover:text-slate-900 transition">Keep Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
