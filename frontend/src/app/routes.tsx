import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/developer/DashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundPage } from "./NotFoundPage";
import JourneyPage from "../features/developer/JourneyPage.tsx";
import KnowledgeBasePage from "../features/developer/KnowledgeBasePage";
import ArticleDetailPage from "../features/developer/ArticleDetailPage";
import AccessRequestsPage from "../features/developer/AccessRequestsPage";
import MentorPage from "../features/developer/MentorPage";
import AnnouncementsPage from "../features/developer/AnnouncementsPage";
import ProfilePage from "../features/developer/ProfilePage";
import ManagerDashboardPage from "../features/manager/DashboardPage";
import DeveloperDetailPage from "../features/manager/DeveloperDetailPage";
import ApprovalsPage from "../features/manager/ApprovalsPage";
import TeamPage from "../features/manager/TeamPage";
import ManagerAnnouncementsPage from "../features/manager/AnnouncementsPage";
import ManagerProfilePage from "../features/manager/ProfilePage";
import HRDashboardPage from "../features/hr/DashboardPage";
import InviteDeveloperPage from "../features/hr/InviteDeveloperPage";
import DevelopersPage from "../features/hr/DevelopersPage";
import TemplatesPage from "../features/hr/TemplatesPage";
import HRAnnouncementsPage from "../features/hr/AnnouncementsPage";
import HRProfilePage from "../features/hr/ProfilePage";
import AdminDashboardPage from "../features/admin/DashboardPage";
import UsersPage from "../features/admin/UsersPage";
import DepartmentsPage from "../features/admin/DepartmentsPage";
import TemplateBuilderPage from "../features/admin/TemplateBuilderPage";
import KnowledgeBaseManagementPage from "../features/admin/KnowledgeBaseManagementPage";
import AnnouncementsManagementPage from "../features/admin/AnnouncementsManagementPage";

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
        <Route
          path="/developer/mentor"
          element={
            <ProtectedRoute>
              <MentorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team/:id"
          element={
            <ProtectedRoute>
              <DeveloperDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/approvals"
          element={
            <ProtectedRoute>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/announcements"
          element={
            <ProtectedRoute>
              <ManagerAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <ProtectedRoute>
              <ManagerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute>
              <HRDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/invite"
          element={
            <ProtectedRoute>
              <InviteDeveloperPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/developers"
          element={
            <ProtectedRoute>
              <DevelopersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/announcements"
          element={
            <ProtectedRoute>
              <HRAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/profile"
          element={
            <ProtectedRoute>
              <HRProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <ProtectedRoute>
              <TemplateBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/knowledge-base"
          element={
            <ProtectedRoute>
              <KnowledgeBaseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
