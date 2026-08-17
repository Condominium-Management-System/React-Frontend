import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard/Dashboard'
import CondoManagement from '../pages/CondoManagement/CondoManagement'
import UserManagement from '../pages/UserManagement/UserManagement'
import PaymentManagement from '../pages/PaymentManagement/PaymentManagement'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/condos" element={<CondoManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/payments" element={<PaymentManagement />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
