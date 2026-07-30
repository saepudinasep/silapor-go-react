import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import Layout from '../components/Layout.jsx'

const emptyForm = { nama_petugas: '', username: '', password: '', telp: '', level: 'petugas' }

export default function PetugasManage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await api.get('/petugas')
      setList(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/petugas', form)
      setSuccess('Petugas berhasil ditambahkan')
      setForm(emptyForm)
      await fetchList()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan petugas')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus petugas ini?')) return
    try {
      await api.delete(`/petugas/${id}`)
      await fetchList()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus petugas')
    }
  }

  async function handleResetPassword(id) {
    const newPassword = prompt('Masukkan password baru untuk petugas ini:')
    if (!newPassword) return
    try {
      await api.put(`/petugas/${id}/reset-password`, { password: newPassword })
      setSuccess('Password berhasil direset')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password')
    }
  }

  const totalAdmin = list.filter((p) => p.level === 'admin').length
  const totalPetugas = list.filter((p) => p.level === 'petugas').length

  return (
    <Layout title="Manajemen Pengguna" eyebrow="Administrator">
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card rose">
          <div className="stat-val">{totalAdmin}</div>
          <div className="stat-label">Administrator</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-val">{totalPetugas}</div>
          <div className="stat-label">Petugas</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Tambah Petugas</div>
        </div>
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Petugas</label>
            <input value={form.nama_petugas} onChange={(e) => update('nama_petugas', e.target.value)} required />
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
          <div className="form-group">
            <label>Level</label>
            <select className="form-select" value={form.level} onChange={(e) => update('level', e.target.value)}>
              <option value="petugas">petugas</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button className="btn" disabled={submitting} style={{ width: 'auto' }}>
            {submitting ? 'Menyimpan...' : 'Tambah Petugas'}
          </button>
        </form>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <div className="card-title">Daftar Pengguna</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Telp</th>
                <th>Level</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading &&
                list.map((p) => (
                  <tr key={p.id_petugas}>
                    <td>{p.nama_petugas}</td>
                    <td>{p.username}</td>
                    <td>{p.telp || '-'}</td>
                    <td>
                      <span className={`role-pill ${p.level}`}>{p.level}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-small secondary"
                        style={{ marginRight: 6 }}
                        onClick={() => handleResetPassword(p.id_petugas)}
                      >
                        Reset Password
                      </button>
                      <button className="btn btn-small danger" onClick={() => handleDelete(p.id_petugas)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
