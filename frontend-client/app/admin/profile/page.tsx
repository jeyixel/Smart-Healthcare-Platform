"use client";

import { fetchCurrentUser } from "@/lib/api";
import { CurrentUserProfile } from "@/types/api";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCurrentUser(token);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-bold">Error loading profile</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Operator Profile</h1>
        <p className="text-slate-500">Manage your administrative identity and security settings.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <section className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            <div className="relative px-6 pb-6 text-center">
              <div className="mx-auto -mt-12 mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-3xl font-bold text-indigo-600 shadow-sm">
                {profile?.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.email?.split('@')[0].toUpperCase()}</h2>
              <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                {profile?.role}
              </span>
              
              <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Account Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">MFA Status</span>
                  <span className="font-bold text-slate-400 italic">Unconfigured</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Form Placeholder */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Credential Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="font-medium text-slate-900">{profile?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</p>
                <p className="font-medium text-slate-900">{profile?.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Tier</p>
                <p className="font-medium text-slate-900">Super Administrator</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Date</p>
                <p className="font-medium text-slate-900">2026-01-15</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Console Security</h3>
            <p className="mb-6 text-sm text-slate-500">Your account is currently protected by standard JWT bearer token authentication.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Change Password
              </button>
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                Setup 2FA
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
