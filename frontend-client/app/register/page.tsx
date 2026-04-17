"use client";

import { registerAdmin } from "@/lib/api";
import { PublicRegisterRole } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<PublicRegisterRole>("PATIENT");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "success">("error");
  const [showPassword, setShowPassword] = useState(false);

  async function onRegister() {
    setLoading(true);
    setNotice("");
    setNoticeType("error");

    try {
      const response = await registerAdmin({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      if (role === "DOCTOR") {
        localStorage.removeItem("smart_admin_token");
        localStorage.removeItem("smart_admin_role");
        localStorage.removeItem("smart_admin_email");
        setNoticeType("success");
        setNotice("Doctor registration submitted! Awaiting admin verification. Redirecting to login...");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (response.token) {
        localStorage.setItem("smart_admin_token", response.token);
        localStorage.setItem("smart_admin_role", response.role);
        localStorage.setItem("smart_admin_email", email);
      }

      setNoticeType("success");
      setNotice("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setNoticeType("error");
      setNotice(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 z-50 flex overflow-auto bg-white">
      <section className="flex min-h-full w-full flex-col overflow-hidden md:flex-row">
        <aside className="relative hidden w-1/2 md:block">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: "url('/auth-bg.png')" }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-blue-900/40 to-cyan-800/20" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
              SMART HEALTHCARE PLATFORM
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Digital Access <br /> for Better <br /> Patient Care
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-blue-50/90">
              Create your account and continue with secure healthcare workflows.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col justify-center p-8 md:p-16 lg:px-24">
          <div className="mx-auto w-full max-w-md">
            <header className="mb-10 text-center md:text-left">
              <div className="mb-3 flex justify-center md:justify-start">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
                  S
                </span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="mt-2 text-slate-500">Register as a patient or doctor.</p>
            </header>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as PublicRegisterRole)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 pr-12 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
                        <path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a19.34 19.34 0 01-3.66 4.96" />
                        <path d="M6.61 6.61C3.9 8.51 2 12 2 12s3 7 10 7a10.97 10.97 0 005.39-1.39" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {notice && (
              <div
                className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
                  noticeType === "success"
                    ? "border-green-100 bg-green-50 text-green-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                <p>{notice}</p>
              </div>
            )}

            <button
              onClick={onRegister}
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-blue-600"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <footer className="mt-8 text-center">
              <p className="text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-blue-600 transition-colors hover:text-blue-800">
                  Sign In
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}
