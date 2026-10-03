import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import logo from "../../assets/logo.png";
import avatarPlaceholder from "../../assets/avatar_placeholder.jpg";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { authApi } from "../../api_services/auth/AuthAPIService";
import NotificationDropdown from "../account/NotificationDropDown";

const guestNav = [
  {to: "/game_catalog", label: "Game Catalog"},
  {to: "/tournament_list", label: "Tournaments"},
  {to: "/guest/teams/", label: "Teams List"}
]

const userNav = [
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/teams", label: "Teams List"},
  { to: "/tournament_list", label: "Tournaments"},
  { to: "/watchlist", label: "My Watchlist"},
];

const adminNav = [
  { to: "/admin/dashboard", label: "Admin Dashboard"},
  { to: "/game_catalog", label: "Game Catalog"},
  { to: "/teams", label: "Teams List"},
  { to: "/tournament_list", label: "Tournaments"},
  { to: "/watchlist", label: "My Watchlist"},
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? adminNav : user? userNav : guestNav;
  const [avatar, setAvatar] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="flex h-screen flex-col overflow-hidden bg-primary">
      <header className="h-auto min-h-16 shrink-0 border-b border-secondary/40 bg-primary/95">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-0">
          {/* LEFT - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-primary/50 flex items-center justify-center">
              <img src={logo} alt="PulseGrid logo" width="40" height="40" className="h-10 w-10 rounded-lg" />
            </div>

            <button
              className="cursor-pointer text-2xl font-bold tracking-tight text-bgsecondary transition-colors hover:text-bgprimary"
              onClick={() => navigate("/home")}
            >
              Pulse<span className="text-bgprimary">Grid</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-secondary/60 text-bgsecondary transition-colors hover:bg-white/10 sm:hidden"
          >
            <span className="text-xl" aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
          </button>

          {/* CENTER - Navigation */}
          <nav
            id="primary-navigation"
            aria-label="Primary navigation"
            className={`${isMenuOpen ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-secondary/30 pt-3 sm:order-none sm:flex sm:w-auto sm:flex-row sm:overflow-x-auto sm:border-t-0 sm:pt-0`}
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border border-bgprimary/60 bg-bgprimary/15 text-bgprimary"
                      : "text-bgsecondary/80 hover:bg-white/5 hover:text-bgsecondary"
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
                <div className="w-10 mr-2">
                  <NotificationDropdown />
                </div>
                <button onClick={() => navigate("/account_details")}
                  className="cursor-pointer w-8 h-8 rounded-full bg-white/10 border border-primary/50 flex items-center justify-center">
                  <img src={avatar ? avatar : avatarPlaceholder} alt="Open account details" width="32" height="32" className="rounded-full"/>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (user) {
                  logout();
                  authApi.logout(user.id);
                  navigate("/home");
                }
                else navigate("/login");
              }}
              aria-label={user ? "Log out" : "Log in"}
              className="min-h-11 rounded-lg bg-bgsecondary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-bgsecondary/80"
            >
              {user ? "Log out" : "Log in"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8"><Outlet/></div>
      </main>
    </div>
  );
}
