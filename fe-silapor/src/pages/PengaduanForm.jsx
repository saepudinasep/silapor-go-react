import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import Layout from '../components/Layout.jsx'

export default function PengaduanForm() {
  const [isiLaporan, setIsiLaporan] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoName, setFotoName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleFileChange(e) {
    const file = e.target.files[0]
    setFoto(file)
    setFotoName(file ? file.name : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('isi_laporan', isiLaporan)
      if (foto) formData.append('foto', foto)

      await api.post('/pengaduan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/pengaduan/saya')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pengaduan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Buat Laporan" eyebrow="Masyarakat">
      <div className="card" style={{ maxWidth: 560 }}>
        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Isi Laporan</label>
            <textarea
              rows={6}
              value={isiLaporan}
              onChange={(e) => setIsiLaporan(e.target.value)}
              placeholder="Jelaskan detail kejadian/pengaduan Anda..."
              required
            />
          </div>
          <div className="form-group">
            <label>Foto Bukti (opsional)</label>
            <label className="file-drop" htmlFor="foto-input">
              {fotoName || 'Klik untuk pilih foto, atau seret file ke sini'}
            </label>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
