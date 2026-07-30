import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ProtectedRoute mengizinkan akses hanya jika user login dan (opsional)
// role-nya termasuk dalam daftar allowedRoles.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuth()

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
