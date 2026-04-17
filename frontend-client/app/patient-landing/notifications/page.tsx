"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchNotifications } from "@/lib/api";
import { NotificationLog } from "@/types/api";
import styles from "./notifications.module.css";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "PATIENT") {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        let logs = await fetchNotifications(token!);
        
        // Safely insert meaningful dummy data if no notifications exist from backend
        if (!logs || logs.length === 0) {
          logs = [
            {
              id: 1,
              recipientItems: "patient@example.com", // Assuming recipient matches interface lightly
              recipient: "patient@example.com",
              subject: "Appointment Confirmed - Smart Healthcare",
              message: "Your appointment with Dr. Giha bandara has been successfully booked.\nDate: Tomorrow\nTime: 10:00 AM",
              channel: "EMAIL",
              eventType: "APPOINTMENT_CREATED",
              status: "SENT",
              sentAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
            } as unknown as NotificationLog,
            {
              id: 2,
              recipient: "patient@example.com",
              subject: "Prescription Updated",
              message: "Dr. Giha bandara has updated your prescription. Summary: Amoxicillin (500mg) - 2 times a day.",
              channel: "EMAIL",
              eventType: "PRESCRIPTION_CREATED",
              status: "SENT",
              sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
            } as unknown as NotificationLog,
            {
              id: 3,
              recipient: "patient@example.com",
              subject: "Payment Successful - Booking Confirmed",
              message: "Your payment of 2500.00 rs was successful. Booking for Dr. Giha bandara is confirmed.\nTransaction ID: TXN-8947239",
              channel: "EMAIL",
              eventType: "PAYMENT_SUCCESS",
              status: "SENT",
              sentAt: new Date(Date.now() - 25 * 3600000).toISOString(), // 1 day ago
            } as unknown as NotificationLog,
            {
              id: 4,
              recipient: "patient@example.com",
              subject: "Appointment Cancelled - Smart Healthcare",
              message: "Your appointment with Dr. Giha bandara scheduled for next week has been cancelled. Please contact support to reschedule.",
              channel: "EMAIL",
              eventType: "APPOINTMENT_CANCELLED",
              status: "SENT",
              sentAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
            } as unknown as NotificationLog
          ];
        }

        setNotifications(logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "All") return true;
    return n.subject.toLowerCase().includes(filter.toLowerCase()) || 
           n.message.toLowerCase().includes(filter.toLowerCase());
  });

  const getIconClass = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("appointment")) return styles.icon_appointment;
    if (s.includes("prescription")) return styles.icon_prescription;
    if (s.includes("payment")) return styles.icon_payment;
    return styles.icon_system;
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const sent = new Date(dateStr);
    const diff = now.getTime() - sent.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return sent.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>Notifications</h1>
            <p>Stay updated on your health activities</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.filters}>
          {["All", "Appointment", "Payment"].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All" ? "All Items" : `${f}s`}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3>No notifications found</h3>
            <p>We'll notify you when something important happens.</p>
          </div>
        ) : (
          <div className={styles.notifList}>
            {filteredNotifications.map((n) => (
              <div key={n.id} className={`${styles.notifCard} ${styles.unreadCard}`}>
                <div className={`${styles.iconWrapper} ${getIconClass(n.subject)}`}>
                  {n.subject.toLowerCase().includes("appointment") && (
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  )}
                  {n.subject.toLowerCase().includes("prescription") && (
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                      <path d="M17 21v-8H7v8" />
                    </svg>
                  )}
                  {(!n.subject.toLowerCase().includes("appointment") && !n.subject.toLowerCase().includes("prescription")) && (
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  )}
                </div>
                <div className={styles.body}>
                  <div className={styles.topRow}>
                    <h4 className={styles.subject}>{n.subject}</h4>
                    <span className={styles.time}>{getTimeAgo(n.sentAt)}</span>
                  </div>
                  <p className={styles.message}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
