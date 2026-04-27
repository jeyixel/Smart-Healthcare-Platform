"use client";

import { 
  approveDoctor, 
  fetchPendingDoctors, 
  fetchActiveDoctors, 
  fetchDoctorByUserId, 
  verifyDoctor, 
  terminateDoctorAccount, 
  deleteDoctorProfile 
} from "@/lib/api";
import { DoctorApprovalItem, DoctorResponse, DoctorSearchResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DoctorsManagementPage() {
  const router = useRouter();
  const [pendingDoctors, setPendingDoctors] = useState<DoctorApprovalItem[]>([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState<DoctorSearchResponse[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingVerified, setLoadingVerified] = useState(false);
  const [pendingNotice, setPendingNotice] = useState("");
  
  // Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorApprovalItem | null>(null);
  const [viewingVerifiedDoctor, setViewingVerifiedDoctor] = useState<DoctorSearchResponse | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    if (token) {
      loadPendingDoctors(token);
      loadVerifiedDoctors(token);
    }
  }, []);

  const loadPendingDoctors = async (token: string) => {
    setLoadingPending(true);
    try {
      const items = await fetchPendingDoctors(token);
      setPendingDoctors(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPending(false);
    }
  };

  const loadVerifiedDoctors = async (token: string) => {
    setLoadingVerified(true);
    try {
      const items = await fetchActiveDoctors(token);
      setVerifiedDoctors(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVerified(false);
    }
  };

  const handleReviewPending = async (doctor: DoctorApprovalItem) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    setSelectedDoctor(doctor);
    setViewingVerifiedDoctor(null);
    setLoadingProfile(true);
    setDoctorProfile(null);
    try {
      const profile = await fetchDoctorByUserId(token, doctor.id);
      setDoctorProfile(profile);
    } catch (error) {
      console.error("Failed to load doctor profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleViewVerified = async (doctor: DoctorSearchResponse) => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    setViewingVerifiedDoctor(doctor);
    setSelectedDoctor(null);
    setLoadingProfile(true);
    setDoctorProfile(null);
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/v1/doctors/${doctor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const profile = await response.json();
        setDoctorProfile(profile);
      }
    } catch (error) {
      console.error("Failed to load verified doctor profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const onApprove = async () => {
    if (!selectedDoctor) return;
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    setIsProcessing(true);
    setPendingNotice("");
    try {
      await approveDoctor(token, selectedDoctor.id);
      if (doctorProfile) {
        await verifyDoctor(token, doctorProfile.id, true);
      }
      setPendingNotice(`${selectedDoctor.firstName} approved.`);
      closeModal();
      await refreshLists(token);
    } catch (error) {
      setPendingNotice("Approval failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onRejectOrTerminate = async () => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to terminate this doctor? This will remove their profile and disable their account access permanently.")) {
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedDoctor) {
        // Rejecting a pending doctor
        await terminateDoctorAccount(token, selectedDoctor.id);
        if (doctorProfile) {
          await deleteDoctorProfile(token, doctorProfile.id);
        }
        setPendingNotice("Application rejected.");
      } else if (doctorProfile) {
        // Terminating a verified doctor
        await deleteDoctorProfile(token, doctorProfile.id);
        await terminateDoctorAccount(token, doctorProfile.userId);
        setPendingNotice("Doctor terminated successfully.");
      }
      closeModal();
      await refreshLists(token);
    } catch (error) {
      setPendingNotice("Termination failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshLists = async (token: string) => {
    await Promise.all([loadPendingDoctors(token), loadVerifiedDoctors(token)]);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setViewingVerifiedDoctor(null);
    setDoctorProfile(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Health Professionals</h1>
        <p className="text-slate-500">Manage and approve doctor credentials and system access.</p>
      </header>

      {/* Pending Approvals Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Pending Approvals</h2>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {pendingDoctors.length} Requests
          </span>
        </div>

        {loadingPending && <p className="animate-pulse text-sm text-slate-500">Updating registry...</p>}
        {pendingNotice && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-100 flex justify-between items-center">
            {pendingNotice}
            <button onClick={() => setPendingNotice("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {!loadingPending && pendingDoctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <p className="font-medium text-slate-900">All caught up!</p>
            <p className="text-sm text-slate-500">There are no pending doctor registrations at this time.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {doctor.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    {doctor.firstName} {doctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{doctor.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleReviewPending(doctor)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-indigo-200 flex items-center gap-2"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Doctors Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Verified Doctors</h2>
        <div className="overflow-hidden rounded-xl border border-slate-100">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 font-bold text-slate-600">
               <tr>
                 <th className="px-6 py-4">Name</th>
                 <th className="px-6 py-4">Specialty</th>
                 <th className="px-6 py-4">Hospital/Clinic</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {loadingVerified && (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading verified doctors...</td>
                 </tr>
               )}
               {!loadingVerified && verifiedDoctors.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No verified doctors found.</td>
                 </tr>
               )}
               {verifiedDoctors.map((doc) => (
                 <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         {doc.fullName.charAt(0)}
                       </div>
                       <span className="font-bold text-slate-900">{doc.fullName}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                       {doc.specialty}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-slate-600">{doc.hospitalOrClinic}</td>
                   <td className="px-6 py-4">
                     <span className="flex items-center gap-1.5 font-bold text-emerald-600 text-xs">
                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                       VERIFIED
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button 
                       onClick={() => handleViewVerified(doc)}
                       className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                     >
                       Full Details
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </section>

      {/* Doctor Detail Modal */}
      {(selectedDoctor || viewingVerifiedDoctor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className={`${selectedDoctor ? 'bg-indigo-600' : 'bg-slate-900'} px-8 py-6 text-white flex justify-between items-center shrink-0`}>
              <div>
                <h3 className="text-xl font-bold">{selectedDoctor ? 'Review Application' : 'Doctor Profile'}</h3>
                <p className="text-white/70 text-sm">{selectedDoctor ? 'Verify credentials before granting access.' : 'Viewing full registration details.'}</p>
              </div>
              <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
              {loadingProfile ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="font-medium animate-pulse text-lg">Fetching comprehensive profile data...</p>
                </div>
              ) : doctorProfile ? (
                <div className="space-y-8">
                  {/* Basic Info Header */}
                  <div className="flex items-start gap-6 pb-8 border-b border-slate-200">
                    <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-600 border-2 border-white shadow-xl shadow-indigo-100 flex-shrink-0">
                      {doctorProfile.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-3xl font-black text-slate-900 leading-tight">{doctorProfile.fullName}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${doctorProfile.verified ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                          {doctorProfile.verified ? 'Verified Expert' : 'Pending Verification'}
                        </span>
                      </div>
                      <p className="text-indigo-600 font-bold text-base uppercase tracking-wider mb-4">{doctorProfile.specialty} • {doctorProfile.category}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                          <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {doctorProfile.email}
                        </span>
                        <span className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                          <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {doctorProfile.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h5 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Professional Credentials</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">License Number</label>
                          <p className="font-bold text-slate-900 text-lg">{doctorProfile.licenseNumber}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Qualification</label>
                          <p className="font-bold text-slate-900">{doctorProfile.qualification}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Years of Practice</label>
                          <p className="font-bold text-slate-900">{doctorProfile.experienceYears} Years Experience</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Practice Details</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Hospital/Clinic</label>
                          <p className="font-bold text-slate-900">{doctorProfile.hospitalOrClinic}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                          <p className="font-bold text-slate-900 text-lg">LKR {doctorProfile.consultationFee.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Service Mode</label>
                          <p className="font-bold text-slate-900 uppercase">{doctorProfile.consultationMode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h5 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Professional Biography</h5>
                    <p className="text-slate-700 leading-relaxed italic text-sm border-l-4 border-slate-100 pl-4">
                      "{doctorProfile.bio || 'The doctor has not provided a professional biography yet.'}"
                    </p>
                  </div>

                  {/* Availability Section */}
                  <div className="space-y-4 pb-4">
                    <h5 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Weekly Availability</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {doctorProfile.availabilities && doctorProfile.availabilities.length > 0 ? (
                        doctorProfile.availabilities.map((slot) => (
                          <div key={slot.id} className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm hover:border-indigo-200 transition-colors">
                            <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">{slot.dayOfWeek}</p>
                            <p className="text-xs font-bold text-slate-900">{slot.startTime} - {slot.endTime}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-6 text-center bg-slate-100 rounded-2xl border border-dashed border-slate-300">
                          <p className="text-xs font-bold text-slate-400">No specific availability slots defined yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-4xl border border-amber-100 mb-2">📭</div>
                  <h4 className="text-2xl font-black text-slate-900">Profile Not Found</h4>
                  <p className="text-slate-500 max-w-sm text-sm">The user has registered their account but hasn't completed the professional profile setup in the doctor portal yet.</p>
                </div>
              )}
            </div>

            <div className="bg-white px-8 py-6 flex justify-between items-center border-t border-slate-200 shrink-0">
              <button
                onClick={onRejectOrTerminate}
                disabled={isProcessing}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100 flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {selectedDoctor ? 'Reject Application' : 'Terminate Doctor'}
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                  disabled={isProcessing}
                >
                  {selectedDoctor ? 'Back' : 'Close'}
                </button>
                {selectedDoctor && (
                  <button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="px-10 py-3 rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>Finalize & Approve</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
