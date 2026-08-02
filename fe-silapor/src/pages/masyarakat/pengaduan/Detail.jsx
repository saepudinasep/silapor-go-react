import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:8080/uploads'

export default function PengaduanDetail() {
  const { id } = useParams()
  const [pengaduan, setPengaduan] = useState(null)
  const [tanggapanList, setTanggapanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      setTanggapanList(tRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Detail Pengaduan" eyebrow="Masyarakat">
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      </Layout>
    )
  }

  if (!pengaduan) {
    return (
      <Layout title="Detail Pengaduan" eyebrow="Masyarakat">
        <div className="error-text">{error || 'Pengaduan tidak ditemukan'}</div>
      </Layout>
    )
  }

  return (
    <Layout title="Detail Pengaduan" eyebrow="Masyarakat">
      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
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
      </div>
    </Layout>
  )
}
