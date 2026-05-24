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
import TournamentList from "./pages/common_pages/TournamentList";
import TournamentAddPage from "./pages/admin/TournamentAddPage";
import AuditLogPage from "./pages/admin/AuditLog";
import LandingPage from "./pages/common_pages/LandingPage";
import TeamsPage from "./pages/common_pages/TeamsPage";
import TeamsAddPage from "./pages/common_pages/TeamsAddPage";
import TeamsEditPage from "./pages/common_pages/TeamsEditPage";
import TournamentRegistrationPage from "./pages/common_pages/TournamentRegistrationPage";
//import TeamsAddPage from "./pages/common_pages/TeamsAddPage";

import { Layout } from "./components/layout/Layout";
import UserOverview from "./pages/user/UserOverview";
import HealthPage from "./pages/admin/HealthPage";
import TeamsDetailPage from "./pages/common_pages/TeamsDetailPage";
import TeamsInboxPage from "./pages/common_pages/TeamsInboxPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    <Route element={<Layout/>}>
      <Route path="/home" element={<LandingPage/>}/>
      <Route path="/game_catalog" element={<GameCatalog/>} />
      <Route path="/tournament_list" element={<TournamentList />} />
      {/* <Route path="/teams" element = {<TeamsPage/>}/> */}
      {/* {<Route path="/teams/add" element = {<TeamsAddPage/>}/>}
      {<Route path="/teams/edit/:id" element = {<TeamsEditPage/>}/>} */}
      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="player"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user_info" element={<ProtectedRoute requiredRole="player"><UserOverview/></ProtectedRoute>}/>
      <Route path="/tournament_registration/:id" element={<ProtectedRoute requiredRole="player"><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/teams" element ={<ProtectedRoute requiredRole="player"> <TeamsPage/></ProtectedRoute>} />
      <Route path="/teams/add" element ={<ProtectedRoute requiredRole="player"> <TeamsAddPage/></ProtectedRoute>} />
      <Route path="/teams/edit/:id" element ={<ProtectedRoute requiredRole="player"> <TeamsEditPage/></ProtectedRoute>} />
      <Route path="/teams/details/:id" element ={<ProtectedRoute requiredRole="player"> <TeamsDetailPage/></ProtectedRoute>} />
      <Route path="/teams/inbox" element ={<ProtectedRoute requiredRole="player"> <TeamsInboxPage/></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin_info" element={<ProtectedRoute requiredRole="admin"><UserOverview/></ProtectedRoute>}/>
      <Route path="/admin"       element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
      <Route path="/game_catalog/add" element={<ProtectedRoute requiredRole="admin"><GameAddPage/></ProtectedRoute>} />
      <Route path="/game_catalog/edit/:id" element={<ProtectedRoute requiredRole="admin"><GameEditPage/></ProtectedRoute>}/>
      <Route path="/admin/audit_log" element={<ProtectedRoute requiredRole="admin"><AuditLogPage/></ProtectedRoute>}/>
      <Route path="/tournament_list" element={<ProtectedRoute requiredRole="admin"><TournamentList/></ProtectedRoute>} />
      <Route path="/admin/tournament_list/add" element={<ProtectedRoute requiredRole="admin"><TournamentAddPage/></ProtectedRoute>} />
      <Route path="/admin/health" element={<ProtectedRoute requiredRole="admin"><HealthPage/></ProtectedRoute>}/>
      <Route path="/admin/tournament_registration/:id" element={<ProtectedRoute requiredRole="admin"><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/admin/teams" element ={<ProtectedRoute requiredRole="admin"> <TeamsPage/></ProtectedRoute>} />
      <Route path="/admin/teams/add" element ={<ProtectedRoute requiredRole="admin"> <TeamsAddPage/></ProtectedRoute>} />
      <Route path="/admin/teams/edit/:id" element ={<ProtectedRoute requiredRole="admin"> <TeamsEditPage/></ProtectedRoute>} />
      <Route path="/admin/teams/details/:id" element ={<ProtectedRoute requiredRole="admin"> <TeamsDetailPage/></ProtectedRoute>} />
      <Route path="/admin/teams/inbox" element ={<ProtectedRoute requiredRole="admin"> <TeamsInboxPage/></ProtectedRoute>} />

      <Route path="/"    element={<Navigate to="/home" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Route>
    </Routes>
  );
}
