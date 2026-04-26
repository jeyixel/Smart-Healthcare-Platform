"use client";

import { loginAdmin, requestPasswordOtp, resetForgotPassword } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [notice, setNotice] = useState("");
	const [noticeType, setNoticeType] = useState<"error" | "info">("error");
	const [forgotOpen, setForgotOpen] = useState(false);
	const [otpEmail, setOtpEmail] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotNotice, setForgotNotice] = useState("");
	const [otpRequested, setOtpRequested] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	async function onLogin() {
		setLoading(true);
		setNotice("");
		setNoticeType("error");
		localStorage.removeItem("smart_admin_token");
		localStorage.removeItem("smart_admin_role");
		localStorage.removeItem("smart_admin_email");

		try {
			const response = await loginAdmin({ email, password });
			localStorage.setItem("smart_admin_token", response.token);
			localStorage.setItem("smart_admin_role", response.role);
			localStorage.setItem("smart_admin_email", email);
			const dashboardPath = response.role === "ADMIN" ? "/admin" : response.role === "DOCTOR" ? "/doctor" : "/patient/dashboard";
			router.push(dashboardPath);
			router.refresh();
		} catch (error) {
			localStorage.removeItem("smart_admin_token");
			localStorage.removeItem("smart_admin_role");
			localStorage.removeItem("smart_admin_email");
			const message = error instanceof Error ? error.message : "Login failed";
			if (message.toLowerCase().includes("pending admin approval")) {
				setNoticeType("info");
				setNotice("Your doctor account is waiting for admin verification. Please try again after approval.");
			} else {
				setNoticeType("error");
				setNotice(message);
			}
		} finally {
			setLoading(false);
		}
	}

	async function onRequestOtp() {
		setForgotLoading(true);
		setForgotNotice("");

		try {
			const result = await requestPasswordOtp({ email: otpEmail });
			setOtpRequested(true);
			setForgotNotice(result.message || "OTP sent to your email.");
		} catch (error) {
			setForgotNotice(error instanceof Error ? error.message : "Failed to send OTP");
		} finally {
			setForgotLoading(false);
		}
	}

	async function onResetPassword() {
		setForgotLoading(true);
		setForgotNotice("");

		try {
			const result = await resetForgotPassword({
				email: otpEmail,
				otp: otpCode,
				newPassword,
			});

			setForgotNotice(result.message || "Password reset successful.");
			setPassword(newPassword);
			setForgotOpen(false);
			setOtpRequested(false);
			setOtpCode("");
			setNewPassword("");
			setNotice("Password reset successful. Please login with your new password.");
		} catch (error) {
			setForgotNotice(error instanceof Error ? error.message : "Failed to reset password");
		} finally {
			setForgotLoading(false);
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
					<div className="absolute inset-0 bg-linear-to-br from-blue-900/40 to-cyan-800/20" />
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
									<button
										type="button"
										onClick={() => {
											setOtpEmail(email);
											setForgotOpen((prev) => !prev);
										}}
										className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
									>
										Forgot password?
									</button>
								</div>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 pr-12 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none"
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

						{forgotOpen && (
							<div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
								<p className="text-sm font-semibold text-blue-800">Reset password with OTP</p>
								<div className="mt-3 space-y-3">
									<input
										type="email"
										value={otpEmail}
										onChange={(e) => setOtpEmail(e.target.value)}
										placeholder="Enter your email address"
										className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									/>

									<button
										type="button"
										onClick={onRequestOtp}
										disabled={forgotLoading}
										className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
									>
										{forgotLoading ? "Sending OTP..." : "Send OTP"}
									</button>

									{otpRequested && (
										<>
											<input
												type="text"
												value={otpCode}
												onChange={(e) => setOtpCode(e.target.value)}
												placeholder="Enter 6-digit OTP"
												className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
											/>
											<input
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												placeholder="Enter new password"
												className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
											/>
											<button
												type="button"
												onClick={onResetPassword}
												disabled={forgotLoading}
												className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
											>
												{forgotLoading ? "Resetting..." : "Reset Password"}
											</button>
										</>
									)}

									{forgotNotice && <p className="text-xs text-blue-800">{forgotNotice}</p>}
								</div>
							</div>
						)}

						{notice && (
							<div className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 text-sm animate-in fade-in slide-in-from-top-2 ${
								noticeType === "info"
									? "border-amber-100 bg-amber-50 text-amber-700"
									: "border-red-100 bg-red-50 text-red-600"
							}`}>
								<svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
									{noticeType === "info" ? (
										<path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 000 2v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
									) : (
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									)}
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
