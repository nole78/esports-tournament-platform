import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

// TODO: Update nav items to match your routes and roles
const userNav = [
  { to: "/dashboard", label: "Dashboard", icon: "⬡" },
  { to: "/game_catalog", label: "Game Catalog", icon: "⬡"},
  // add more user routes here
];
const adminNav = [
  { to: "/admin",       label: "Dashboard", icon: "⬡" },
  { to: "/admin/users", label: "Users",     icon: "◎" },
  { to: "/admin/game_catalog", label: "Game Catalog", icon: "⬡"},
  { to: "/admin/audit_log", label: "Audit Log", icon: "⌺"},
  // add more admin routes here
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? adminNav : userNav;

  return (
    <div className="flex min-h-screen bg-primary">
      <aside className="w-56 shrink-0 border-r border-secondary/40 flex flex-col bg-bgprimary/70">
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-primary/30 gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-primary/50 flex items-center justify-center">
            <img src="logo.png" className="w-10 h-9.6 rounded-lg flex "/>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary tracking-tight">PulseGrid</p>
            <p className="text-[10px] text-bgsecondary uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white/8 text-bgsecondary border border-secondary/50"
                    : "text-primary/35 hover:text-primary/70 hover:bg-white/4 border border-transparent"
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-primary/30 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-primary/50 flex items-center justify-center">
              <span className="text-xs text-bgsecondary/60 font-medium">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary/80 truncate">{user?.username}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="text-xs text-bgsecondary hover:text-white/50 transition-colors w-full text-left">
            Sign out →
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
