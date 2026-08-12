import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/developer/DashboardPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/developer/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}