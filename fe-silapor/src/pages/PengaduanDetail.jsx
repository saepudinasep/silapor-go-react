import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios.js'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { alertSuccess, alertError } from '../utils/swal.js'

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:8080/uploads'

export default function PengaduanDetail() {
  const { id } = useParams()
  const { role } = useAuth()
  const [pengaduan, setPengaduan] = useState(null)
  const [tanggapanList, setTanggapanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [balasan, setBalasan] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isPetugasOrAdmin = role === 'petugas' || role === 'admin'

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/pengaduan/${id}`),
        api.get(`/pengaduan/${id}/tanggapan`),
      ])
      setPengaduan(pRes.data.data)
      setStatusValue(pRes.data.data.status)
      setTanggapanList(tRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  async function handleKirimTanggapan(e) {
    e.preventDefault()
    if (!balasan.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/pengaduan/${id}/tanggapan`, { tanggapan: balasan })
      setBalasan('')
      await fetchData()
      alertSuccess('Tanggapan terkirim', 'Status pengaduan otomatis diperbarui')
    } catch (err) {
      alertError('Gagal mengirim tanggapan', err.response?.data?.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateStatus(newStatus) {
    try {
      await api.put(`/pengaduan/${id}/status`, { status: newStatus })
      setStatusValue(newStatus)
      await fetchData()
      alertSuccess('Status diperbarui', `Status kini: ${newStatus}`)
    } catch (err) {
      alertError('Gagal memperbarui status', err.response?.data?.message)
    }
  }

  if (loading) {
    return (
      <Layout title="Detail Pengaduan">
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      </Layout>
    )
  }

  if (!pengaduan) {
    return (
      <Layout title="Detail Pengaduan">
        <div className="error-text">{error || 'Pengaduan tidak ditemukan'}</div>
      </Layout>
    )
  }

  return (
    <Layout title="Detail Pengaduan" eyebrow={isPetugasOrAdmin ? 'Petugas' : 'Masyarakat'}>
      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge ${pengaduan.status}`}>
            <span className="badge-dot"></span>
            {pengaduan.status}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {new Date(pengaduan.tgl_pengaduan).toLocaleString('id-ID')}
          </span>
        </div>

        <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.65 }}>{pengaduan.isi_laporan}</p>

        {pengaduan.foto && (
          <img className="foto-preview" src={`${UPLOADS_BASE}/${pengaduan.foto}`} alt="Bukti pengaduan" />
        )}

        {pengaduan.masyarakat?.nama && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
            Pelapor: <strong style={{ color: 'var(--text)' }}>{pengaduan.masyarakat.nama}</strong>
          </p>
        )}

        {isPetugasOrAdmin && (
          <div className="form-group" style={{ marginTop: 18, maxWidth: 220 }}>
            <label>Ubah Status</label>
            <select className="form-select" value={statusValue} onChange={(e) => handleUpdateStatus(e.target.value)}>
              <option value="baru">baru</option>
              <option value="proses">proses</option>
              <option value="selesai">selesai</option>
            </select>
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header">
          <div className="card-title">Tanggapan</div>
        </div>

        {tanggapanList.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Belum ada tanggapan dari petugas.</p>
        )}

        {tanggapanList.map((t) => (
          <div key={t.id_tanggapan} className="tanggapan-item">
            <div>{t.tanggapan}</div>
            <div className="meta">
              {t.petugas?.nama_petugas || 'Petugas'} · {new Date(t.tgl_tanggapan).toLocaleString('id-ID')}
            </div>
          </div>
        ))}

        {isPetugasOrAdmin && (
          <form onSubmit={handleKirimTanggapan} style={{ marginTop: 18 }}>
            <div className="form-group">
              <label>Tulis Tanggapan</label>
              <textarea rows={3} value={balasan} onChange={(e) => setBalasan(e.target.value)} required />
            </div>
            <button className="btn" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Tanggapan'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
