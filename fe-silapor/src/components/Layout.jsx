import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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
  logout: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25"
      />
    </svg>
  ),
}

function navItemsForRole(role) {
  if (role === 'masyarakat') {
    return [
      { label: 'Utama', items: [
        { to: '/pengaduan/saya', icon: 'dashboard', label: 'Pengaduan Saya' },
        { to: '/pengaduan/baru', icon: 'plus', label: 'Buat Pengaduan' },
      ]},
    ]
  }
  if (role === 'admin') {
    return [
      { label: 'Utama', items: [
        { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      ]},
      { label: 'Manajemen', items: [
        { to: '/admin/petugas', icon: 'users', label: 'Data Pengguna' },
      ]},
    ]
  }
  // petugas
  return [
    { label: 'Utama', items: [
      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    ]},
  ]
}

export default function Layout({ title, eyebrow, children }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
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

      <aside className="sidebar">
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
          <span className="topbar-title">{title}</span>
          <div className="topbar-spacer"></div>
          <button className="topbar-btn" onClick={handleLogout}>
            {ICONS.logout} Keluar
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
