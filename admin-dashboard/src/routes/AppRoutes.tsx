import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login/Login'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminLayout from '../components/layout/AdminLayout'
import Dashboard from '../pages/Dashboard/Dashboard'
import CondoManagement from '../pages/CondoManagement/CondoManagement'
import UserManagement from '../pages/UserManagement/UserManagement'
import PaymentManagement from '../pages/PaymentManagement/PaymentManagement'
import Profile from '../pages/Profile/Profile'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside AdminLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/condos" element={<CondoManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
