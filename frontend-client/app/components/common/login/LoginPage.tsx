"use client";

import { loginAdmin } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("admin@example.com");
	const [password, setPassword] = useState("Admin123!");
	const [loading, setLoading] = useState(false);
	const [notice, setNotice] = useState("");

	async function onLogin() {
		setLoading(true);
		setNotice("");

		try {
			const response = await loginAdmin({ email, password });
			localStorage.setItem("smart_admin_token", response.token);
			localStorage.setItem("smart_admin_role", response.role);
			localStorage.setItem("smart_admin_email", email);
			router.push("/");
			router.refresh();
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="fixed inset-0 z-50 flex overflow-auto bg-white">
			<section className="flex min-h-full w-full md:flex-row flex-col overflow-hidden">
				{/* Image Section */}
				<aside className="relative hidden w-1/2 md:block">
					<div 
						className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
						style={{ backgroundImage: "url('/auth-bg.png')" }}
					/>
					<div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-cyan-800/20" />
					<div className="absolute inset-x-0 bottom-0 p-12 text-white">
						<div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
							SMART HEALTHCARE PLATFORM
						</div>
						<h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
							Advanced Care <br /> through Digital <br /> Excellence
						</h1>
						<p className="mt-6 max-w-md text-lg text-blue-50/90 leading-relaxed">
							Secure access to clinical operations and patient management for healthcare administrators.
						</p>
					</div>
				</aside>

				{/* Form Section */}
				<section className="flex flex-1 flex-col justify-center p-8 md:p-16 lg:px-24">
					<div className="mx-auto w-full max-w-md">
						<header className="mb-10 text-center md:text-left">
							<div className="mb-3 flex justify-center md:justify-start">
								<span className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">
									S
								</span>
							</div>
							<h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
							<p className="mt-2 text-slate-500">Welcome back! Please enter your details.</p>
						</header>

						<div className="space-y-6">
							<div>
								<label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="admin@smarthealth.com"
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none"
								/>
							</div>

							<div>
								<div className="mb-2 flex items-center justify-between">
									<label className="text-sm font-semibold text-slate-700">Password</label>
									<button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
										Forgot password?
									</button>
								</div>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none"
								/>
							</div>
						</div>

						{notice && (
							<div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
								<svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
								<p>{notice}</p>
							</div>
						)}

						<button
							onClick={onLogin}
							disabled={loading}
							className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									Signing in...
								</span>
							) : "Sign in to Dashboard"}
						</button>

						<footer className="mt-8 text-center">
							<p className="text-slate-500">
								Don&apos;t have an account?{" "}
								<Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
									Create Account
								</Link>
							</p>
						</footer>
					</div>
				</section>
			</section>
		</main>
	);
}
