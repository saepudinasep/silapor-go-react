# SiLapor — Sistem Informasi Pelaporan Pengaduan Masyarakat

Aplikasi pengaduan masyarakat berbasis **Go (Fiber) + React (Vite)**, dengan 3 role: **Masyarakat** (pelapor), **Petugas** (menanggapi), dan **Admin** (kelola akun petugas).

Repo: `github.com/saepudinasep/silapor-go-react`

```
silapor-go-react/
├── be-silapor/     ← Backend REST API (Go + Fiber + GORM + MySQL)
└── fe-silapor/     ← Frontend (React + Vite)
```

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
migrate -path database/migrations \
  -database "mysql://root:PASSWORD_KAMU@tcp(127.0.0.1:3306)/silapor" up
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

Edit `.env` sesuai kredensial MySQL Anda. **Pastikan migration (langkah 2) sudah dijalankan lebih dulu**, baru lanjutkan:

```bash
go mod tidy
go run database/seed/seed.go   # buat akun admin awal
go run main.go
```

Backend berjalan di `http://localhost:8080`. Cek dengan:

```bash
curl http://localhost:8080/health
```

Akun admin default (sesuai `.env`): `admin` / `admin12345` (ubah `SEED_ADMIN_USERNAME` & `SEED_ADMIN_PASSWORD` sebelum seeding jika perlu).

### Endpoint utama

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | /api/v1/public/beranda | Publik (tanpa login) | Ringkasan & cuplikan pengaduan terbaru untuk landing page |
| POST | /api/v1/auth/masyarakat/register | Publik | Registrasi masyarakat |
| POST | /api/v1/auth/masyarakat/login | Publik | Login masyarakat |
| POST | /api/v1/auth/petugas/login | Publik | Login petugas/admin |
| POST | /api/v1/pengaduan | Masyarakat | Buat pengaduan (multipart, field `isi_laporan`, `foto`) |
| GET | /api/v1/pengaduan/saya | Masyarakat | List pengaduan milik sendiri |
| GET | /api/v1/pengaduan | Petugas/Admin | List semua pengaduan (`?status=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`) |
| GET | /api/v1/pengaduan/summary | Petugas/Admin | Rekap jumlah per status |
| GET | /api/v1/pengaduan/:id | Semua role terkait | Detail pengaduan |
| PUT | /api/v1/pengaduan/:id/status | Petugas/Admin | Update status |
| DELETE | /api/v1/pengaduan/:id | Admin | Hapus pengaduan |
| GET/POST | /api/v1/pengaduan/:id/tanggapan | Petugas/Admin (post) | Lihat/kirim tanggapan |
| DELETE | /api/v1/tanggapan/:id | Admin | Hapus tanggapan |
| POST/GET | /api/v1/petugas | Admin | Kelola petugas |
| PUT | /api/v1/petugas/:id | Admin | Update petugas |
| PUT | /api/v1/petugas/:id/reset-password | Admin | Reset password petugas |
| DELETE | /api/v1/petugas/:id | Admin | Hapus petugas |
| GET | /api/v1/profile | Semua role | Lihat profil akun sendiri |
| PUT | /api/v1/profile | Semua role | Update nama/telp akun sendiri |
| PUT | /api/v1/profile/password | Semua role | Ganti password akun sendiri |

Dokumentasi lengkap (OpenAPI): `be/docs/swagger.yaml` — import ke [Swagger Editor](https://editor.swagger.io/) untuk tampilan interaktif.

---

## 4. Menjalankan Frontend (`fe-silapor/`)

```bash
cd fe-silapor
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Pastikan `VITE_API_BASE_URL` di `.env` mengarah ke backend (`http://localhost:8080/api/v1`).

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

Hasil build ada di `fe/dist/`, siap di-deploy ke Vercel/Netlify/static hosting apa pun.

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

- **`Error 1146: Table 'silapor.xxx' doesn't exist`** → migration belum dijalankan. Jalankan perintah `migrate -path database/migrations -database "..." up` di langkah 2 terlebih dahulu.
- **Connection refused ke MySQL** → pastikan service MySQL jalan & `.env` benar.
- **CORS error di frontend** → pastikan backend jalan dan `VITE_API_BASE_URL` sesuai.
- **Upload foto gagal** → pastikan folder `be/uploads/` ada (dibuat otomatis saat `main.go` start) dan `MAX_UPLOAD_MB` di `.env` cukup besar.
- **Token invalid terus** → pastikan header `Authorization: Bearer <token>` terkirim (otomatis lewat axios interceptor di frontend).

---

Selamat mengembangkan SiLapor! 🚀
