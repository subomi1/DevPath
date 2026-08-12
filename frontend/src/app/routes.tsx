import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/developer/DashboardPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/developer/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}