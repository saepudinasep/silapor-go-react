import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { alertSuccess, alertError } from '../utils/swal.js'

export default function Settings() {
  const { role, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profile, setProfile] = useState({ nama: '', telp: '', identifier: '', username: '' })
  const [passwordForm, setPasswordForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' })

  const isMasyarakat = role === 'masyarakat'
  const roleLabel = role === 'masyarakat' ? 'Masyarakat' : role === 'admin' ? 'Administrator' : 'Petugas'

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await api.get('/profile')
      const p = res.data.data.profile
      setProfile({
        nama: isMasyarakat ? p.nama : p.nama_petugas,
        telp: p.telp || '',
        identifier: isMasyarakat ? p.nik : p.username,
        username: p.username,
      })
    } catch (err) {
      alertError('Gagal memuat profil', err.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  function updateField(field, value) {
    setProfile((f) => ({ ...f, [field]: value }))
  }

  function updatePasswordField(field, value) {
    setPasswordForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put('/profile', { nama: profile.nama, telp: profile.telp })
      updateUser(res.data.data.profile)
      alertSuccess('Profil diperbarui', 'Perubahan berhasil disimpan')
    } catch (err) {
      alertError('Gagal menyimpan profil', err.response?.data?.message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwordForm.password_baru !== passwordForm.konfirmasi) {
      alertError('Password tidak cocok', 'Konfirmasi password baru harus sama')
      return
    }
    setSavingPassword(true)
    try {
      await api.put('/profile/password', {
        password_lama: passwordForm.password_lama,
        password_baru: passwordForm.password_baru,
      })
      setPasswordForm({ password_lama: '', password_baru: '', konfirmasi: '' })
      alertSuccess('Password diperbarui', 'Gunakan password baru saat login berikutnya')
    } catch (err) {
      alertError('Gagal mengganti password', err.response?.data?.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Layout title="Pengaturan" eyebrow={roleLabel}>
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        <>
          <div className="card" style={{ maxWidth: 520 }}>
            <div className="card-header">
              <div className="card-title">Profil Akun</div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>{isMasyarakat ? 'NIK' : 'Username'}</label>
                <input value={profile.identifier} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input value={profile.nama} onChange={(e) => updateField('nama', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>No. Telepon</label>
                <input value={profile.telp} onChange={(e) => updateField('telp', e.target.value)} />
              </div>
              <button className="btn" disabled={savingProfile} style={{ width: 'auto' }}>
                {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>

          <div className="card" style={{ maxWidth: 520 }}>
            <div className="card-header">
              <div className="card-title">Ganti Password</div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Password Lama</label>
                <input
                  type="password"
                  value={passwordForm.password_lama}
                  onChange={(e) => updatePasswordField('password_lama', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.password_baru}
                  onChange={(e) => updatePasswordField('password_baru', e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.konfirmasi}
                  onChange={(e) => updatePasswordField('konfirmasi', e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button className="btn secondary" disabled={savingPassword} style={{ width: 'auto' }}>
                {savingPassword ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </form>
          </div>
        </>
      )}
    </Layout>
  )
}
