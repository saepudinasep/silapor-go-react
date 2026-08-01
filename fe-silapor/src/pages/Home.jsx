import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'

const LogoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
)

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Home() {
  const [summary, setSummary] = useState({ total: 0, baru: 0, proses: 0, selesai: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBeranda()
  }, [])

  async function fetchBeranda() {
    setLoading(true)
    try {
      const res = await api.get('/public/beranda')
      setSummary(res.data.data.summary || { total: 0, baru: 0, proses: 0, selesai: 0 })
      setRecent(res.data.data.recent || [])
    } catch {
      // landing page tetap tampil walau data pengaduan gagal dimuat
    } finally {
      setLoading(false)
    }
  }

  function scrollToPengaduan() {
    document.getElementById('pengaduan-publik')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing">
      <div className="hero-bg"></div>

      {/* ── NAVBAR ── */}
      <div className="public-navbar">
        <div className="logo-mark">
          <div className="logo-icon">
            <LogoIcon />
          </div>
          <div>
            <div className="logo-text">SiLapor</div>
            <div className="logo-sub">Desa Ciuyah</div>
          </div>
        </div>
        <div className="public-navbar-spacer"></div>
        <div className="public-navbar-actions">
          <Link to="/login" className="btn secondary">
            Masuk
          </Link>
          <Link to="/register" className="btn">
            Buat Laporan
          </Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <LogoIcon size={13} />
          Layanan Resmi Pemerintah Desa Ciuyah
        </div>
        <h1 className="hero-title">
          Sampaikan Pengaduan, <span>Wujudkan Desa</span> yang Lebih Baik
        </h1>
        <p className="hero-sub">
          SiLapor adalah kanal resmi bagi warga Desa Ciuyah untuk melaporkan masalah di lingkungan —
          jalan rusak, fasilitas umum, kebersihan, dan lainnya. Setiap laporan dipantau dan ditindaklanjuti
          langsung oleh petugas desa secara transparan.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn">
            Buat Laporan Sekarang
          </Link>
          <button className="btn secondary" onClick={scrollToPengaduan}>
            Lihat Pengaduan Warga
          </button>
        </div>
      </section>

      {/* ── STATISTIK ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="landing-stats">
          <div className="landing-stat-card">
            <div className="landing-stat-val">{loading ? '–' : summary.total}</div>
            <div className="landing-stat-label">Total Laporan</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-val" style={{ color: '#60a5fa' }}>
              {loading ? '–' : summary.baru}
            </div>
            <div className="landing-stat-label">Laporan Baru</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-val" style={{ color: 'var(--amber)' }}>
              {loading ? '–' : summary.proses}
            </div>
            <div className="landing-stat-label">Sedang Diproses</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-val" style={{ color: 'var(--teal)' }}>
              {loading ? '–' : summary.selesai}
            </div>
            <div className="landing-stat-label">Selesai Ditangani</div>
          </div>
        </div>
      </section>

      {/* ── PENGADUAN PUBLIK ── */}
      <section className="section" id="pengaduan-publik">
        <div className="section-header">
          <div className="section-eyebrow">Transparansi</div>
          <h2 className="section-title">Pengaduan Terbaru dari Warga</h2>
          <p className="section-sub">
            Sebagian laporan yang masuk — baik yang masih diproses maupun yang sudah selesai ditangani.
            Nama pelapor disamarkan demi privasi.
          </p>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Memuat data pengaduan...</p>}

        {!loading && recent.length === 0 && (
          <div className="card empty-state" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="title">Belum Ada Pengaduan</div>
            <div style={{ fontSize: 13.5 }}>Jadilah warga pertama yang melaporkan sesuatu.</div>
          </div>
        )}

        <div className="pengaduan-grid">
          {recent.map((p) => (
            <div key={p.id_pengaduan} className="pengaduan-public-card">
              <div className="pc-top">
                <span className={`badge ${p.status}`}>
                  <span className="badge-dot"></span>
                  {p.status}
                </span>
                <span className="pc-date">{formatDate(p.tgl_pengaduan)}</span>
              </div>
              <div className="pc-text">{p.isi_laporan}</div>
              <div className="pc-footer">
                <div className="pc-avatar">{p.pelapor.charAt(0).toUpperCase()}</div>
                Dilaporkan oleh {p.pelapor}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TENTANG / CARA KERJA ── */}
      <section className="section">
        <div className="about-grid">
          <div>
            <div className="section-eyebrow">Cara Kerja</div>
            <h2 className="section-title" style={{ marginBottom: 24 }}>
              Tiga Langkah Mudah Melapor
            </h2>

            <div className="about-feature">
              <div className="about-feature-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-1.415l-4.98 2.68a2.25 2.25 0 01-2.134 0l-4.98-2.68m19.5-3.02l-2.02-1.089a2.25 2.25 0 00-2.133 0L15 9.75M4.5 6.75l2.02-1.089a2.25 2.25 0 012.133 0L11.25 9.75"
                  />
                </svg>
              </div>
              <div>
                <div className="about-feature-title">1. Daftar & Masuk</div>
                <div className="about-feature-text">Buat akun dengan NIK Anda, cukup sekali untuk seterusnya.</div>
              </div>
            </div>

            <div className="about-feature">
              <div className="about-feature-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div>
                <div className="about-feature-title">2. Tulis Laporan</div>
                <div className="about-feature-text">
                  Jelaskan masalah yang Anda temui, lampirkan foto bukti jika ada.
                </div>
              </div>
            </div>

            <div className="about-feature">
              <div className="about-feature-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="about-feature-title">3. Pantau Tindak Lanjut</div>
                <div className="about-feature-text">
                  Petugas desa akan menanggapi dan memperbarui status laporan Anda secara berkala.
                </div>
              </div>
            </div>
          </div>

          <div className="about-visual">
            <div style={{ color: 'var(--teal)', marginBottom: 16 }}>
              <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" style={{ margin: '0 auto' }}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              Kantor Desa Ciuyah
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
              Ciuyah, Kecamatan Waled
              <br />
              Kabupaten Cirebon, Jawa Barat
              <br />
              Senin–Jumat, 08.00–15.00 WIB
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="section-title">Ada Masalah di Lingkungan Anda?</h2>
        <p className="section-sub" style={{ maxWidth: 460, margin: '0 auto 26px' }}>
          Jangan biarkan berlarut — laporkan sekarang dan bantu petugas desa menindaklanjuti dengan cepat.
        </p>
        <Link to="/register" className="btn" style={{ width: 'auto', padding: '13px 28px', display: 'inline-flex' }}>
          Buat Laporan Sekarang
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="public-footer">
        <span>© {new Date().getFullYear()} SiLapor — Pemerintah Desa Ciuyah</span>
        <span>
          Petugas/Admin? <Link to="/petugas/login">Masuk di sini</Link>
        </span>
      </footer>
    </div>
  )
}
