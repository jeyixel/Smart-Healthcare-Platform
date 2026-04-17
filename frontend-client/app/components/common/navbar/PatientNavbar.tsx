"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PatientNavbar.module.css";
import { fetchNotifications } from "@/lib/api";
import { NotificationLog } from "@/types/api";

const NAV_LINKS = [
  { label: "Home",       href: "#home" },
  { label: "Services",   href: "#services" },
  { label: "About Us",   href: "#about" },
  { label: "Blog",       href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

function NotificationIcon({ type }: { type: string }) {
  if (type === "appointment")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  if (type === "lab")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0a5 5 0 0010 0V9M9 14a5 5 0 01-4-4.9V5" />
      </svg>
    );
  if (type === "reminder")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function timeAgo(dateStr: string) {
  try {
    const now = new Date();
    const sent = new Date(dateStr);
    const diffInMs = now.getTime() - sent.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins} min ago`;
    const diffInHrs = Math.floor(diffInMins / 60);
    if (diffInHrs < 24) return `${diffInHrs} hr${diffInHrs > 1 ? "s" : ""} ago`;
    return sent.toLocaleDateString();
  } catch {
    return "Recently";
  }
}

export default function PatientNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  // Defer localStorage reads to after hydration to prevent SSR mismatch
  const [patientEmail, setPatientEmail] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const patientName = patientEmail
    ? patientEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Read from localStorage only on the client after mount
  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email") || "patient@smarthealth.com";
    setPatientEmail(email);
  }, []);

  // Fetch real notifications
  useEffect(() => {
    if (!patientEmail) return;

    async function loadNotifications() {
      try {
        const token = localStorage.getItem("smart_admin_token");
        if (!token) return;
        
        const logs: NotificationLog[] = await fetchNotifications(token, patientEmail);
        const mapped = logs.map(log => ({
          id: log.id,
          title: log.subject,
          message: log.message,
          time: timeAgo(log.sentAt),
          read: true, // Auto-read for now as backend doesn't track read status
          type: log.subject.toLowerCase().includes("appointment") ? "appointment" : 
                log.subject.toLowerCase().includes("lab") ? "lab" : "reminder"
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [patientEmail]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleLogout() {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    window.location.href = "/login";
  }

  return (
    <>
      <nav
        className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : styles.navbarBase}`}
        aria-label="Main navigation"
      >
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="Smart Healthcare – Home">
            <span className={styles.logoMark} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" fill="rgba(255,255,255,0.2)" />
                <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="#fff" />
              </svg>
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoName}>SmartHealth</span>
              <span className={styles.logoSub}>Patient Portal</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className={styles.navLinks} role="list">
            {NAV_LINKS.map((link, i) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`${styles.navLink} ${i === 0 ? styles.navLinkActive : ""}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right-side actions */}
          <div className={styles.navActions}>
            <Link href="/patient/book" className={styles.btnBook} id="nav-book-btn">
              Book Appointment
            </Link>

            {/* ── Notification Bell ── */}
            <div className={styles.iconGroup} ref={notifRef}>
              <button
                id="nav-notification-btn"
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className={styles.dropdown} role="dialog" aria-label="Notifications">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownTitle}>Notifications</span>
                    {unreadCount > 0 && (
                      <button className={styles.markReadBtn} onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <ul className={styles.notifList} role="list">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                      >
                        <span
                          className={`${styles.notifIcon} ${styles[`notifIcon_${n.type}`]}`}
                          aria-hidden="true"
                        >
                          <NotificationIcon type={n.type} />
                        </span>
                        <div className={styles.notifBody}>
                          <p className={styles.notifTitle}>{n.title}</p>
                          <p className={styles.notifMsg}>{n.message}</p>
                          <span className={styles.notifTime}>{n.time}</span>
                        </div>
                        {!n.read && <span className={styles.unreadDot} aria-label="Unread" />}
                      </li>
                    ))}
                  </ul>

                  <div className={styles.dropdownFooter}>
                    <a href="#" className={styles.viewAllLink}>View all notifications</a>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile Avatar ── */}
            <div className={styles.iconGroup} ref={profileRef}>
              <button
                id="nav-profile-btn"
                className={`${styles.avatarBtn} ${profileOpen ? styles.avatarBtnActive : ""}`}
                aria-label="Profile menu"
                onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
              >
                <span className={styles.avatarInitial}>
                  {patientName.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className={`${styles.dropdown} ${styles.dropdownProfile}`} role="dialog" aria-label="Profile menu">
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatarLg}>
                      {patientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={styles.profileName}>{patientName}</p>
                      <p className={styles.profileEmail}>{patientEmail}</p>
                    </div>
                  </div>

                  <ul className={styles.profileMenuList} role="list">
                    <li>
                      <Link href="/patient/profile" className={styles.profileMenuItem} id="profile-view-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        View Profile
                      </Link>
                    </li>
                    <li>
                      <a href="#" className={styles.profileMenuItem} id="profile-appointments-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        My Appointments
                      </a>
                    </li>
                    <li>
                      <a href="#" className={styles.profileMenuItem} id="profile-health-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        Health Records
                      </a>
                    </li>
                    <li>
                      <a href="#" className={styles.profileMenuItem} id="profile-settings-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        Settings
                      </a>
                    </li>
                  </ul>

                  <div className={styles.profileMenuDivider} />

                  <button
                    className={styles.logoutBtn}
                    id="profile-logout-btn"
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <button
            id="nav-hamburger"
            className={styles.hamburger}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(p => !p)}
          >
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine1Open : ""}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine2Open : ""}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine3Open : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileMenuInner}>
          {/* Mobile profile strip */}
          <div className={styles.mobileProfile}>
            <div className={styles.mobileProfileAvatar}>{patientName.charAt(0).toUpperCase()}</div>
            <div>
              <p className={styles.mobileProfileName}>{patientName}</p>
              <p className={styles.mobileProfileEmail}>{patientEmail}</p>
            </div>
          </div>

          <ul className={styles.mobileNavLinks} role="list">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <a href={link.href} className={styles.mobileNavLink}
                   onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <Link href="/patient/book" className={styles.mobileBtnBook}
                  id="mob-book-btn" onClick={() => setMenuOpen(false)}>
              Book Appointment
            </Link>
            <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
