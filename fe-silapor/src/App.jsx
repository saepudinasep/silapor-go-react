import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import LoginMasyarakat from './pages/LoginMasyarakat.jsx'
import LoginPetugas from './pages/LoginPetugas.jsx'
import RegisterMasyarakat from './pages/RegisterMasyarakat.jsx'
import PengaduanForm from './pages/PengaduanForm.jsx'
import PengaduanSaya from './pages/PengaduanSaya.jsx'
import PengaduanDetail from './pages/PengaduanDetail.jsx'
import DashboardPetugas from './pages/DashboardPetugas.jsx'
import PetugasManage from './pages/PetugasManage.jsx'
import GenerateLaporan from './pages/GenerateLaporan.jsx'
import Settings from './pages/Settings.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginMasyarakat />} />
      <Route path="/register" element={<RegisterMasyarakat />} />
      <Route path="/petugas/login" element={<LoginPetugas />} />

      {/* Masyarakat */}
      <Route
        path="/pengaduan/baru"
        element={
          <ProtectedRoute allowedRoles={['masyarakat']}>
            <PengaduanForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pengaduan/saya"
        element={
          <ProtectedRoute allowedRoles={['masyarakat']}>
            <PengaduanSaya />
          </ProtectedRoute>
        }
      />

      {/* Detail bisa diakses masyarakat (miliknya) & petugas/admin */}
      <Route
        path="/pengaduan/:id"
        element={
          <ProtectedRoute allowedRoles={['masyarakat', 'petugas', 'admin']}>
            <PengaduanDetail />
          </ProtectedRoute>
        }
      />

      {/* Petugas & Admin */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['petugas', 'admin']}>
            <DashboardPetugas />
          </ProtectedRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin/petugas"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PetugasManage />
          </ProtectedRoute>
        }
      />

      {/* Generate Laporan - petugas & admin */}
      <Route
        path="/laporan"
        element={
          <ProtectedRoute allowedRoles={['petugas', 'admin']}>
            <GenerateLaporan />
          </ProtectedRoute>
        }
      />

      {/* Pengaturan akun - semua role yang sudah login */}
      <Route
        path="/pengaturan"
        element={
          <ProtectedRoute allowedRoles={['masyarakat', 'petugas', 'admin']}>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
