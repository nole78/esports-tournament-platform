import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import logo from "../../assets/logo.png";

// TODO: Update nav items to match your routes and roles
const guestNav = [
  {to: "/game_catalog", label: "Game Catalog"}
]

const userNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/tournament_list", label: "Tournament List"},
  { to: "/teams", label: "Teams List"}
  // add more user routes here
];
const adminNav = [
  { to: "/admin",       label: "Dashboard"},
  { to: "/admin/users", label: "Users"},
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/admin/audit_log", label: "Audit Log"},
  { to: "/admin/tournament_list", label: "Tournament List"},
  { to: "/teams", label: "Teams List"}
  // add more admin routes here
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? adminNav : user? userNav : guestNav;

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <header className="w-full border-b border-secondary/40 bg-bgprimary/70">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* LEFT - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-primary/50 flex items-center justify-center">
              <img src={logo} className="w-10 h-9.5 rounded-lg" />
            </div>

            <button
              className="text-2xl font-bold text-primary tracking-tight hover:text-primary/80 cursor-pointer"
              onClick={() => navigate("/pulse_grid")}
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
                <div className="w-8 h-8 rounded-full bg-white/10 border border-primary/50 flex items-center justify-center">
                  <span className="text-xs text-bgsecondary/60 font-medium">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-primary/80">{user?.username}</p>
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

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
