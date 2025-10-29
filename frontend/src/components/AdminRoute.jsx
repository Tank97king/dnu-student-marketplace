import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AdminRoute() {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}








