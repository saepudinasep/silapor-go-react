import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'

export default function PengaduanPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await api.get('/pengaduan/saya')
      setList(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Pengaduan Saya" eyebrow="Masyarakat">
      {loading && <p style={{ color: 'var(--muted)' }}>Memuat...</p>}

      {!loading && list.length === 0 && (
        <div className="card empty-state">
          <div className="icon">
            <svg width="42" height="42" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div className="title">Belum Ada Pengaduan</div>
          <div style={{ fontSize: 13.5 }}>Klik tombol "Laporan Baru" untuk membuat laporan pertama Anda.</div>
        </div>
      )}

      {list.map((p) => (
        <Link key={p.id_pengaduan} to={`/masyarakat/pengaduan/${p.id_pengaduan}`} style={{ display: 'block' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span className={`badge ${p.status}`}>
                <span className="badge-dot"></span>
                {p.status}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}
              </span>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.5 }}>
              {p.isi_laporan.length > 140 ? p.isi_laporan.slice(0, 140) + '...' : p.isi_laporan}
            </p>
          </div>
        </Link>
      ))}

      <Link to="/masyarakat/pengaduan/baru" className="fab">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Laporan Baru
      </Link>
    </Layout>
  )
}
