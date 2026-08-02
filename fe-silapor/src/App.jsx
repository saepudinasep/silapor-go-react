import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import LoginMasyarakat from './pages/LoginMasyarakat.jsx'
import LoginPetugas from './pages/LoginPetugas.jsx'
import RegisterMasyarakat from './pages/RegisterMasyarakat.jsx'
import GenerateLaporan from './pages/GenerateLaporan.jsx'
import Settings from './pages/Settings.jsx'

// Masyarakat — pengaduan
import PengaduanPageMasyarakat from './pages/masyarakat/pengaduan/Page.jsx'
import PengaduanCreateMasyarakat from './pages/masyarakat/pengaduan/Create.jsx'
import PengaduanDetailMasyarakat from './pages/masyarakat/pengaduan/Detail.jsx'

// Petugas & Admin — pengaduan
import PengaduanPagePetugas from './pages/petugas/pengaduan/Page.jsx'
import PengaduanUpdatePetugas from './pages/petugas/pengaduan/Update.jsx'

// Admin — manajemen petugas
import PetugasPageAdmin from './pages/admin/petugas/Page.jsx'
import PetugasCreateAdmin from './pages/admin/petugas/Create.jsx'
import PetugasUpdateAdmin from './pages/admin/petugas/Update.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import TopLoadingBar from './components/TopLoadingBar.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import RouteChangeIndicator from './components/RouteChangeIndicator.jsx'

export default function App() {
  return (
    <>
      {/* Indikator loading global: bar tipis di atas (navigasi halaman +
          semua request) dan overlay di tengah (khusus insert/edit/delete) */}
      <TopLoadingBar />
      <LoadingOverlay />
      <RouteChangeIndicator />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginMasyarakat />} />
        <Route path="/register" element={<RegisterMasyarakat />} />
        <Route path="/petugas/login" element={<LoginPetugas />} />

        {/* Masyarakat — CRUD Pengaduan */}
        <Route
          path="/masyarakat/pengaduan"
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <PengaduanPageMasyarakat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masyarakat/pengaduan/baru"
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <PengaduanCreateMasyarakat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masyarakat/pengaduan/:id"
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <PengaduanDetailMasyarakat />
            </ProtectedRoute>
          }
        />

        {/* Petugas & Admin — CRUD Pengaduan (list + detail/update status/tanggapan) */}
        <Route
          path="/petugas/pengaduan"
          element={
            <ProtectedRoute allowedRoles={['petugas', 'admin']}>
              <PengaduanPagePetugas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petugas/pengaduan/:id"
          element={
            <ProtectedRoute allowedRoles={['petugas', 'admin']}>
              <PengaduanUpdatePetugas />
            </ProtectedRoute>
          }
        />

        {/* Admin — CRUD Manajemen Petugas */}
        <Route
          path="/admin/petugas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PetugasPageAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/petugas/baru"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PetugasCreateAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/petugas/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PetugasUpdateAdmin />
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
    </>
  )
}
