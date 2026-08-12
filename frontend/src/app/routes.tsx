import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/developer/DashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundPage } from "./NotFoundPage";
import JourneyPage  from "../features/developer/JourneyPage.tsx";

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
        <Route
          path="/developer/journey"
          element={
            <ProtectedRoute>
              <JourneyPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
