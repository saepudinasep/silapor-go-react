import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { alertSuccess, alertError } from '../utils/swal.js'

export default function RegisterMasyarakat() {
  const [form, setForm] = useState({ nik: '', nama: '', username: '', password: '', telp: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/masyarakat/register', form)
      await alertSuccess('Registrasi berhasil', 'Silakan masuk dengan akun Anda')
      navigate('/login')
    } catch (err) {
      alertError('Registrasi gagal', err.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="hero-bg"></div>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <div className="auth-logo-text">SiLapor</div>
            <div className="auth-logo-sub">Pengaduan Masyarakat</div>
          </div>
        </div>

        <h1>Daftar Akun</h1>
        <p className="subtitle">Buat akun untuk mulai melaporkan pengaduan</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NIK (16 digit)</label>
            <input
              value={form.nik}
              onChange={(e) => update('nik', e.target.value)}
              maxLength={16}
              required
            />
          </div>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input value={form.nama} onChange={(e) => update('nama', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={(e) => update('username', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>No. Telepon</label>
            <input value={form.telp} onChange={(e) => update('telp', e.target.value)} />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="switch-link">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </div>
      </div>
    </div>
  )
}
