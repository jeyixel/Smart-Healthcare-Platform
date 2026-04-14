"use client";

import { loginAdmin, registerAdmin } from "@/lib/api";
import { UserRole } from "@/types/api";
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

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [firstName, setFirstName] = useState("Smart");
  const [lastName, setLastName] = useState("Admin");

  const isRegister = mode === "register";
  const title = useMemo(
    () => (isRegister ? "Create admin account" : "Welcome back"),
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
            role: "ADMIN" as UserRole,
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
              ? "Register a secure admin identity to control patient operations."
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
          <h2>{isRegister ? "Admin registration" : "Admin sign in"}</h2>

          <div className="grid-two">
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.com"
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </label>

            {isRegister ? (
              <>
                <label>
                  <span>First name</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Admin"
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  <span>Last name</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="User"
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
