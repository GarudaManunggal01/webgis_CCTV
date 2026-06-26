"use client";

import type { CctvCamera, CctvStats } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ─── helpers ──────────────────────────────────────────────────── */
function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "") +
    "-" +
    Date.now()
  );
}

const EMPTY_FORM = {
  name: "",
  latitude: "",
  longitude: "",
  streamurl: "",
  status: "online",
  thumbnail: "",
};

/* ─── icons (inline SVG) ──────────────────────────────────────── */
const Icon = {
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.724v6.552a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  ),
  offline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  chevLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<CctvCamera[]>([]);
  const [stats, setStats] = useState<CctvStats>({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CctvCamera | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<CctvCamera | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* toast */
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── auth + data fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const v = await fetch("/api/auth/verify", { credentials: "include" });
        if (!v.ok) { localStorage.clear(); router.push("/login"); return; }
      } catch { localStorage.clear(); router.push("/login"); return; }
      await loadCameras();
    })();
  }, [router]);

  async function loadCameras() {
    try {
      const res = await fetch("/api/cctv");
      const data: CctvCamera[] = await res.json();
      setCameras(data);
      const online = data.filter(c => c.status === "online").length;
      setStats({ total: data.length, online, offline: data.length - online });
    } catch { showToast("Gagal memuat data CCTV", "err"); }
    finally { setLoading(false); }
  }

  /* ── toast helper ── */
  function showToast(msg: string, type: "ok" | "err") {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3200);
  }

  /* ── CRUD ── */
  function openCreate() {
    setEditingCamera(null);
    setFormData({ ...EMPTY_FORM });
    setFormError("");
    setModalOpen(true);
  }
  function openEdit(cam: CctvCamera) {
    setEditingCamera(cam);
    setFormData({
      name: cam.name,
      latitude: String(cam.latitude),
      longitude: String(cam.longitude),
      streamurl: cam.streamurl,
      status: cam.status,
      thumbnail: cam.thumbnail ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.streamurl) {
      setFormError("Nama, Latitude, Longitude, dan Stream URL wajib diisi.");
      return;
    }
    setFormLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (editingCamera) {
        const res = await fetch(`/api/cctv/${editingCamera.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
          }),
        });
        if (!res.ok) throw new Error("Update gagal");
        showToast("CCTV berhasil diperbarui ✓", "ok");
      } else {
        const payload = {
          ...formData,
          slug: slugify(formData.name),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        };
        const res = await fetch("/api/cctv", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Tambah gagal");
        showToast("CCTV berhasil ditambahkan ✓", "ok");
      }
      setModalOpen(false);
      await loadCameras();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/cctv/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Hapus gagal");
      showToast("CCTV berhasil dihapus", "ok");
      setDeleteTarget(null);
      await loadCameras();
    } catch {
      showToast("Gagal menghapus CCTV", "err");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleLogout() {
    localStorage.clear();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  /* ── filtered + paginated ── */
  const filtered = cameras.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── loading state ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a0533 0%,#0c1445 50%,#091a2e 100%)", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#A78BFA", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "#A78BFA", fontSize: "0.9rem", fontWeight: 500 }}>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── BACKGROUND DECORATION ── */
        .ad-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 10% 10%, rgba(139,92,246,0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, rgba(6,182,212,0.2) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 90%, rgba(236,72,153,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(99,102,241,0.18) 0%, transparent 45%);
          pointer-events: none;
          z-index: 0;
        }

        /* grid dots pattern */
        .ad-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 0;
        }

        .ad-root > * { position: relative; z-index: 1; }

        .ad-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a0533 0%, #0c1445 50%, #091a2e 100%);
          color: #E2E8F0;
          display: flex;
          flex-direction: column;
        }

        /* ── TOPBAR ── */
        .ad-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(20, 8, 50, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(167,139,250,0.15);
          padding: 0 2rem;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* topbar gradient line at top */
        .ad-topbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899, #7C3AED);
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .ad-topbar-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .ad-logo-box {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(124,58,237,0.5);
        }

        .ad-logo-box svg { width: 20px; height: 20px; color: #fff; }

        .ad-brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          background: linear-gradient(135deg, #C4B5FD, #67E8F9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .ad-brand-sub {
          font-size: 0.67rem;
          color: #7C6FA0;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .ad-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ad-user-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 999px;
          padding: 0.3rem 0.9rem 0.3rem 0.3rem;
        }

        .ad-avatar {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 0 10px rgba(124,58,237,0.4);
        }

        .ad-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #C4B5FD;
        }

        .ad-logout-btn {
          display: flex; align-items: center; gap: 0.45rem;
          background: rgba(236,72,153,0.12);
          border: 1px solid rgba(236,72,153,0.25);
          border-radius: 10px;
          color: #F472B6;
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
        }
        .ad-logout-btn svg { width: 14px; height: 14px; }
        .ad-logout-btn:hover { background: rgba(236,72,153,0.22); border-color: rgba(236,72,153,0.4); box-shadow: 0 0 16px rgba(236,72,153,0.2); }

        /* ── MAIN CONTENT ── */
        .ad-main { flex: 1; padding: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; }

        /* page header */
        .ad-page-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ad-page-title {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #F1F5F9 30%, #C4B5FD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
        }
        .ad-page-sub { font-size: 0.85rem; color: #7C6FA0; margin-top: 0.3rem; }

        .ad-add-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.7rem 1.4rem;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.45);
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .ad-add-btn svg { width: 15px; height: 15px; }
        .ad-add-btn:hover { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.55); }

        /* ── STAT CARDS ── */
        .ad-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .ad-stat-card {
          border-radius: 20px;
          padding: 1.6rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.1rem;
          transition: transform 0.22s, box-shadow 0.22s;
          position: relative;
          overflow: hidden;
        }

        /* card glow ring */
        .ad-stat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: var(--card-border, linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .ad-stat-card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow, 0 12px 40px rgba(0,0,0,0.4)); }

        /* card 1: total — purple */
        .ad-stat-card:nth-child(1) {
          background: linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(109,40,217,0.2) 100%);
          --card-border: linear-gradient(135deg, rgba(167,139,250,0.4), rgba(124,58,237,0.1));
          --card-shadow: 0 16px 48px rgba(124,58,237,0.3);
        }

        /* card 2: online — cyan/emerald */
        .ad-stat-card:nth-child(2) {
          background: linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.2) 100%);
          --card-border: linear-gradient(135deg, rgba(103,232,249,0.4), rgba(52,211,153,0.1));
          --card-shadow: 0 16px 48px rgba(6,182,212,0.25);
        }

        /* card 3: offline — rose */
        .ad-stat-card:nth-child(3) {
          background: linear-gradient(135deg, rgba(236,72,153,0.28) 0%, rgba(239,68,68,0.18) 100%);
          --card-border: linear-gradient(135deg, rgba(244,114,182,0.4), rgba(248,113,113,0.1));
          --card-shadow: 0 16px 48px rgba(236,72,153,0.25);
        }

        .ad-stat-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
        }
        .ad-stat-icon svg { width: 26px; height: 26px; }

        .ad-stat-card:nth-child(1) .ad-stat-icon { color: #C4B5FD; box-shadow: 0 0 20px rgba(167,139,250,0.3); }
        .ad-stat-card:nth-child(2) .ad-stat-icon { color: #67E8F9; box-shadow: 0 0 20px rgba(103,232,249,0.3); }
        .ad-stat-card:nth-child(3) .ad-stat-icon { color: #F9A8D4; box-shadow: 0 0 20px rgba(244,114,182,0.3); }

        .ad-stat-num { font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1; letter-spacing: -0.03em; }
        .ad-stat-label { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.3rem; }

        /* online rate bar */
        .ad-rate-bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          margin-top: 0.7rem;
          overflow: hidden;
          width: 100%;
        }
        .ad-rate-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #34D399, #67E8F9); transition: width 0.6s ease; }

        /* ── TABLE CARD ── */
        .ad-table-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(167,139,250,0.12);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        }

        /* toolbar */
        .ad-toolbar {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(167,139,250,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(124,58,237,0.04);
        }

        .ad-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 340px;
        }
        .ad-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #7C6FA0;
          pointer-events: none;
        }
        .ad-search-icon svg { width: 15px; height: 15px; }

        .ad-search-input {
          width: 100%;
          padding: 0.62rem 0.85rem 0.62rem 2.5rem;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 10px;
          color: #E2E8F0;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .ad-search-input::placeholder { color: #7C6FA0; }
        .ad-search-input:focus { border-color: #A78BFA; background: rgba(124,58,237,0.12); box-shadow: 0 0 0 3px rgba(167,139,250,0.12); }

        .ad-filter-tabs {
          display: flex;
          gap: 0.3rem;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(167,139,250,0.15);
          border-radius: 10px;
          padding: 0.25rem;
        }

        .ad-filter-tab {
          padding: 0.38rem 0.9rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #7C6FA0;
          font-family: inherit;
          transition: background 0.18s, color 0.18s;
          white-space: nowrap;
        }
        .ad-filter-tab.active { background: rgba(167,139,250,0.2); color: #C4B5FD; }
        .ad-filter-tab:hover:not(.active) { color: #A78BFA; }

        .ad-count-badge {
          margin-left: auto;
          font-size: 0.78rem;
          color: #7C6FA0;
          white-space: nowrap;
        }

        /* table */
        .ad-table-wrap { overflow-x: auto; }

        table.ad-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .ad-table thead tr {
          background: rgba(124,58,237,0.08);
        }

        .ad-table th {
          padding: 0.85rem 1.25rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          color: #A78BFA;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(167,139,250,0.1);
          white-space: nowrap;
        }

        .ad-table th.right, .ad-table td.right { text-align: right; }

        .ad-table tbody tr {
          border-bottom: 1px solid rgba(167,139,250,0.06);
          transition: background 0.15s;
        }
        .ad-table tbody tr:last-child { border-bottom: none; }
        .ad-table tbody tr:hover { background: rgba(124,58,237,0.07); }

        .ad-table td {
          padding: 1rem 1.25rem;
          color: #CBD5E1;
          vertical-align: middle;
        }

        .td-name { font-weight: 600; color: #F1F5F9; }
        .td-slug { font-size: 0.72rem; color: #7C6FA0; margin-top: 0.1rem; font-family: monospace; }

        .td-coord {
          font-family: monospace;
          font-size: 0.78rem;
          color: #7C6FA0;
          line-height: 1.6;
        }

        .td-url {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;
          font-size: 0.75rem;
          color: #7C6FA0;
        }

        /* status badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .status-online { background: rgba(52,211,153,0.12); color: #34D399; border: 1px solid rgba(52,211,153,0.25); }
        .status-online .status-dot { background: #34D399; animation: pulse-dot 2s ease-in-out infinite; box-shadow: 0 0 6px #34D399; }
        .status-offline { background: rgba(244,114,182,0.12); color: #F472B6; border: 1px solid rgba(244,114,182,0.25); }
        .status-offline .status-dot { background: #F472B6; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* action buttons */
        .ad-action-group { display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; }

        .ad-btn-icon {
          width: 33px; height: 33px;
          border-radius: 9px;
          border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s, border-color 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .ad-btn-icon svg { width: 14px; height: 14px; }
        .ad-btn-icon:hover { transform: scale(1.12); }

        .ad-btn-edit {
          background: rgba(124,58,237,0.12);
          border-color: rgba(167,139,250,0.25);
          color: #A78BFA;
        }
        .ad-btn-edit:hover { background: rgba(124,58,237,0.25); border-color: rgba(167,139,250,0.5); box-shadow: 0 0 12px rgba(124,58,237,0.3); }

        .ad-btn-del {
          background: rgba(236,72,153,0.1);
          border-color: rgba(244,114,182,0.2);
          color: #F472B6;
        }
        .ad-btn-del:hover { background: rgba(236,72,153,0.22); border-color: rgba(244,114,182,0.4); box-shadow: 0 0 12px rgba(236,72,153,0.25); }

        /* empty state */
        .ad-empty {
          padding: 4rem 2rem;
          text-align: center;
        }
        .ad-empty svg { width: 52px; height: 52px; margin: 0 auto 1rem; color: #7C6FA0; opacity: 0.4; }
        .ad-empty-title { font-size: 1rem; font-weight: 600; color: #7C6FA0; margin-bottom: 0.35rem; }
        .ad-empty-sub { font-size: 0.82rem; color: #4C4570; }

        /* ── PAGINATION ── */
        .ad-pagination {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(167,139,250,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(124,58,237,0.04);
        }
        .ad-page-info { font-size: 0.78rem; color: #7C6FA0; }

        .ad-page-btns { display: flex; gap: 0.35rem; align-items: center; }

        .ad-page-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(167,139,250,0.15);
          background: transparent;
          color: #7C6FA0;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .ad-page-btn svg { width: 14px; height: 14px; }
        .ad-page-btn:hover:not(:disabled) { background: rgba(167,139,250,0.12); color: #C4B5FD; border-color: rgba(167,139,250,0.3); }
        .ad-page-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .ad-page-btn.active { background: rgba(124,58,237,0.3); color: #C4B5FD; border-color: rgba(167,139,250,0.4); }

        /* ── MODAL ── */
        .ad-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(10,4,30,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .ad-modal {
          background: linear-gradient(145deg, #1a0b35 0%, #0e1a3a 100%);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 24px;
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.05);
          animation: slideUp 0.28s cubic-bezier(0.22,1,0.36,1);
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }

        .ad-modal-header {
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid rgba(167,139,250,0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          position: sticky; top: 0;
          background: rgba(26,11,53,0.95);
          backdrop-filter: blur(12px);
          z-index: 1;
          border-radius: 24px 24px 0 0;
        }

        .ad-modal-title {
          font-size: 1.05rem; font-weight: 700;
          background: linear-gradient(135deg, #F1F5F9, #C4B5FD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ad-modal-close {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(167,139,250,0.2);
          background: rgba(124,58,237,0.08);
          color: #A78BFA;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s, color 0.18s;
        }
        .ad-modal-close svg { width: 14px; height: 14px; }
        .ad-modal-close:hover { background: rgba(124,58,237,0.2); color: #C4B5FD; }

        .ad-modal-body { padding: 1.5rem 1.75rem; }

        /* form fields */
        .ad-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ad-form-group { margin-bottom: 1.1rem; }

        .ad-form-label {
          display: block;
          font-size: 0.73rem;
          font-weight: 700;
          color: #A78BFA;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.45rem;
        }

        .ad-form-input, .ad-form-select {
          width: 100%;
          padding: 0.75rem 0.95rem;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(167,139,250,0.18);
          border-radius: 11px;
          color: #E2E8F0;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .ad-form-input::placeholder { color: #4C4570; }
        .ad-form-input:focus, .ad-form-select:focus {
          border-color: #A78BFA;
          background: rgba(124,58,237,0.14);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
        }
        .ad-form-select option { background: #1a0b35; color: #E2E8F0; }

        .ad-form-hint { font-size: 0.71rem; color: #7C6FA0; margin-top: 0.3rem; }

        .ad-form-error {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 0.9rem;
          background: rgba(236,72,153,0.08);
          border: 1px solid rgba(244,114,182,0.2);
          border-radius: 10px;
          margin-bottom: 1rem;
        }
        .ad-form-error-text { font-size: 0.82rem; color: #F472B6; font-weight: 500; }

        .ad-modal-footer {
          padding: 1.25rem 1.75rem;
          border-top: 1px solid rgba(167,139,250,0.1);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .ad-btn-cancel {
          padding: 0.65rem 1.25rem;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 10px;
          color: #A78BFA;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s, color 0.18s;
        }
        .ad-btn-cancel:hover { background: rgba(124,58,237,0.18); color: #C4B5FD; }

        .ad-btn-save {
          padding: 0.65rem 1.5rem;
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.18s, transform 0.15s;
          display: flex; align-items: center; gap: 0.5rem;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
          letter-spacing: 0.01em;
        }
        .ad-btn-save:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }
        .ad-btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

        /* spinner */
        .btn-spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── DELETE CONFIRM ── */
        .ad-del-modal {
          background: linear-gradient(145deg, #1a0b35 0%, #0e1a3a 100%);
          border: 1px solid rgba(244,114,182,0.2);
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2rem;
          text-align: center;
          animation: slideUp 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(236,72,153,0.08);
        }

        .ad-del-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(239,68,68,0.12));
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
          border: 1px solid rgba(244,114,182,0.25);
          box-shadow: 0 0 24px rgba(236,72,153,0.2);
        }
        .ad-del-icon svg { width: 26px; height: 26px; color: #F472B6; }

        .ad-del-title {
          font-size: 1.1rem; font-weight: 700;
          background: linear-gradient(135deg, #F1F5F9, #F9A8D4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .ad-del-body { font-size: 0.85rem; color: #7C6FA0; line-height: 1.65; margin-bottom: 1.75rem; }
        .ad-del-name { font-weight: 600; color: #C4B5FD; }

        .ad-del-btns { display: flex; gap: 0.75rem; justify-content: center; }

        .ad-del-confirm {
          padding: 0.65rem 1.5rem;
          background: linear-gradient(135deg, #EC4899, #EF4444);
          border: none; border-radius: 10px;
          color: #fff;
          font-size: 0.875rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
          display: flex; align-items: center; gap: 0.5rem;
          box-shadow: 0 4px 16px rgba(236,72,153,0.35);
        }
        .ad-del-confirm:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(236,72,153,0.5); }
        .ad-del-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── TOAST ── */
        .ad-toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 200;
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.9rem 1.3rem;
          border-radius: 14px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          animation: toastIn 0.32s cubic-bezier(0.22,1,0.36,1);
          max-width: 340px;
          backdrop-filter: blur(12px);
        }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: none; } }

        .toast-ok { background: rgba(6,78,59,0.9); border: 1px solid rgba(52,211,153,0.3); color: #34D399; box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(52,211,153,0.12); }
        .toast-err { background: rgba(74,4,78,0.9); border: 1px solid rgba(244,114,182,0.3); color: #F472B6; box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(236,72,153,0.12); }
        .toast-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .ad-stats { grid-template-columns: repeat(3, 1fr); }
          .ad-main { padding: 1.25rem; }
          .ad-topbar { padding: 0 1.25rem; }
        }
        @media (max-width: 600px) {
          .ad-stats { grid-template-columns: 1fr; }
          .ad-form-row { grid-template-columns: 1fr; }
          .ad-page-title { font-size: 1.3rem; }
          td.td-coord, td.td-url { display: none; }
        }
      `}</style>

      <div className="ad-root">

        {/* ── TOPBAR ── */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <div className="ad-logo-box">{Icon.camera}</div>
            <div>
              <div className="ad-brand-name">Pantau Jogja</div>
              <div className="ad-brand-sub">Admin Dashboard</div>
            </div>
          </div>
          <div className="ad-topbar-right">
            <div className="ad-user-chip">
              <div className="ad-avatar">A</div>
              <span className="ad-user-name">admin</span>
            </div>
            <button className="ad-logout-btn" onClick={handleLogout}>
              {Icon.logout} Logout
            </button>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="ad-main">

          {/* page header */}
          <div className="ad-page-header">
            <div>
              <h1 className="ad-page-title">Manajemen CCTV</h1>
              <p className="ad-page-sub">
                Kelola data kamera CCTV seluruh wilayah Daerah Istimewa Yogyakarta
              </p>
            </div>
            <button className="ad-add-btn" onClick={openCreate}>
              {Icon.plus} Tambah CCTV
            </button>
          </div>

          {/* stat cards */}
          <div className="ad-stats">
            <div className="ad-stat-card" style={{ "--card-glow": "radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.05) 0%, transparent 70%)" } as React.CSSProperties}>
              <div className="ad-stat-icon total">{Icon.camera}</div>
              <div>
                <div className="ad-stat-num">{stats.total}</div>
                <div className="ad-stat-label">Total CCTV</div>
              </div>
            </div>
            <div className="ad-stat-card" style={{ "--card-glow": "radial-gradient(ellipse at 0% 0%, rgba(34,197,94,0.05) 0%, transparent 70%)" } as React.CSSProperties}>
              <div className="ad-stat-icon online-ic">{Icon.online}</div>
              <div style={{ flex: 1 }}>
                <div className="ad-stat-num">{stats.online}</div>
                <div className="ad-stat-label">Online</div>
                <div className="ad-rate-bar">
                  <div className="ad-rate-fill" style={{ width: stats.total ? `${(stats.online / stats.total) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>
            <div className="ad-stat-card" style={{ "--card-glow": "radial-gradient(ellipse at 0% 0%, rgba(239,68,68,0.05) 0%, transparent 70%)" } as React.CSSProperties}>
              <div className="ad-stat-icon offline-ic">{Icon.offline}</div>
              <div>
                <div className="ad-stat-num">{stats.offline}</div>
                <div className="ad-stat-label">Offline</div>
              </div>
            </div>
          </div>

          {/* table card */}
          <div className="ad-table-card">

            {/* toolbar */}
            <div className="ad-toolbar">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">{Icon.search}</span>
                <input
                  className="ad-search-input"
                  type="text"
                  placeholder="Cari nama CCTV..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="ad-filter-tabs">
                {(["all", "online", "offline"] as const).map(f => (
                  <button
                    key={f}
                    className={`ad-filter-tab${statusFilter === f ? " active" : ""}`}
                    onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                  >
                    {f === "all" ? "Semua" : f === "online" ? "Online" : "Offline"}
                  </button>
                ))}
              </div>

              <span className="ad-count-badge">
                {filtered.length} dari {cameras.length} kamera
              </span>
            </div>

            {/* table */}
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Nama CCTV</th>
                    <th>Status</th>
                    <th className="td-coord">Koordinat</th>
                    <th className="td-url">Stream URL</th>
                    <th className="right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((cam, idx) => (
                      <tr key={cam.id}>
                        <td style={{ color: "#475569", fontSize: "0.78rem", fontFamily: "monospace" }}>
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td>
                          <div className="td-name">{cam.name}</div>
                          <div className="td-slug">{cam.slug}</div>
                        </td>
                        <td>
                          <span className={`status-badge ${cam.status === "online" ? "status-online" : "status-offline"}`}>
                            <span className="status-dot" />
                            {cam.status}
                          </span>
                        </td>
                        <td className="td-coord">
                          <div>{cam.latitude.toFixed(6)}</div>
                          <div>{cam.longitude.toFixed(6)}</div>
                        </td>
                        <td className="td-url" title={cam.streamurl}>{cam.streamurl}</td>
                        <td className="right">
                          <div className="ad-action-group">
                            <button className="ad-btn-icon ad-btn-edit" title="Edit" onClick={() => openEdit(cam)}>
                              {Icon.edit}
                            </button>
                            <button className="ad-btn-icon ad-btn-del" title="Hapus" onClick={() => setDeleteTarget(cam)}>
                              {Icon.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="ad-empty">
                          {Icon.map}
                          <div className="ad-empty-title">Tidak ada CCTV ditemukan</div>
                          <div className="ad-empty-sub">Coba ubah filter atau kata kunci pencarian</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="ad-pagination">
                <span className="ad-page-info">
                  Halaman {currentPage} dari {totalPages}
                  &nbsp;·&nbsp; {filtered.length} data
                </span>
                <div className="ad-page-btns">
                  <button className="ad-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                    «
                  </button>
                  <button className="ad-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    {Icon.chevLeft}
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pg = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pg}
                        className={`ad-page-btn${currentPage === pg ? " active" : ""}`}
                        onClick={() => setCurrentPage(pg)}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button className="ad-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    {Icon.chevRight}
                  </button>
                  <button className="ad-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── FORM MODAL (Create / Edit) ── */}
      {modalOpen && (
        <div className="ad-backdrop" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="ad-modal">
            <div className="ad-modal-header">
              <div className="ad-modal-title">
                {editingCamera ? "Edit CCTV" : "Tambah CCTV Baru"}
              </div>
              <button className="ad-modal-close" onClick={() => setModalOpen(false)}>{Icon.x}</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ad-modal-body">
                {formError && (
                  <div className="ad-form-error">
                    <span className="ad-form-error-text">{formError}</span>
                  </div>
                )}

                <div className="ad-form-group">
                  <label className="ad-form-label">Nama CCTV *</label>
                  <input
                    className="ad-form-input"
                    type="text"
                    placeholder="cth. CCTV Jl. Malioboro 01"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="ad-form-row">
                  <div className="ad-form-group">
                    <label className="ad-form-label">Latitude *</label>
                    <input
                      className="ad-form-input"
                      type="text"
                      placeholder="-7.797068"
                      value={formData.latitude}
                      onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))}
                    />
                  </div>
                  <div className="ad-form-group">
                    <label className="ad-form-label">Longitude *</label>
                    <input
                      className="ad-form-input"
                      type="text"
                      placeholder="110.370529"
                      value={formData.longitude}
                      onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="ad-form-group">
                  <label className="ad-form-label">Stream URL (.m3u8) *</label>
                  <input
                    className="ad-form-input"
                    type="text"
                    placeholder="https://example.com/stream.m3u8"
                    value={formData.streamurl}
                    onChange={e => setFormData(p => ({ ...p, streamurl: e.target.value }))}
                  />
                  <div className="ad-form-hint">Gunakan URL HLS (.m3u8) untuk streaming langsung</div>
                </div>

                <div className="ad-form-row">
                  <div className="ad-form-group">
                    <label className="ad-form-label">Status</label>
                    <select
                      className="ad-form-select"
                      value={formData.status}
                      onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div className="ad-form-group">
                    <label className="ad-form-label">Thumbnail URL <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(opsional)</span></label>
                    <input
                      className="ad-form-input"
                      type="text"
                      placeholder="https://example.com/thumb.jpg"
                      value={formData.thumbnail}
                      onChange={e => setFormData(p => ({ ...p, thumbnail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="ad-modal-footer">
                <button type="button" className="ad-btn-cancel" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="ad-btn-save" disabled={formLoading}>
                  {formLoading ? <><span className="btn-spin" /> Menyimpan...</> : (editingCamera ? "Simpan Perubahan" : "Tambah CCTV")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="ad-backdrop" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="ad-del-modal">
            <div className="ad-del-icon">{Icon.trash}</div>
            <div className="ad-del-title">Hapus CCTV?</div>
            <div className="ad-del-body">
              Anda akan menghapus kamera{" "}
              <span className="ad-del-name">&ldquo;{deleteTarget.name}&rdquo;</span>.
              <br />Tindakan ini tidak dapat dibatalkan.
            </div>
            <div className="ad-del-btns">
              <button className="ad-btn-cancel" onClick={() => setDeleteTarget(null)}>
                Batal
              </button>
              <button className="ad-del-confirm" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <><span className="btn-spin" /> Menghapus...</> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ad-toast ${toast.type === "ok" ? "toast-ok" : "toast-err"}`}>
          <span className="toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  );
}
