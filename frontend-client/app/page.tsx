"use client";

import { EventFeed } from "@/app/components/patient-management/EventFeed";
import { PatientTable } from "@/app/components/patient-management/PatientTable";
import {
  fetchPatientEvents,
  fetchPatients,
  updatePatientStatus,
} from "@/lib/api";
import Link from "next/link";
import { Patient, PatientEvent } from "@/types/api";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [events, setEvents] = useState<PatientEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [adminEmail, setAdminEmail] = useState<string>("admin@example.com");
  const [token, setToken] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  const canMutate = useMemo(() => Boolean(token), [token]);

  async function refreshAll() {
    setLoading(true);
    setNotice("");
    try {
      const [patientsResponse, eventsResponse] = await Promise.all([
        fetchPatients(),
        fetchPatientEvents(),
      ]);
      setPatients(patientsResponse);
      setEvents(eventsResponse);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("smart_admin_token");
    const savedRole = localStorage.getItem("smart_admin_role");
    const savedEmail = localStorage.getItem("smart_admin_email");

    if (savedToken) {
      setToken(savedToken);
    }

    // Redirect to appropriate dashboard based on role
    if (savedRole === "DOCTOR") {
      window.location.href = "/doctor";
      return;
    }
    if (savedRole === "PATIENT") {
      window.location.href = "/patient";
      return;
    }
    if (savedRole === "ADMIN") {
      window.location.href = "/admin";
      return;
    }

    if (savedRole) {
      setAuthRole(savedRole);
    }

    if (savedEmail) {
      setAdminEmail(savedEmail);
    }

    refreshAll();
  }, []);

  function logout() {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    setToken(null);
    setAuthRole(null);
    setNotice("Signed out.");
  }

  async function onToggleStatus(patient: Patient, active: boolean) {
    if (!token) {
      setNotice("Login first to perform admin actions.");
      return;
    }

    setLoading(true);
    setNotice("");
    try {
      await updatePatientStatus(token, patient.id, active, adminEmail);
      await refreshAll();
      setNotice(`Patient ${patient.firstName} status updated to ${active ? "ACTIVE" : "INACTIVE"}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Status update failed");
      setLoading(false);
    }
  }

  return (
    <main className="console-page">
      <section className="hero hero-split">
        <div className="hero-copy">
          <div className="hero-badge">Smart Healthcare Platform</div>
          <h1>Modern healthcare access for everyone</h1>
          <p>
            Sign in to your account to manage your health records, appointments, 
            and clinical operations.
          </p>

          <div className="hero-highlights" aria-label="Platform highlights">
            <span>Secure JWT login</span>
            <span>Patient management</span>
            <span>Live event visibility</span>
          </div>
        </div>

        <div className="hero-metrics" aria-label="Service status">
          <div className="metric-card">
            <span>Admin API</span>
            <strong>Online</strong>
            <small>Port 8087</small>
          </div>
          <div className="metric-card">
            <span>Patient API</span>
            <strong>Online</strong>
            <small>Port 8081</small>
          </div>
          <div className="metric-card metric-card-accent">
            <span>Session</span>
            <strong>{token ? "Authenticated" : "Ready to login"}</strong>
            <small>{authRole ?? "USER access"}</small>
          </div>
        </div>
      </section>

      {!token ? (
        <section className="panel auth-gate">
          <p className="eyebrow">Authentication required</p>
          <h2>Sign in to continue</h2>
          <p className="panel-subtitle">
            Access control is now handled on dedicated pages for a cleaner workflow.
          </p>
          <div className="actions-row">
            <Link className="btn" href="/login">Go to login</Link>
            <Link className="btn btn-ghost" href="/register">Go to register</Link>
          </div>
        </section>
      ) : (
        <section className="panel auth-gate">
          <p className="eyebrow">Authenticated session</p>
          <h2>Signed in as {adminEmail}</h2>
          <p className="panel-subtitle">Role: {authRole ?? "ADMIN"}</p>
          <div className="actions-row">
            <button type="button" className="btn btn-ghost" onClick={logout}>Sign out</button>
          </div>
        </section>
      )}

      {notice && <p className="notice">{notice}</p>}

      <div className="content-grid">
        <PatientTable
          patients={patients}
          loading={loading}
          canMutate={canMutate}
          onRefresh={refreshAll}
          onToggleStatus={onToggleStatus}
        />
        <EventFeed events={events} loading={loading} onRefresh={refreshAll} />
      </div>
    </main>
  );
}
