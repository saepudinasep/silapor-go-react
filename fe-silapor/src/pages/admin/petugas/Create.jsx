import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'
import { alertSuccess, alertError } from '../../../utils/swal.js'

const emptyForm = { nama_petugas: '', username: '', password: '', telp: '', level: 'petugas' }

export default function PetugasCreate() {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/petugas', form)
      alertSuccess('Petugas ditambahkan', `${form.nama_petugas} berhasil didaftarkan`)
      navigate('/admin/petugas')
    } catch (err) {
      alertError('Gagal menambahkan petugas', err.response?.data?.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout title="Tambah Petugas" eyebrow="Administrator">
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header">
          <div className="card-title">Data Petugas Baru</div>
        </div>

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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" disabled={submitting} style={{ width: 'auto' }}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link to="/admin/petugas" className="btn secondary" style={{ width: 'auto' }}>
              Batal
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}
