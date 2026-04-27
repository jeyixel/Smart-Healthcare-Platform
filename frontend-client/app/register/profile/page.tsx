"use client";

import { createDoctorProfile, createPatientProfile } from "@/lib/api";
import { CreateDoctorRequest, PatientUpsertRequest } from "@/types/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function ProfileBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "PATIENT";
  
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "success">("error");

  // Auth/Token Data
  const [tokenData, setTokenData] = useState<any>(null);

  // Doctor Form State
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hospitalOrClinic, setHospitalOrClinic] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [consultationMode, setConsultationMode] = useState<"PHYSICAL" | "VIRTUAL" | "BOTH">("BOTH");
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  // Patient Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = decodeJwt(token);
    if (decoded) {
      setTokenData({
        token,
        userId: decoded.userId,
        email: decoded.sub,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      });
    }
  }, [router]);

  async function handleDoctorSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      if (!tokenData) throw new Error("Authentication error. Please login again.");

      const payload: CreateDoctorRequest = {
        userId: Number(tokenData.userId),
        fullName: `${tokenData.firstName} ${tokenData.lastName}`.trim(),
        email: tokenData.email,
        phone: phoneNumber || "0000000000", // Fallback if missing
        specialty,
        category,
        qualification,
        experienceYears: Number(experienceYears),
        hospitalOrClinic,
        consultationFee: Number(consultationFee),
        consultationMode,
        bio,
        profileImageUrl,
        licenseNumber,
      };

      await createDoctorProfile(tokenData.token, payload);
      
      // Cleanup for doctor
      localStorage.removeItem("smart_admin_token");
      localStorage.removeItem("smart_admin_role");
      localStorage.removeItem("smart_admin_email");

      setNoticeType("success");
      setNotice("Doctor profile submitted successfully! Awaiting admin verification. Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      setNoticeType("error");
      setNotice(error instanceof Error ? error.message : "Failed to create profile");
      setLoading(false);
    }
  }

  async function handlePatientSubmit(e: React.FormEvent, isSkip = false) {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      if (!tokenData) throw new Error("Authentication error. Please login again.");

      // If they skip, we still need to send a minimal payload
      const payload: PatientUpsertRequest = {
        firstName: tokenData.firstName || "Unknown",
        lastName: tokenData.lastName || "Unknown",
        email: tokenData.email,
        authUserId: String(tokenData.userId),
        phoneNumber: phoneNumber || "0000000000",
        dateOfBirth: isSkip ? undefined : dateOfBirth,
        gender: isSkip ? undefined : gender,
        bloodGroup: isSkip ? undefined : bloodGroup,
        address: isSkip ? undefined : address,
        emergencyContactName: isSkip ? undefined : emergencyContactName,
        emergencyContactPhone: isSkip ? undefined : emergencyContactPhone,
      };

      await createPatientProfile(tokenData.token, payload);
      
      setNoticeType("success");
      setNotice("Profile setup complete! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setNoticeType("error");
      setNotice(error instanceof Error ? error.message : "Failed to create profile");
      setLoading(false);
    }
  }

  if (!tokenData) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="fixed inset-0 z-50 flex overflow-auto bg-white">
      <section className="flex min-h-full w-full flex-col overflow-hidden md:flex-row">
        <aside className="relative hidden w-1/3 md:block">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: "url('/auth-bg.png')" }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-blue-900/60 to-cyan-800/40" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight">
              {role === "DOCTOR" ? "Complete Your Profile" : "Personalize Your Care"}
            </h1>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-blue-50/90">
              {role === "DOCTOR" 
                ? "Provide your professional details to get verified by an administrator."
                : "Add your personal and medical information for a more tailored healthcare experience."}
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col overflow-y-auto p-8 md:p-12 lg:px-20">
          <div className="mx-auto w-full max-w-2xl">
            <header className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900">
                {role === "DOCTOR" ? "Doctor Registration" : "Patient Profile"}
              </h2>
              <p className="mt-2 text-slate-500">
                {role === "DOCTOR" ? "Please fill in all the required professional details." : "You can fill these out now or skip for later."}
              </p>
            </header>

            {notice && (
              <div
                className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
                  noticeType === "success"
                    ? "border-green-100 bg-green-50 text-green-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                <p>{notice}</p>
              </div>
            )}

            {role === "DOCTOR" ? (
              <form onSubmit={handleDoctorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Specialty *</label>
                    <input required type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Category *</label>
                    <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Specialist" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Qualification *</label>
                    <input required type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. MBBS, MD" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Experience (Years) *</label>
                    <input required type="number" min="0" max="80" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 10" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Hospital / Clinic *</label>
                    <input required type="text" value={hospitalOrClinic} onChange={(e) => setHospitalOrClinic(e.target.value)} placeholder="e.g. City General" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">License Number *</label>
                    <input required type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. MED-12345" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Consultation Fee *</label>
                    <input required type="number" min="0" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="e.g. 50.00" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Consultation Mode *</label>
                    <select value={consultationMode} onChange={(e) => setConsultationMode(e.target.value as any)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                      <option value="BOTH">Both</option>
                      <option value="PHYSICAL">Physical</option>
                      <option value="VIRTUAL">Virtual</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number *</label>
                    <input required type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +1 234 567 890" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Profile Image URL (Optional)</label>
                    <input type="text" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Short Bio</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself..." className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">
                    {loading ? "Submitting..." : "Complete Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => handlePatientSubmit(e, false)} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number *</label>
                    <input required type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +1 234 567 890" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Blood Group</label>
                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Home Address</label>
                    <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div className="sm:col-span-2 mt-4 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Emergency Contact (Optional)</h3>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Contact Name</label>
                    <input type="text" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} placeholder="Name" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Contact Phone</label>
                    <input type="text" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} placeholder="Phone" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-3">
                  <button type="submit" disabled={loading} className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                  <button type="button" onClick={(e) => handlePatientSubmit(e, true)} disabled={loading} className="w-full rounded-2xl bg-slate-100 py-4 text-lg font-bold text-slate-600 transition-all hover:bg-slate-200 active:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70">
                    Skip for now
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ProfileBuilder />
    </Suspense>
  );
}
