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

Tabel bisa dibuat otomatis lewat **auto-migrate** GORM (default saat `main.go` dijalankan), atau manual lewat file di `be/database/migrations/`:

```bash
mysql -u root -p silapor < be/database/migrations/000001_create_masyarakat_table.up.sql
mysql -u root -p silapor < be/database/migrations/000002_create_petugas_table.up.sql
mysql -u root -p silapor < be/database/migrations/000003_create_pengaduan_table.up.sql
mysql -u root -p silapor < be/database/migrations/000004_create_tanggapan_table.up.sql
```

atau bisa juga menggunakan migrate, dengan menjalankan

```bash
migrate -path database/migrations -database "mysql://root:PASSWORD_KAMU@tcp(127.0.0.1:3306)/silapor" up
```

---

## 3. Menjalankan Backend (`be/`)

```bash
cd be-silapor
cp .env.example .env
```

Edit `.env` sesuai kredensial MySQL Anda, lalu:

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

| Method   | Endpoint                           | Role                 | Keterangan                                              |
| -------- | ---------------------------------- | -------------------- | ------------------------------------------------------- |
| POST     | /api/v1/auth/masyarakat/register   | Publik               | Registrasi masyarakat                                   |
| POST     | /api/v1/auth/masyarakat/login      | Publik               | Login masyarakat                                        |
| POST     | /api/v1/auth/petugas/login         | Publik               | Login petugas/admin                                     |
| POST     | /api/v1/pengaduan                  | Masyarakat           | Buat pengaduan (multipart, field `isi_laporan`, `foto`) |
| GET      | /api/v1/pengaduan/saya             | Masyarakat           | List pengaduan milik sendiri                            |
| GET      | /api/v1/pengaduan                  | Petugas/Admin        | List semua pengaduan (`?status=`)                       |
| GET      | /api/v1/pengaduan/summary          | Petugas/Admin        | Rekap jumlah per status                                 |
| GET      | /api/v1/pengaduan/:id              | Semua role terkait   | Detail pengaduan                                        |
| PUT      | /api/v1/pengaduan/:id/status       | Petugas/Admin        | Update status                                           |
| DELETE   | /api/v1/pengaduan/:id              | Admin                | Hapus pengaduan                                         |
| GET/POST | /api/v1/pengaduan/:id/tanggapan    | Petugas/Admin (post) | Lihat/kirim tanggapan                                   |
| DELETE   | /api/v1/tanggapan/:id              | Admin                | Hapus tanggapan                                         |
| POST/GET | /api/v1/petugas                    | Admin                | Kelola petugas                                          |
| PUT      | /api/v1/petugas/:id                | Admin                | Update petugas                                          |
| PUT      | /api/v1/petugas/:id/reset-password | Admin                | Reset password petugas                                  |
| DELETE   | /api/v1/petugas/:id                | Admin                | Hapus petugas                                           |

Dokumentasi lengkap (OpenAPI): `be/docs/swagger.yaml` — import ke [Swagger Editor](https://editor.swagger.io/) untuk tampilan interaktif.

---

## 4. Menjalankan Frontend (`fe/`)

```bash
cd fe
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Pastikan `VITE_API_BASE_URL` di `.env` mengarah ke backend (`http://localhost:8080/api/v1`).

### Alur halaman

- `/` — landing page (pilih masuk sebagai masyarakat / petugas)
- `/register`, `/login` — registrasi & login masyarakat
- `/petugas/login` — login petugas/admin
- `/pengaduan/baru` — form buat pengaduan (masyarakat)
- `/pengaduan/saya` — daftar pengaduan milik sendiri (masyarakat)
- `/pengaduan/:id` — detail pengaduan + tanggapan (semua role terkait)
- `/dashboard` — rekap & daftar semua pengaduan (petugas/admin)
- `/admin/petugas` — kelola akun petugas (admin)

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

- **Connection refused ke MySQL** → pastikan service MySQL jalan & `.env` benar.
- **CORS error di frontend** → pastikan backend jalan dan `VITE_API_BASE_URL` sesuai.
- **Upload foto gagal** → pastikan folder `be/uploads/` ada (dibuat otomatis saat `main.go` start) dan `MAX_UPLOAD_MB` di `.env` cukup besar.
- **Token invalid terus** → pastikan header `Authorization: Bearer <token>` terkirim (otomatis lewat axios interceptor di frontend).

---

Selamat mengembangkan SiLapor! 🚀
