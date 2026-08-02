import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../api/axios.js'
import Layout from '../../../components/Layout.jsx'
import { alertSuccess, alertError, confirmAction, promptInput } from '../../../utils/swal.js'

export default function PetugasPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

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

  async function handleDelete(id, nama) {
    const ok = await confirmAction({
      title: 'Hapus petugas?',
      text: `Akun "${nama}" akan dihapus permanen dan tidak bisa dikembalikan.`,
      confirmText: 'Ya, hapus',
      danger: true,
    })
    if (!ok) return

    try {
      await api.delete(`/petugas/${id}`)
      alertSuccess('Petugas dihapus', `${nama} berhasil dihapus`)
      await fetchList()
    } catch (err) {
      alertError('Gagal menghapus petugas', err.response?.data?.message)
    }
  }

  async function handleResetPassword(id, nama) {
    const newPassword = await promptInput({
      title: `Reset Password: ${nama}`,
      inputLabel: 'Password baru',
      inputPlaceholder: 'Minimal 6 karakter',
      inputType: 'password',
      confirmText: 'Reset',
    })
    if (!newPassword) return

    try {
      await api.put(`/petugas/${id}/reset-password`, { password: newPassword })
      alertSuccess('Password direset', `Password ${nama} berhasil diperbarui`)
    } catch (err) {
      alertError('Gagal reset password', err.response?.data?.message)
    }
  }

  const totalAdmin = list.filter((p) => p.level === 'admin').length
  const totalPetugas = list.filter((p) => p.level === 'petugas').length

  return (
    <Layout title="Manajemen Pengguna" eyebrow="Administrator">
      <div className="stats-row cols-2">
        <div className="stat-card rose">
          <div className="stat-val">{totalAdmin}</div>
          <div className="stat-label">Administrator</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-val">{totalPetugas}</div>
          <div className="stat-label">Petugas</div>
        </div>
      </div>

      <div className="card table-card">
        <div
          className="card-header"
          style={{ padding: '18px 22px', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}
        >
          <div className="card-title">Daftar Pengguna</div>
          <Link to="/admin/petugas/baru" className="btn" style={{ width: 'auto' }}>
            + Tambah Petugas
          </Link>
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
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Belum ada pengguna
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
                      <Link
                        to={`/admin/petugas/${p.id_petugas}/edit`}
                        className="btn btn-small secondary"
                        style={{ marginRight: 6 }}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-small secondary"
                        style={{ marginRight: 6 }}
                        onClick={() => handleResetPassword(p.id_petugas, p.nama_petugas)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="btn btn-small danger"
                        onClick={() => handleDelete(p.id_petugas, p.nama_petugas)}
                      >
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
