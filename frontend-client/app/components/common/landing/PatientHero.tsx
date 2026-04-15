"use client";

import Link from "next/link";
import styles from "./PatientHero.module.css";

const CHIPS = [
  "24/7 Emergency Care",
  "200+ Specialists",
  "AI-Powered Diagnosis",
  "Secure Health Records",
];

const STATS = [
  { value: "4,500+", label: "Happy Patients" },
  { value: "200",    label: "Hospital Rooms" },
  { value: "500+",   label: "Awards Won" },
  { value: "20+",    label: "Ambulances" },
];

export default function PatientHero() {
  return (
    <section id="home" className={styles.hero} aria-label="Patient portal hero section">

      {/* ── Animated background layers ── */}
      <div className={styles.bgGlow1}  aria-hidden="true" />
      <div className={styles.bgGlow2}  aria-hidden="true" />
      <div className={styles.bgGlow3}  aria-hidden="true" />
      <div className={styles.bgDots}   aria-hidden="true" />
      <div className={styles.bgVeil}   aria-hidden="true" />

      {/* ── Announce badge ── */}
      <div className={styles.announceBadge}>
        
      </div>

      {/* ══════════════════════════
           Main split content
      ══════════════════════════ */}
      <div className={styles.heroBody}>

        {/* ── LEFT — Copy ── */}
        <div className={styles.heroCopy}>

          <div className={styles.headlineWrap}>
            <span className={styles.heroTag}>
              <span className={styles.heroTagLine} aria-hidden="true" />
              World-class Healthcare
            </span>
            <h1 className={styles.heroHeading}>
              Premium{" "}
              <span className={styles.heroHeadingGrad}>Health Care</span>
              <br />for a Better Life
            </h1>
          </div>

          <p className={styles.heroDesc}>
            Access world-class specialists, AI-powered diagnostics, and seamless
            appointment booking — all in one secure, beautifully designed platform
            built for modern healthcare.
          </p>

          {/* Feature chips */}
          <div className={styles.heroChips} aria-label="Key features">
            {CHIPS.map(chip => (
              <span key={chip} className={styles.chip}>
                <span className={styles.chipDot} aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.ctaPrimary} id="hero-book-btn">
              Book Appointment
              <svg className={styles.ctaArrow} width="18" height="18"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="#services" className={styles.ctaSecondary} id="hero-services-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              View Services
            </Link>
          </div>

          {/* Availability */}
          <div className={styles.availRow}>
            <span className={styles.availDot} aria-hidden="true" />
            Doctors available now · No waiting time
          </div>
        </div>

        {/* ── RIGHT — Visual ── */}
        <div className={styles.heroVisual} aria-label="Doctor illustration with health stats">

          {/* Rotating decorative rings */}
          <div className={styles.ringOuter} aria-hidden="true" />
          <div className={styles.ringInner} aria-hidden="true" />

          {/* Central teal glow disc */}
          <div className={styles.discGlow} aria-hidden="true" />

          {/* Doctor image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/doctor-hero.png"
            alt="Professional female doctor with arms crossed, smiling warmly"
            className={styles.doctorImg}
          />

          {/* ── Floating glassmorphism cards ── */}

          {/* Card 1 — Doctors Online (top left) */}
          <div className={`${styles.glassCard} ${styles.cardDoctors}`}
               aria-label="2500 plus doctors online">
            <div className={styles.cardIconCircle} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>2,500+</span>
              <span className={styles.cardLabel}>Doctors Online</span>
            </div>
          </div>

          {/* Card 2 — Rating (top right) */}
          <div className={`${styles.glassCard} ${styles.cardRating}`}
               aria-label="4.9 star rating">
            <div className={styles.cardIconCircle} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.stars} aria-label="5 stars">★★★★★</div>
              <span className={styles.cardLabel}>4.9 · 12K Reviews</span>
            </div>
          </div>

          {/* Card 3 — Next Appointment (bottom right) */}
          <div className={`${styles.glassCard} ${styles.cardAppt}`}
               aria-label="Next appointment confirmed">
            <div className={styles.cardIconCircle} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>Tomorrow 10:30</span>
              <span className={styles.cardLabel}>Dr. Sarah Johnson</span>
            </div>
            <span className={styles.apptBadge}>Confirmed</span>
          </div>

        </div>
      </div>

      {/* ════════════
          Stats Strip
      ════════════ */}
      <div className={styles.statsStrip} aria-label="Platform statistics">
        <div className={styles.statsInner}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
