import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'

const STATUS_TABS = [
  { key: '', label: 'Semua' },
  { key: 'baru', label: 'Baru' },
  { key: 'proses', label: 'Proses' },
  { key: 'selesai', label: 'Selesai' },
]

export default function PengaduanPage() {
  const [summary, setSummary] = useState({ baru: 0, proses: 0, selesai: 0 })
  const [list, setList] = useState([])
  const [activeStatus, setActiveStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  useEffect(() => {
    fetchList()
  }, [activeStatus])

  async function fetchSummary() {
    try {
      const res = await api.get('/pengaduan/summary')
      setSummary(res.data.data || { baru: 0, proses: 0, selesai: 0 })
    } catch {
      // diamkan, dashboard tetap tampil dengan angka default
    }
  }

  async function fetchList() {
    setLoading(true)
    try {
      const res = await api.get('/pengaduan', { params: activeStatus ? { status: activeStatus } : {} })
      setList(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Dashboard" eyebrow="Ringkasan Pengaduan">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{summary.baru ?? 0}</div>
          <div className="stat-label">Pengaduan Baru</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-val">{summary.proses ?? 0}</div>
          <div className="stat-label">Sedang Diproses</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-val">{summary.selesai ?? 0}</div>
          <div className="stat-label">Selesai</div>
        </div>
      </div>

      <div className="filter-bar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeStatus === tab.key ? 'active' : ''}
            onClick={() => setActiveStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card table-card">
        <div className="card-header">
          <div className="card-title">Daftar Pengaduan</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pelapor</th>
                <th>Isi Laporan</th>
                <th>Status</th>
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
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Tidak ada pengaduan
                  </td>
                </tr>
              )}
              {list.map((p) => (
                <tr key={p.id_pengaduan}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                    {new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}
                  </td>
                  <td>{p.masyarakat?.nama || '-'}</td>
                  <td>{p.isi_laporan.length > 60 ? p.isi_laporan.slice(0, 60) + '...' : p.isi_laporan}</td>
                  <td>
                    <span className={`badge ${p.status}`}>
                      <span className="badge-dot"></span>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/petugas/pengaduan/${p.id_pengaduan}`} className="btn btn-small secondary">
                      Detail
                    </Link>
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
