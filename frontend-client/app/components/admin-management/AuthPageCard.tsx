"use client";

import { loginAdmin, registerAdmin } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AuthMode = "login" | "register";

interface AuthPageCardProps {
  mode: AuthMode;
}

export function AuthPageCard({ mode }: AuthPageCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isRegister = mode === "register";
  const title = useMemo(
    () => (isRegister ? "Create account" : "Welcome back"),
    [isRegister],
  );

  async function submit() {
    setLoading(true);
    setNotice("");

    try {
      const response = isRegister
        ? await registerAdmin({
            email,
            password,
            firstName,
            lastName,
            role: "PATIENT",
          })
        : await loginAdmin({ email, password });

      localStorage.setItem("smart_admin_token", response.token);
      localStorage.setItem("smart_admin_role", response.role);
      localStorage.setItem("smart_admin_email", email);

      router.push("/");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page-shell">
        <aside className="auth-page-left">
          <div className="hero-badge">Smart Healthcare Platform</div>
          <h1>{title}</h1>
          <p>
            {isRegister
              ? "Register your patient account and start using the platform."
              : "Login to manage patient statuses and monitor live clinical events."}
          </p>
          <div className="hero-highlights" aria-label="Capabilities">
            <span>JWT secured access</span>
            <span>Admin-managed patient states</span>
            <span>Realtime event console</span>
          </div>
        </aside>

        <section className="auth-page-card panel" aria-label="Authentication form">
          <p className="eyebrow">{isRegister ? "Register" : "Login"}</p>
          <h2>{isRegister ? "Account registration" : "Sign in"}</h2>

          <div className="grid-two">
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Create a password" : "Enter your password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="pr-12"
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
            </label>

            {isRegister ? (
              <>
                <label>
                  <span>First name</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  <span>Last name</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="actions-row auth-actions">
            <button className="btn" type="button" disabled={loading} onClick={submit}>
              {isRegister ? "Create account" : "Sign in"}
            </button>
            <Link className="btn btn-ghost" href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Have an account? Login" : "Need an account? Register"}
            </Link>
          </div>

          {notice ? <p className="notice">{notice}</p> : null}
        </section>
      </section>
    </main>
  );
}
