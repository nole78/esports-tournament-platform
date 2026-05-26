import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import GameCatalog from "./pages/common_pages/GameCatalog";
import GameAddPage from "./pages/admin/GameAddPage";
import GameEditPage from "./pages/admin/GameEditPage";
import TournamentList from "./pages/common_pages/TournamentList";
import TournamentAddPage from "./pages/admin/TournamentAddPage";
import LandingPage from "./pages/common_pages/LandingPage";
import TeamsPage from "./pages/common_pages/TeamsPage";
import TeamsAddPage from "./pages/common_pages/TeamsAddPage";
import TeamsEditPage from "./pages/common_pages/TeamsEditPage";
import TournamentRegistrationPage from "./pages/common_pages/TournamentRegistrationPage";
import UserWatchList from "./pages/user/UserWatchlist";
//import TeamsAddPage from "./pages/common_pages/TeamsAddPage";

import { Layout } from "./components/layout/Layout";
import TeamsDetailPage from "./pages/common_pages/TeamsDetailPage";
import TeamsInboxPage from "./pages/common_pages/TeamsInboxPage";
import MatchInfo from "./pages/common_pages/MatchInfo";
import AccountDetailsPage from "./pages/user/AccountDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    <Route element={<Layout/>}>
      {/* Guest routes */}
      <Route path="/match/:id" element={<MatchInfo/>}/>
      <Route path="/home" element={<LandingPage/>}/>
      <Route path="/game_catalog" element={<GameCatalog/>} />
      <Route path="/tournament_list" element={<TournamentList />} />
      <Route path="/teams" element = {<TeamsPage/>}/>
      <Route path="/teams/details/:id" element = {<TeamsDetailPage/>}/>
      
      {/* User routes */}
      <Route path="/account_details" element={<ProtectedRoute><AccountDetailsPage/></ProtectedRoute>}/>
      <Route path="/tournament_registration/:id" element={<ProtectedRoute><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/teams" element ={<ProtectedRoute> <TeamsPage/></ProtectedRoute>} />
      <Route path="/teams/add" element ={<ProtectedRoute> <TeamsAddPage/></ProtectedRoute>} />
      <Route path="/teams/edit/:id" element ={<ProtectedRoute> <TeamsEditPage/></ProtectedRoute>} />
      <Route path="/teams/inbox" element ={<ProtectedRoute> <TeamsInboxPage/></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><UserWatchList/></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin"       element={<ProtectedRoute requiredRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/game_catalog/add" element={<ProtectedRoute requiredRoles={["admin"]}><GameAddPage/></ProtectedRoute>} />
      <Route path="/admin/game_catalog/edit/:id" element={<ProtectedRoute requiredRoles={["admin"]}><GameEditPage/></ProtectedRoute>}/>
      <Route path="/admin/tournament_list/add" element={<ProtectedRoute requiredRoles={["admin"]}><TournamentAddPage/></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={["admin"]}><AdminDashboard/></ProtectedRoute>}/>
      <Route path="/admin/tournament_registration/:id" element={<ProtectedRoute requiredRoles={["admin"]}><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/admin/teams/add" element ={<ProtectedRoute requiredRoles={["admin"]}> <TeamsAddPage/></ProtectedRoute>} />
      <Route path="/admin/teams/edit/:id" element ={<ProtectedRoute requiredRoles={["admin"]}> <TeamsEditPage/></ProtectedRoute>} />

      <Route path="/"    element={<Navigate to="/home" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Route>
    </Routes>
  );
}
