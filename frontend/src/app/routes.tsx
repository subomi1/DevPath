import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/developer/DashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundPage } from "./NotFoundPage";
import JourneyPage from "../features/developer/JourneyPage.tsx";
import KnowledgeBasePage from "../features/developer/KnowledgeBasePage";
import ArticleDetailPage from "../features/developer/ArticleDetailPage";
import AccessRequestsPage from "../features/developer/AccessRequestsPage";

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
        <Route
          path="/developer/knowledge-base"
          element={
            <ProtectedRoute>
              <KnowledgeBasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer/knowledge-base/:slug"
          element={
            <ProtectedRoute>
              <ArticleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer/access-requests"
          element={
            <ProtectedRoute>
              <AccessRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
