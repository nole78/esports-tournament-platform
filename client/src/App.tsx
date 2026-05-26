import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
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
import TeamsGuestPage from "./pages/common_pages/TeamsGuestPage";
import TeamsGuestDetailsPage from "./pages/common_pages/TeamsGuestDetailsPage";
import MatchInfo from "./pages/common_pages/MatchInfo";
import AccountDetailsPage from "./pages/user/AccountDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    <Route element={<Layout/>}>
      <Route path="/match/:id" element={<MatchInfo/>}/>
      <Route path="/home" element={<LandingPage/>}/>
      <Route path="/game_catalog" element={<GameCatalog/>} />
      <Route path="/tournament_list" element={<TournamentList />} />
      <Route path="/guest/teams" element = {<TeamsGuestPage/>}/>
      <Route path="/guest/teams/:id" element = {<TeamsGuestDetailsPage/>}/>
      <Route path="/guest/tournament_registration/:id" element = {<TournamentRegistrationPage />} />
      
      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="player"><UserDashboard /></ProtectedRoute>} />
      <Route path="/account_details" element={<ProtectedRoute requiredRole="player"><AccountDetailsPage/></ProtectedRoute>}/>
      <Route path="/tournament_registration/:id" element={<ProtectedRoute requiredRole="player"><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/teams" element ={<ProtectedRoute requiredRole="player"> <TeamsPage/></ProtectedRoute>} />
      <Route path="/teams/add" element ={<ProtectedRoute requiredRole="player"> <TeamsAddPage/></ProtectedRoute>} />
      <Route path="/teams/edit/:id" element ={<ProtectedRoute requiredRole="player"> <TeamsEditPage/></ProtectedRoute>} />
      <Route path="/teams/details/:id" element ={<ProtectedRoute requiredRole="player"> <TeamsDetailPage/></ProtectedRoute>} />
      <Route path="/teams/inbox" element ={<ProtectedRoute requiredRole="player"> <TeamsInboxPage/></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute requiredRole="player"><UserWatchList/></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin_details" element={<ProtectedRoute requiredRole="admin"><AccountDetailsPage/></ProtectedRoute>}/>
      <Route path="/admin"       element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/game_catalog/add" element={<ProtectedRoute requiredRole="admin"><GameAddPage/></ProtectedRoute>} />
      <Route path="/game_catalog/edit/:id" element={<ProtectedRoute requiredRole="admin"><GameEditPage/></ProtectedRoute>}/>
      <Route path="/admin/tournament_list" element={<ProtectedRoute requiredRole="admin"><TournamentList/></ProtectedRoute>} />
      <Route path="/admin/tournament_list/add" element={<ProtectedRoute requiredRole="admin"><TournamentAddPage/></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard/></ProtectedRoute>}/>
      <Route path="/tournament_list" element={<ProtectedRoute requiredRole="admin"><TournamentList/></ProtectedRoute>} />
      <Route path="/admin/tournament_list/add" element={<ProtectedRoute requiredRole="admin"><TournamentAddPage/></ProtectedRoute>} />
      <Route path="/admin/tournament_registration/:id" element={<ProtectedRoute requiredRole="admin"><TournamentRegistrationPage /></ProtectedRoute>}/>
      <Route path="/admin/watchlist" element={<ProtectedRoute requiredRole="admin"><UserWatchList/></ProtectedRoute>}/>
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
