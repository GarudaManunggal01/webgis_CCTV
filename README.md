# 🎥 Pantau Jogja — WebGIS CCTV DIY

Aplikasi WebGIS untuk monitoring CCTV di Daerah Istimewa Yogyakarta secara real-time. Menampilkan persebaran 151 titik CCTV pada peta interaktif dengan streaming video langsung.

## ✨ Fitur

- 🗺️ **Peta Interaktif** — Leaflet-based map dengan marker CCTV
- 📹 **Live Streaming** — Video CCTV real-time via HLS protocol
- 🔍 **Pencarian** — Cari CCTV berdasarkan nama lokasi
- 🏷️ **Filter** — Filter CCTV berdasarkan status (Online/Offline)
- 📍 **Nearest CCTV** — Temukan CCTV terdekat dari lokasi Anda
- 🔗 **Cluster Marker** — Pengelompokan marker pada zoom rendah
- 🔐 **Admin Dashboard** — CRUD data CCTV dengan autentikasi JWT
- 📊 **Statistik** — Jumlah total, online, dan offline CCTV

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| GIS | Leaflet + React Leaflet |
| Streaming | HLS.js |
| ORM | Prisma 7 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |
| Language | TypeScript |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd webgis_cctv

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dan sesuaikan JWT_SECRET

# Setup database
npx prisma migrate dev

# Seed data (CCTV + Admin user)
npm run seed

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Default Admin Credentials

```
Username: admin
Password: admin123
```

## 📁 Struktur Proyek

```
webgis_cctv/
├── app/
│   ├── admin/           # Halaman admin dashboard
│   ├── api/             # API routes (auth, cctv)
│   ├── components/      # React components (Map, HlsPlayer)
│   ├── data/            # Static data (seed CCTV)
│   ├── login/           # Halaman login
│   ├── types.ts         # Shared TypeScript types
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage (peta)
├── lib/                 # Utilities (auth, prisma)
├── prisma/              # Database schema & migrations
├── public/              # Static assets (icons, leaflet)
├── middleware.ts        # Route protection
└── package.json
```

## 📝 Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

## 📄 License

Project ini dibuat untuk keperluan akademik.
