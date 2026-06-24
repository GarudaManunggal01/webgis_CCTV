"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ── live CCTV stats ── */
  const [cctvStats, setCctvStats] = useState<{ total: number; online: number; offline: number } | null>(null);

  useEffect(() => {
    fetch("/api/cctv")
      .then(r => r.json())
      .then((data: Array<{ status: string }>) => {
        const total = data.length;
        const online = data.filter(c => c.status === "online").length;
        setCctvStats({ total, online, offline: total - online });
      })
      .catch(() => {/* silently fail — stats optional */});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Username atau Password salah.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch {
      setError("Username atau Password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          font-family: 'Inter', sans-serif;
          display: flex;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        /* ─── LEFT PANEL ───────────────────────────────── */
        .lp-left {
          flex: 1;
          position: relative;
          background: linear-gradient(160deg, #FDF6EC 0%, #F5E6CC 40%, #EDD9B0 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* subtle batik-inspired circle pattern overlay */
        .lp-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 25%, rgba(180,120,60,0.07) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(120,80,40,0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(200,150,80,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* top section */
        .lp-top {
          position: relative;
          z-index: 1;
          padding: 2.25rem 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        .lp-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(180,120,60,0.2);
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          width: fit-content;
        }

        .lp-top-dot {
          width: 7px; height: 7px;
          background: #22C55E;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .lp-top-badge-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: #7C4A1E;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .lp-top-title {
          font-size: clamp(1.4rem, 2.5vw, 2rem);
          font-weight: 800;
          color: #3D1F0A;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .lp-top-title span {
          color: #B45309;
        }

        .lp-top-desc {
          font-size: 0.85rem;
          color: #7C5C3A;
          line-height: 1.6;
          max-width: 340px;
        }

        /* middle image */
        .lp-img-wrap {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          min-height: 0;
        }

        .lp-left-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 8px 24px rgba(100,60,20,0.12));
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }

        /* bottom stats section */
        .lp-bottom {
          position: relative;
          z-index: 1;
          padding: 1.5rem 2.5rem 2.25rem;
          display: flex;
          gap: 0.75rem;
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }

        .lp-stat {
          flex: 1;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(180,120,60,0.18);
          border-radius: 14px;
          padding: 0.75rem 1rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lp-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(100,60,20,0.1);
        }

        .lp-stat-num {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          color: #3D1F0A;
          line-height: 1.1;
        }

        .lp-stat-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #9A6A3A;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 0.2rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }

        /* ─── RIGHT PANEL ──────────────────────────────── */
        .lp-right {
          width: 480px;
          flex-shrink: 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 3rem;
          position: relative;
          /* left-side subtle shadow to separate panels */
          box-shadow: -12px 0 40px rgba(0,0,0,0.18);
          animation: slideInRight 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* top accent line */
        .lp-right-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #111827 0%, #374151 60%, #6B7280 100%);
        }

        /* brand row */
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 2.5rem;
        }

        .lp-brand-icon {
          width: 42px;
          height: 42px;
          background: #111827;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(17,24,39,0.22);
        }

        .lp-brand-icon svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .lp-brand-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
          letter-spacing: 0.01em;
          display: block;
          line-height: 1.2;
        }

        .lp-brand-sub {
          font-size: 0.7rem;
          font-weight: 500;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }

        /* headings */
        .lp-title {
          font-size: 1.9rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 0.35rem;
        }

        .lp-subtitle {
          font-size: 0.88rem;
          color: #6B7280;
          margin-bottom: 2rem;
        }

        /* error */
        .lp-error {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.7rem 0.9rem;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          animation: shake 0.38s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-3px); }
          80%     { transform: translateX(3px); }
        }

        .lp-error svg {
          width: 15px; height: 15px;
          flex-shrink: 0;
          stroke: #DC2626; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        .lp-error-text {
          font-size: 0.83rem;
          color: #B91C1C;
          font-weight: 500;
        }

        /* form */
        .lp-field { margin-bottom: 1.1rem; }

        .lp-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.45rem;
        }

        .lp-input-wrap { position: relative; }

        .lp-input {
          width: 100%;
          padding: 0.82rem 1rem;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #111827;
          background: #F9FAFB;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .lp-input:focus {
          border-color: #111827;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
        }

        .lp-input.with-icon { padding-right: 3rem; }

        .lp-eye {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          border-radius: 6px;
          transition: color 0.18s;
        }

        .lp-eye:hover { color: #374151; }

        .lp-eye svg {
          width: 18px; height: 18px;
          fill: none; stroke: currentColor;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        /* submit btn */
        .lp-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.9rem 1rem;
          background: #111827;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(17,24,39,0.22);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .lp-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .lp-btn:hover:not(:disabled) {
          background: #1F2937;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(17,24,39,0.3);
        }

        .lp-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(17,24,39,0.2);
        }

        .lp-btn:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }

        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* divider */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }

        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: #F3F4F6;
        }

        .lp-divider-label {
          font-size: 0.7rem;
          color: #D1D5DB;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        /* footer */
        .lp-footer {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.73rem;
          color: #D1D5DB;
        }

        /* ─── RESPONSIVE ────────────────────────────────── */
        @media (max-width: 900px) {
          .lp-left {
            display: flex;
            height: 260px;
            width: 100%;
            flex-shrink: 0;
          }
          .lp-root {
            flex-direction: column;
          }
          .lp-right {
            width: 100%;
            min-height: auto;
            flex: 1;
            padding: 2.5rem 2rem;
            box-shadow: none;
          }
        }

        @media (max-width: 480px) {
          .lp-left { height: 200px; }
          .lp-right { padding: 2rem 1.5rem; }
          .lp-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="lp-root">

        {/* ─── LEFT: Background Panel ─── */}
        <div className="lp-left">

          {/* Top: branding */}
          <div className="lp-top">
            <div className="lp-top-badge">
              <span className="lp-top-dot" />
              <span className="lp-top-badge-text">Sistem Aktif 24 / 7</span>
            </div>
            <h2 className="lp-top-title">
              Pantau <span>Jogja</span><br />
              Smart Monitoring System
            </h2>
            <p className="lp-top-desc">
              Monitoring CCTV terpadu untuk Daerah Istimewa Yogyakarta.
              Akses real-time {cctvStats ? cctvStats.total : "—"} titik kamera di seluruh wilayah DIY.
            </p>
          </div>

          {/* Middle: full image */}
          <div className="lp-img-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/background%20admin.jpeg"
              alt="Pantau Jogja — Smart Monitoring for Smart City"
              className="lp-left-img"
            />
          </div>

          {/* Bottom: stats */}
          <div className="lp-bottom">
            <div className="lp-stat">
              <span className="lp-stat-num">
                {cctvStats ? cctvStats.total : "—"}
              </span>
              <span className="lp-stat-label">Total CCTV</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">
                {cctvStats ? cctvStats.online : "—"}
              </span>
              <span className="lp-stat-label">Online</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">
                {cctvStats ? cctvStats.offline : "—"}
              </span>
              <span className="lp-stat-label">Offline</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">24/7</span>
              <span className="lp-stat-label">Monitoring</span>
            </div>
          </div>

        </div>

        {/* ─── RIGHT: Login Card ─── */}
        <div className="lp-right">
          <div className="lp-right-accent" />

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-brand-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.724v6.552a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <div>
              <span className="lp-brand-name">Pantau Jogja</span>
              <span className="lp-brand-sub">Smart City Monitoring</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="lp-title">Admin Login</h1>
          <p className="lp-subtitle">Silakan masukkan detail akses Anda.</p>

          {/* Error */}
          {error && (
            <div className="lp-error" role="alert">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="lp-error-text">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="lp-field">
              <label htmlFor="username" className="lp-label">Username</label>
              <div className="lp-input-wrap">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="lp-input"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label htmlFor="password" className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="lp-input with-icon"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="lp-btn"
            >
              {loading ? (
                <>
                  <span className="lp-spinner" />
                  Sedang Masuk...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="lp-divider">
            <div className="lp-divider-line" />
            <span className="lp-divider-label">Akses Terbatas</span>
            <div className="lp-divider-line" />
          </div>

          <p className="lp-footer">
            Sistem monitoring CCTV — Daerah Istimewa Yogyakarta
          </p>
        </div>

      </div>
    </>
  );
}
