import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { confirmAction } from '../utils/swal.js'

const ICONS = {
  dashboard: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  list: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  ),
  users: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
  report: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25"
      />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.216.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.369-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

function navItemsForRole(role) {
  if (role === 'masyarakat') {
    return [
      {
        label: 'Utama', items: [
          { to: '/pengaduan/saya', icon: 'dashboard', label: 'Pengaduan Saya' },
          { to: '/pengaduan/baru', icon: 'plus', label: 'Buat Pengaduan' },
        ]
      },
      {
        label: 'Akun', items: [
          { to: '/pengaturan', icon: 'settings', label: 'Pengaturan' },
        ]
      },
    ]
  }
  if (role === 'admin') {
    return [
      {
        label: 'Utama', items: [
          { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        ]
      },
      {
        label: 'Manajemen', items: [
          { to: '/admin/petugas', icon: 'users', label: 'Data Pengguna' },
          { to: '/laporan', icon: 'report', label: 'Generate Laporan' },
        ]
      },
      {
        label: 'Akun', items: [
          { to: '/pengaturan', icon: 'settings', label: 'Pengaturan' },
        ]
      },
    ]
  }
  // petugas
  return [
    {
      label: 'Utama', items: [
        { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/laporan', icon: 'report', label: 'Generate Laporan' },
      ]
    },
    {
      label: 'Akun', items: [
        { to: '/pengaturan', icon: 'settings', label: 'Pengaturan' },
      ]
    },
  ]
}

export default function Layout({ title, eyebrow, children }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Tutup sidebar mobile otomatis setiap kali pindah halaman
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    const ok = await confirmAction({
      title: 'Keluar dari akun?',
      text: 'Anda perlu login kembali untuk mengakses SiLapor.',
      confirmText: 'Ya, keluar',
      cancelText: 'Batal',
      danger: true,
    })
    if (!ok) return

    logout()
    navigate('/')
  }

  const sections = navItemsForRole(role)
  const displayName = user?.nama || user?.nama_petugas || 'Pengguna'
  const initial = displayName.charAt(0).toUpperCase()
  const roleLabel = role === 'masyarakat' ? 'Masyarakat' : role === 'admin' ? 'Administrator' : 'Petugas'

  return (
    <div className="app-shell">
      <div className="hero-bg"></div>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <div className="logo-text">SiLapor</div>
              <div className="logo-sub">Pengaduan Masyarakat</div>
            </div>
          </div>
        </div>

        {sections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-label">{section.label}</div>
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item${location.pathname === item.to ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {ICONS[item.icon]}
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="sidebar-divider" style={{ marginTop: 'auto' }}></div>
        <div className="sidebar-user">
          <div className="user-avatar">{initial}</div>
          <div>
            <div className="user-name">{displayName}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {sidebarOpen ? ICONS.close : ICONS.menu}
          </button>
          <span className="topbar-title">{title}</span>
          <div className="topbar-spacer"></div>
          <button className="topbar-btn" onClick={handleLogout}>
            {ICONS.logout} <span className="topbar-btn-label">Keluar</span>
          </button>
        </div>

        <div className="content">
          {(eyebrow || title) && (
            <div className="page-header">
              {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
              <h1 className="page-title">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
