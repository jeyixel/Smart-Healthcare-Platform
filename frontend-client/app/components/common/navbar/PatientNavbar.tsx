"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./PatientNavbar.module.css";

const NAV_LINKS = [
  { label: "Home",       href: "#home" },
  { label: "Services",   href: "#services" },
  { label: "About Us",   href: "#about" },
  { label: "Blog",       href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

export default function PatientNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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

          {/* CTA */}
          <div className={styles.navActions}>
            <Link href="/register" className={styles.btnBook} id="nav-book-btn">
              Book Appointment
            </Link>
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
            <Link href="/register" className={styles.mobileBtnBook}
                  id="mob-book-btn" onClick={() => setMenuOpen(false)}>
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
