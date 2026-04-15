"use client";

import { approveDoctor, fetchPendingDoctors } from "@/lib/api";
import { DoctorApprovalItem } from "@/types/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("");
	const [pendingDoctors, setPendingDoctors] = useState<DoctorApprovalItem[]>([]);
	const [loadingPending, setLoadingPending] = useState(false);
	const [pendingNotice, setPendingNotice] = useState("");

	useEffect(() => {
		// Check authentication
		const token = localStorage.getItem("smart_admin_token");
		const userRole = localStorage.getItem("smart_admin_role");
		const userEmail = localStorage.getItem("smart_admin_email");

		if (!token || userRole !== "ADMIN") {
			router.push("/login");
			return;
		}

		setEmail(userEmail || "");
		setRole(userRole || "");
		void loadPendingDoctors(token);
	}, [router]);

	const loadPendingDoctors = async (token: string) => {
		setLoadingPending(true);
		setPendingNotice("");
		try {
			const items = await fetchPendingDoctors(token);
			setPendingDoctors(items);
		} catch (error) {
			setPendingNotice(error instanceof Error ? error.message : "Failed to load pending doctors");
		} finally {
			setLoadingPending(false);
		}
	};

	const onApproveDoctor = async (doctorId: number) => {
		const token = localStorage.getItem("smart_admin_token");
		if (!token) {
			router.push("/login");
			return;
		}

		setPendingNotice("");
		try {
			await approveDoctor(token, doctorId);
			setPendingNotice("Doctor approved successfully");
			await loadPendingDoctors(token);
		} catch (error) {
			setPendingNotice(error instanceof Error ? error.message : "Failed to approve doctor");
		}
	};

	const onLogout = () => {
		localStorage.removeItem("smart_admin_token");
		localStorage.removeItem("smart_admin_role");
		localStorage.removeItem("smart_admin_email");
		router.push("/login");
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
			<div className="border-b border-slate-200 bg-white shadow-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
							A
						</div>
						<div>
							<h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
							<p className="text-sm text-slate-500">{email}</p>
						</div>
					</div>
					<button
						onClick={onLogout}
						className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition-colors"
					>
						Logout
					</button>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{/* Stats Cards */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500 mb-1">Total Users</p>
								<p className="text-3xl font-bold text-slate-900">0</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
								👥
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500 mb-1">Doctors</p>
								<p className="text-3xl font-bold text-slate-900">0</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
								👨‍⚕️
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500 mb-1">Patients</p>
								<p className="text-3xl font-bold text-slate-900">0</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
								🏥
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500 mb-1">Appointments</p>
								<p className="text-3xl font-bold text-slate-900">0</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
								📅
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
					<h2 className="text-2xl font-bold text-slate-900 mb-6">System Administration</h2>
					<p className="text-slate-600 mb-4">
						You are logged in as <strong>{email}</strong> with role <strong>{role}</strong>
					</p>
					<p className="text-slate-600">
						Use the admin panel to manage users, monitor system health, configure settings, and generate reports.
					</p>
					
					<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
						<button className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
							Manage Users
						</button>
						<button className="rounded-xl bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors">
							Manage Doctors
						</button>
						<button className="rounded-xl bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition-colors">
							View Patients
						</button>
						<button className="rounded-xl bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition-colors">
							System Reports
						</button>
					</div>

					<div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-xl font-bold text-slate-900">Pending Doctor Approvals</h3>
							<span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
								{pendingDoctors.length}
							</span>
						</div>

						{loadingPending && <p className="text-sm text-slate-500">Loading pending approvals...</p>}
						{pendingNotice && <p className="mb-3 text-sm text-blue-700">{pendingNotice}</p>}

						{!loadingPending && pendingDoctors.length === 0 && (
							<p className="text-sm text-slate-500">No pending doctor registrations.</p>
						)}

						<div className="space-y-3">
							{pendingDoctors.map((doctor) => (
								<div
									key={doctor.id}
									className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
								>
									<div>
										<p className="font-semibold text-slate-900">
											{doctor.firstName} {doctor.lastName}
										</p>
										<p className="text-sm text-slate-600">{doctor.email}</p>
									</div>
									<button
										onClick={() => void onApproveDoctor(doctor.id)}
										className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
									>
										Approve
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
