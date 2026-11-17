# SiLapor — Sistem Informasi Pelaporan Pengaduan Masyarakat

Aplikasi pengaduan masyarakat berbasis **Go (Fiber) + React (Vite)**, dengan 3 role: **Masyarakat** (pelapor), **Petugas** (menanggapi), dan **Admin** (kelola akun petugas).

Repo: `github.com/saepudinasep/silapor-go-react`

```
silapor-go-react/
├── be-silapor/     ← Backend REST API (Go + Fiber + GORM + MySQL)
└── fe-silapor/     ← Frontend (React + Vite)
```

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Setup Database](#2-setup-database)
3. [Menjalankan Backend](#3-menjalankan-backend-be-silapor)
4. [Menjalankan Frontend](#4-menjalankan-frontend-fe-silapor)
5. [Alur Aplikasi Singkat](#5-alur-aplikasi-singkat)
6. [Struktur Backend (Clean Architecture)](#6-struktur-backend-clean-architecture)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prasyarat

- **Go** 1.22+ → `go version`
- **Node.js** 18+ dan **npm** → `node -v`
- **MySQL** 5.7+/8.x
- **Git**

---

## 2. Setup Database

```sql
CREATE DATABASE silapor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Penting:** aplikasi ini **tidak** membuat tabel secara otomatis (auto-migrate GORM sudah dinonaktifkan). Tabel **wajib** dibuat lebih dulu lewat migration manual menggunakan [`golang-migrate`](https://github.com/golang-migrate/migrate).

### Install golang-migrate CLI (sekali saja)

```bash
go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

### Jalankan migration

Dari folder `be-silapor/`:

```bash
cd be-silapor
migrate -path database/migrations -database "mysql://root:PASSWORD_KAMU@tcp(127.0.0.1:3306)/silapor" up
```

Ganti `root:PASSWORD_KAMU` sesuai user & password MySQL kamu, dan `silapor` jika nama database berbeda.

Perintah ini akan menjalankan berurutan:

- `000001_create_masyarakat_table.up.sql`
- `000002_create_petugas_table.up.sql`
- `000003_create_pengaduan_table.up.sql`
- `000004_create_tanggapan_table.up.sql`

### Rollback (jika perlu)

```bash
migrate -path database/migrations \
  -database "mysql://root:PASSWORD_KAMU@tcp(127.0.0.1:3306)/silapor" down
```

### Cek versi migration saat ini

```bash
migrate -path database/migrations \
  -database "mysql://root:PASSWORD_KAMU@tcp(127.0.0.1:3306)/silapor" version
```

---

## 3. Menjalankan Backend (`be-silapor/`)

```bash
cd be-silapor
cp .env.example .env
```

Edit `.env` sesuai kredensial MySQL Anda, contoh:

```env
# =========================
# APP CONFIG
# =========================
APP_NAME=silapor-api
APP_PORT=8081
APP_ENV=local

# =========================
# DATABASE CONFIG (MySQL)
# =========================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=silapor
DB_CHARSET=utf8mb4
DB_SSL_MODE=disable

# =========================
# JWT CONFIG
# =========================
JWT_SECRET=change-this-to-a-very-long-random-secret
JWT_EXPIRES_HOURS=24

# =========================
# UPLOAD
# =========================
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=5

# =========================
# SEEDER
# =========================
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=admin12345
```

**Pastikan migration (langkah 2) sudah dijalankan lebih dulu**, baru lanjutkan:

```bash
go mod tidy
go run database/seed/seed.go   # buat akun admin awal
go run main.go
```

Backend berjalan di `http://localhost:8081`. Cek dengan:

```bash
curl http://localhost:8081/health
```

Akun admin default (sesuai `.env`): `admin` / `admin12345` (ubah `SEED_ADMIN_USERNAME` & `SEED_ADMIN_PASSWORD` sebelum seeding jika perlu).

### Endpoint utama

| Method   | Endpoint                           | Role                 | Keterangan                                                                  |
| -------- | ---------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| GET      | /api/v1/public/beranda             | Publik (tanpa login) | Ringkasan & cuplikan pengaduan terbaru untuk landing page                   |
| POST     | /api/v1/auth/masyarakat/register   | Publik               | Registrasi masyarakat                                                       |
| POST     | /api/v1/auth/masyarakat/login      | Publik               | Login masyarakat                                                            |
| POST     | /api/v1/auth/petugas/login         | Publik               | Login petugas/admin                                                         |
| POST     | /api/v1/pengaduan                  | Masyarakat           | Buat pengaduan (multipart, field `isi_laporan`, `foto`)                     |
| GET      | /api/v1/pengaduan/saya             | Masyarakat           | List pengaduan milik sendiri                                                |
| GET      | /api/v1/pengaduan                  | Petugas/Admin        | List semua pengaduan (`?status=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`) |
| GET      | /api/v1/pengaduan/summary          | Petugas/Admin        | Rekap jumlah per status                                                     |
| GET      | /api/v1/pengaduan/:id              | Semua role terkait   | Detail pengaduan                                                            |
| PUT      | /api/v1/pengaduan/:id/status       | Petugas/Admin        | Update status                                                               |
| DELETE   | /api/v1/pengaduan/:id              | Admin                | Hapus pengaduan                                                             |
| GET/POST | /api/v1/pengaduan/:id/tanggapan    | Petugas/Admin (post) | Lihat/kirim tanggapan                                                       |
| DELETE   | /api/v1/tanggapan/:id              | Admin                | Hapus tanggapan                                                             |
| POST/GET | /api/v1/petugas                    | Admin                | Kelola petugas                                                              |
| PUT      | /api/v1/petugas/:id                | Admin                | Update petugas                                                              |
| PUT      | /api/v1/petugas/:id/reset-password | Admin                | Reset password petugas                                                      |
| DELETE   | /api/v1/petugas/:id                | Admin                | Hapus petugas                                                               |
| GET      | /api/v1/profile                    | Semua role           | Lihat profil akun sendiri                                                   |
| PUT      | /api/v1/profile                    | Semua role           | Update nama/telp akun sendiri                                               |
| PUT      | /api/v1/profile/password           | Semua role           | Ganti password akun sendiri                                                 |

Dokumentasi lengkap (OpenAPI): `be-silapor/docs/swagger.yaml` — import ke [Swagger Editor](https://editor.swagger.io/) untuk tampilan interaktif.

---

## 4. Menjalankan Frontend (`fe-silapor/`)

```bash
cd fe-silapor
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Pastikan `VITE_API_BASE_URL` di `.env` mengarah ke backend (`http://localhost:8081/api/v1`).

### Alur halaman

- `/` — **landing page desa**: hero, statistik pengaduan (total/baru/proses/selesai), cuplikan pengaduan warga terbaru (nama disamarkan demi privasi), cara kerja, info kontak desa, CTA daftar/masuk
- `/register`, `/login` — registrasi & login masyarakat
- `/petugas/login` — login petugas/admin
- `/pengaduan/baru` — form buat pengaduan (masyarakat)
- `/pengaduan/saya` — daftar pengaduan milik sendiri (masyarakat)
- `/pengaduan/:id` — detail pengaduan + tanggapan (semua role terkait)
- `/dashboard` — rekap & daftar semua pengaduan (petugas/admin)
- `/laporan` — generate laporan rekap dengan filter tanggal & status, export ke PDF/Excel (petugas/admin)
- `/admin/petugas` — kelola akun petugas (admin)
- `/pengaturan` — ubah profil & ganti password akun sendiri (semua role yang login)

Build untuk production:

```bash
npm run build
```

Hasil build ada di `fe-silapor/dist/`.

### Deploy ke VPS dengan Docker

Project ini dijalankan di **VPS (self-hosted)** menggunakan **Docker** — bukan platform hosting pihak ketiga. Ada 3 file utama:

```
silapor-go-react/
├── docker-compose.yml
├── .env                    ← untuk docker-compose (copy dari .env.example)
├── be-silapor/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env                ← env backend, tetap dipakai container (lihat langkah 3)
└── fe-silapor/
    ├── Dockerfile
    ├── .dockerignore
    └── nginx.conf
```

**Ringkasan tiap service:**

- **`mysql`** — image `mysql:8.0`, data disimpan di volume `silapor-mysql-data` (persist walau container dihapus).
- **`backend`** — di-build dari `be-silapor/Dockerfile` (multi-stage Go build), binary `migrate` CLI ikut di-bundle di image supaya migration bisa dijalankan dari dalam container. Folder upload disimpan di volume `silapor-uploads`.
- **`frontend`** — di-build dari `fe-silapor/Dockerfile` (multi-stage: `npm run build` lalu di-serve pakai Nginx), termasuk `nginx.conf` khusus SPA (fallback semua route ke `index.html`).

#### Langkah menjalankan

1. Copy `.env.example` di root project menjadi `.env`, lalu sesuaikan `DB_PASSWORD`, `APP_PORT`, dan `VITE_API_BASE_URL` (arahkan ke domain/IP VPS kamu).
2. Pastikan `be-silapor/.env` sudah ada (hasil `cp .env.example .env` di langkah 3) — nilai `DB_HOST` dan `DB_PORT` di sana akan **di-override otomatis** oleh `docker-compose.yml` supaya mengarah ke container `mysql`.
3. Build & jalankan seluruh stack:
   ```bash
   docker compose up -d --build
   ```
4. Jalankan migration di dalam container backend (sekali saja, atau setiap ada migration baru):
   ```bash
   docker compose exec backend migrate -path database/migrations \
     -database "mysql://root:${DB_PASSWORD}@tcp(mysql:3306)/${DB_NAME}" up
   ```
5. Jalankan seeder admin (sekali saja, saat pertama kali setup):
   ```bash
   docker compose exec backend go run database/seed/seed.go
   ```
   > Jika binary `go` tidak tersedia di image runtime, jalankan seeder sebelum build image (lokal) atau tambahkan langkah seeding terpisah di image builder.
6. Cek status semua container:
   ```bash
   docker compose ps
   ```
7. Akses aplikasi:
   - Frontend: `http://IP_VPS:8081`
   - Backend health check: `http://IP_VPS:${APP_PORT}/health`

#### Reverse proxy & domain (opsional, direkomendasikan)

Untuk production sebaiknya taruh **Nginx atau Caddy** di level VPS (di luar Docker, atau sebagai container tambahan) sebagai reverse proxy ke port `8081` (frontend) dan `${APP_PORT}` (backend), sekaligus menangani SSL lewat Let's Encrypt/Certbot.

#### Perintah Docker yang sering dipakai

```bash
docker compose logs -f backend      # lihat log backend realtime
docker compose logs -f frontend     # lihat log frontend realtime
docker compose down                 # stop semua container (data volume tetap aman)
docker compose down -v              # stop semua container + hapus volume (data hilang!)
docker compose up -d --build backend  # rebuild ulang backend saja setelah ada perubahan kode
```

---

## 5. Alur Aplikasi Singkat

1. **Masyarakat** daftar & login → membuat pengaduan (teks + foto opsional) → status awal `baru`.
2. **Petugas/Admin** login → melihat dashboard rekap & daftar pengaduan → membuka detail → memberi tanggapan (status otomatis berubah ke `proses`) → mengubah status manual sampai `selesai`.
3. **Admin** juga bisa mengelola akun petugas (tambah, reset password, hapus).

---

## 6. Struktur Backend (Clean Architecture)

```
Client → routes → middleware (JWT/role) → controllers → services → repositories → models → MySQL
```

Setiap layer punya tanggung jawab terpisah agar mudah di-maintain dan dikembangkan.

---

## 7. Troubleshooting

| Masalah                                         | Solusi                                                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Error 1146: Table 'silapor.xxx' doesn't exist` | Migration belum dijalankan. Jalankan `migrate -path database/migrations -database "..." up` (lihat langkah 2).              |
| Connection refused ke MySQL                     | Pastikan service MySQL jalan & kredensial di `.env` sudah benar.                                                            |
| CORS error di frontend                          | Pastikan backend jalan dan `VITE_API_BASE_URL` di `.env` frontend sudah sesuai.                                             |
| Upload foto gagal                               | Pastikan folder `be-silapor/uploads/` ada (dibuat otomatis saat `main.go` start) dan `MAX_UPLOAD_MB` di `.env` cukup besar. |
| Token invalid terus                             | Pastikan header `Authorization: Bearer <token>` terkirim (otomatis lewat axios interceptor di frontend).                    |
| `Access denied for user 'root'@'localhost'`     | Cek kembali `DB_USER` dan `DB_PASSWORD` di `.env` sesuai konfigurasi MySQL lokal Anda.                                      |

---

Selamat mengembangkan SiLapor! 🚀
