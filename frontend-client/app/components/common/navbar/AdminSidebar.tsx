"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AdminSidebar.module.css";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "👥" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Profile", href: "/admin/profile", icon: "👤" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email") || "admin@smarthealth.com";
    setAdminEmail(email);
    setAdminName(email.split("@")[0].toUpperCase());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    router.push("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className={styles.logoText}>SmartAdmin</span>
      </div>

      <nav className={styles.navSection}>
        <p className={styles.sectionLabel}>Management</p>
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {adminName.charAt(0)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{adminName}</span>
            <span className={styles.userRole}>System Admin</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
