import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import logo from "../../assets/logo.png";
import avatarPlaceholder from "../../assets/avatar_placeholder.jpg";
import { usersApi } from "../../api_services/users/UsersAPIService";

// TODO: Update nav items to match your routes and roles
const guestNav = [
  {to: "/game_catalog", label: "Game Catalog"},
  {to: "/tournament_list", label: "Tournaments"}
]

const userNav = [
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/teams", label: "Teams List"},
  { to: "/tournament_list", label: "Tournaments"},
  // add more user routes here
];
const adminNav = [
  { to: "/admin/users", label: "Users"},
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/admin/audit_log", label: "Audit Log"},
  { to: "/teams", label: "Teams List"},
  { to: "/tournament_list", label: "Tournaments"},
  // add more admin routes here
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? adminNav : user? userNav : guestNav;
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if(user)
    {
      usersApi.getById(user.id).then(res => {
          setAvatar(res.data?.profilePicture ?? "");
        })
        .catch()
    }
  },[user])

  return (
    <div className="flex oveflow-hidden flex-col h-screen bg-primary">
      <header className="h-16 shrink-0 w-full border-b border-secondary/40 bg-bgprimary/70">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* LEFT - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-primary/50 flex items-center justify-center">
              <img src={logo} className="w-10 h-9.5 rounded-lg" />
            </div>

            <button
              className="text-2xl font-bold text-primary tracking-tight hover:text-primary/80 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              Pulse<span className="text-bgsecondary">Grid</span>
            </button>
          </div>

          {/* CENTER - Navigation */}
          <nav className="flex items-center gap-2">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center font-semibold gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-white/8 text-bgsecondary border border-secondary/50"
                      : "text-primary/40 hover:text-primary/80 hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT - User */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(user.role == "admin"?"/admin_info":"user_info")}
                  className="cursor-pointer w-8 h-8 rounded-full bg-white/10 border border-primary/50 flex items-center justify-center">
                  <img src={avatar? avatar : avatarPlaceholder} className="rounded-full"/>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (user) logout();
                else navigate("/login");
              }}
              className="text-sm text-secondary bg-bgsecondary p-2 rounded-lg font-semibold cursor-pointer hover:text-white/70 hover:bg-bgsecondary/70 transition-colors"
            >
              {user ? "Log out" : "Log in"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-scroll flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8"><Outlet/></div>
      </main>
    </div>
  );
}
