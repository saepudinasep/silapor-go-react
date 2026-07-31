import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('silapor_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('silapor_user')
    return raw ? JSON.parse(raw) : null
  })
  const [role, setRole] = useState(localStorage.getItem('silapor_role'))

  function login(newToken, newUser, newRole) {
    localStorage.setItem('silapor_token', newToken)
    localStorage.setItem('silapor_user', JSON.stringify(newUser))
    localStorage.setItem('silapor_role', newRole)
    setToken(newToken)
    setUser(newUser)
    setRole(newRole)
  }

  function logout() {
    localStorage.removeItem('silapor_token')
    localStorage.removeItem('silapor_user')
    localStorage.removeItem('silapor_role')
    setToken(null)
    setUser(null)
    setRole(null)
  }

  // Dipanggil setelah pengguna mengedit profilnya sendiri, supaya nama yang
  // tampil di sidebar/topbar langsung ter-update tanpa perlu login ulang.
  function updateUser(newUser) {
    localStorage.setItem('silapor_user', JSON.stringify(newUser))
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
