import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import GameCatalog from "./pages/common_pages/GameCatalog";
import GameAddPage from "./pages/admin/GameAddPage";
import GameEditPage from "./pages/admin/GameEditPage";
import AuditLogPage from "./pages/admin/AuditLog";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="player"><UserDashboard /></ProtectedRoute>} />
      <Route path="/game_catalog" element={<ProtectedRoute requiredRole="player"><GameCatalog/></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin"       element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/game_catalog" element={<ProtectedRoute requiredRole="admin"><GameCatalog/></ProtectedRoute>} />
      <Route path="/admin/game_catalog/add" element={<ProtectedRoute requiredRole="admin"><GameAddPage/></ProtectedRoute>} />
      <Route path="/admin/game_catalog/edit/:id" element={<ProtectedRoute requiredRole="admin"><GameEditPage/></ProtectedRoute>}/>
      <Route path="/admin/audit_log" element={<ProtectedRoute requiredRole="admin"><AuditLogPage/></ProtectedRoute>}/>

      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
