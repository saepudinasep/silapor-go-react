import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'
import { alertSuccess, alertError } from '../../../utils/swal.js'

export default function PetugasUpdate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama_petugas: '', username: '', telp: '', level: 'petugas' })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchData() {
    setLoading(true)
    setNotFound(false)
    try {
      // Backend belum menyediakan endpoint GET /petugas/:id, jadi data
      // diambil dari daftar lengkap lalu dicari sesuai id di URL.
      const res = await api.get('/petugas')
      const found = (res.data.data || []).find((p) => String(p.id_petugas) === String(id))
      if (!found) {
        setNotFound(true)
      } else {
        setForm({
          nama_petugas: found.nama_petugas || '',
          username: found.username || '',
          telp: found.telp || '',
          level: found.level || 'petugas',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/petugas/${id}`, {
        nama_petugas: form.nama_petugas,
        telp: form.telp,
        level: form.level,
      })
      alertSuccess('Petugas diperbarui', `${form.nama_petugas} berhasil disimpan`)
      navigate('/admin/petugas')
    } catch (err) {
      alertError('Gagal memperbarui petugas', err.response?.data?.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Edit Petugas" eyebrow="Administrator">
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      </Layout>
    )
  }

  if (notFound) {
    return (
      <Layout title="Edit Petugas" eyebrow="Administrator">
        <div className="card">
          <p className="error-text">Data petugas tidak ditemukan.</p>
          <Link to="/admin/petugas" className="btn secondary" style={{ width: 'auto', marginTop: 12 }}>
            Kembali ke Daftar
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Edit Petugas" eyebrow="Administrator">
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header">
          <div className="card-title">Ubah Data Petugas</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Petugas</label>
            <input value={form.nama_petugas} onChange={(e) => update('nama_petugas', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} disabled title="Username tidak bisa diubah" />
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
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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
