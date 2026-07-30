import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="auth-shell">
      <div className="hero-bg"></div>
      <div className="auth-card" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="auth-logo-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="auth-logo-text">SiLapor</div>
            <div className="auth-logo-sub">Pengaduan Masyarakat</div>
          </div>
        </div>

        <p className="subtitle" style={{ marginBottom: 24 }}>
          Sistem Informasi Pelaporan Pengaduan Masyarakat
        </p>

        <Link to="/login" className="btn" style={{ marginBottom: 10, display: 'flex' }}>
          Masuk sebagai Masyarakat
        </Link>
        <Link to="/register" className="btn secondary" style={{ marginBottom: 10, display: 'flex' }}>
          Daftar Akun Masyarakat
        </Link>
        <Link to="/petugas/login" className="btn secondary" style={{ display: 'flex' }}>
          Masuk sebagai Petugas / Admin
        </Link>
      </div>
    </div>
  )
}
