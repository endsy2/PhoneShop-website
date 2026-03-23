import { NavLink, useLocation, Outlet, Link } from "react-router-dom";
import { hambugerBar, logo } from "../../Assets";
import { nav_bar } from "../../Constants";
import { useState } from "react";
import Cookies from "js-cookie";

const RootLayOut = () => {
  const location = useLocation();
  const [toggleMenu, setToggleMenu] = useState(false);
  const token = Cookies.get('token'); // Get the token from cookies

  return (
    token ? (
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="flex max-lg:flex-row max-lg:justify-between flex-col p-6 w-80 bg-white shadow-lg lg:w-72 max-lg:w-full max-lg:border-b-2 lg:border-r-2">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <NavLink to="/">
              <img src={logo} alt="App logo" className="w-70 lg:w-70" />
            </NavLink>
          </div>

          {/* Hamburger Button (Mobile) */}
          <button
            className="flex items-center justify-center lg:hidden mb-4"
            onClick={() => setToggleMenu(!toggleMenu)}
            aria-label="Toggle menu"
          >
            <img src={hambugerBar} alt="Menu button" className="w-11 h-14" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-col gap-4">
            {nav_bar.map(({ img, label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={`flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-100 ${location.pathname === `/dashboard${path}` ? "bg-gray-100" : ""}`}
              >
                <img src={img} alt={`${label} icon`} className="w-5 h-5" />
                <span className="green-txt">{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 z-40 flex flex-col bg-gray-800 bg-opacity-50 lg:hidden transition-transform transform ${toggleMenu ? "translate-x-0" : "-translate-x-full"}`}
          onClick={() => setToggleMenu(false)} // Close menu on overlay click
        >
          <div
            className="w-64 bg-white h-full shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing on content click
          >
            <nav className="flex flex-col gap-4 p-6">
              {nav_bar.map(({ img, label, path }) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={() => setToggleMenu(false)} // Close menu on navigation
                  className={`flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-100 ${location.pathname === `/${path}` ? "bg-gray-100" : ""}`}
                >
                  <img src={img} alt={`${label} icon`} className="w-5 h-5" />
                  <span className="green-txt">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <section className="flex-auto p-6 ml-2">
          <Outlet />
        </section>
      </main>
    ) : (
      // If no token, display a fallback (e.g., a message or redirect)
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-xl">You are not authenticated. Please log in.</h1>
        <div className="flex justify-between mt-8 gap-28">
          <Link
            to='/'
            className="font-bold px-8 py-4 rounded-xl bg-primary text-white hover:bg-green-500"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="font-bold px-8 py-4 rounded-xl bg-red-600 text-black hover:text-gray-700 hover:bg-red-500"
          >
            Register
          </Link>
        </div>
      </div>
    )
  );
};

export default RootLayOut;
