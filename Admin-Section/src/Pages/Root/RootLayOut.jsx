import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { logo } from "../../Assets";
import { nav_bar } from "../../Constants";
import { hasAdminPermission, logoutFetch } from "../../Fetch/FetchAPI";

const signOut = async () => {
  try {
    await logoutFetch();
  } finally {
    Cookies.remove("token");
    Cookies.remove("access-token");
    ["adminToken", "adminRole", "adminPermissions"].forEach((key) => localStorage.removeItem(key));
    window.location.href = "/";
  }
};

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const visibleNav = nav_bar.filter(({ permission }) => hasAdminPermission(permission));
  const role = localStorage.getItem("adminRole") || "admin";

  const isActive = (path) =>
    path === "" ? location.pathname === "/dashboard" : location.pathname.startsWith(`/dashboard/${path}`);

  return (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" onClick={onNavigate} className="flex h-16 items-center px-5">
        <img src={logo} alt="Genius Store" className="h-8 w-auto" />
      </Link>
      <nav className="flex-1 space-y-0.5 px-3 pt-2" aria-label="Main">
        {visibleNav.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path === ""}
            onClick={onNavigate}
            className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150 ease-out ${
              isActive(path) ? "bg-raised text-ink" : "text-ink-2 hover:bg-raised hover:text-ink"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} className={isActive(path) ? "text-ink" : "text-ink-3"} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center justify-between gap-2 px-2.5">
          <span className="text-[13px] capitalize text-ink-3">{role}</span>
          <button type="button" onClick={signOut} className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] text-ink-2 transition-colors duration-150 ease-out hover:bg-danger-soft hover:text-danger">
            <FiLogOut size={14} strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

const RootLayOut = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const token = Cookies.get("token") || Cookies.get("access-token") || localStorage.getItem("adminToken");

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center">
        <img src={logo} alt="Genius Store" className="h-9 w-auto" />
        <h1 className="mt-8 text-xl">Your session has ended</h1>
        <p className="mt-1 text-sm text-ink-2">Log in again to continue</p>
        <Link to="/" className="btn btn-dark mt-6">Log in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar and drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <img src={logo} alt="Genius Store" className="h-7 w-auto" />
        <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <FiMenu size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-200 ease-out lg:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`relative h-full w-64 bg-surface transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="icon-btn absolute right-3 top-3" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <FiX size={18} strokeWidth={1.5} />
          </button>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayOut;
