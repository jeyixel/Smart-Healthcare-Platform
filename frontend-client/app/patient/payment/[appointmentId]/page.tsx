"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePatientAuth } from "@/app/hooks/usePatientAuth";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = usePatientAuth();

  const appointmentId = params.appointmentId as string;
  const amount = searchParams.get("amount") || "0";

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashData, setHashData] = useState<{
    hash: string;
    merchantId: string;
    orderId: string;
    amount: string;
    currency: string;
  } | null>(null);
  const [hashLoading, setHashLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;
    if (authLoading) return;
    if (!session?.token) return;

    const payhereStatus = searchParams.get("payhere_status");
    const paymentId = searchParams.get("payment_id");
    if (payhereStatus !== "success") return;

    const syncPayment = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/payments/appointments/${appointmentId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              status: "PAID",
              transactionId: paymentId || `PAYHERE_${Date.now()}`,
              amount: parseFloat(amount),
            }),
          }
        );

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`HTTP ${response.status}: ${details || "Failed to update payment status"}`);
        }
        router.push("/patient/dashboard");
      } catch (err) {
        console.error("Payment status sync failed:", err);
        setError(
          `Payment was successful, but status update failed. ${
            err instanceof Error ? err.message : "Please refresh dashboard."
          }`
        );
      }
    };

    void syncPayment();
  }, [appointmentId, amount, authLoading, router, searchParams, session?.token]);

  useEffect(() => {
    if (!appointmentId || !amount) return;
    const fetchHash = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/payments/hash?orderId=${appointmentId}&amount=${amount}`
        );
        if (!response.ok) throw new Error("Failed to fetch hash");
        const data = await response.json();
        setHashData(data);
      } catch (err) {
        console.error("Hash fetch error:", err);
      } finally {
        setHashLoading(false);
      }
    };
    fetchHash();
  }, [appointmentId, amount]);

  const handlePayNow = () => {
    if (!hashData) return;

    const popup = window.open(
      "",
      "payhere_checkout",
      "width=540,height=700,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      setError("Popup blocked. Please allow popups and try again.");
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";
    form.target = "payhere_checkout";

    const fields: Record<string, string> = {
      merchant_id: hashData.merchantId,
      return_url: `http://localhost:3000/patient/payment/${appointmentId}?amount=${amount}&payhere_status=success`,
      cancel_url: `http://localhost:3000/patient/payment/${appointmentId}?amount=${amount}&payhere_status=cancel`,
      notify_url: "http://localhost:8080/api/payments/notify",
      order_id: hashData.orderId,
      items: "Doctor Consultation",
      currency: hashData.currency,
      amount: hashData.amount,
      first_name: "Patient",
      last_name: "User",
      email: "patient@example.com",
      phone: "0771234567",
      address: "Colombo",
      city: "Colombo",
      country: "Sri Lanka",
      hash: hashData.hash,
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Checkout</h1>
            <p className="text-slate-400 text-sm">Complete your appointment payment</p>
          </div>

          <div className="p-6">
            {error && (
               <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                 {error}
               </div>
            )}

            {paymentSuccess && (
               <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-200">
                 Payment successful. Redirecting...
               </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500">Appointment ID</span>
                <span className="font-semibold text-slate-800">{appointmentId}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-800">Doctor Consultation</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-700">Total Amount</span>
                <span className="text-2xl font-black text-[#0891b2]">LKR {amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
               <button
                 onClick={() => router.push("/patient/dashboard")}
                 className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
               >
                 Cancel
               </button>
               <button
                 onClick={handlePayNow}
                 className="flex-1 py-3 px-4 text-white font-bold rounded-xl transition shadow-lg shadow-[#4fd1c5]/30 hover:scale-105"
                 style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
                 disabled={hashLoading || hashData === null}
               >
                 {hashLoading || hashData === null ? "Preparing..." : "Pay Now"}
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
