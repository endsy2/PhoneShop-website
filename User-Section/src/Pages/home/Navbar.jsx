import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiHeart, FiMenu, FiSearch, FiShoppingBag, FiX } from "react-icons/fi";
import Popup from "reactjs-popup";
import { useDispatch, useSelector } from "react-redux";
import { logo } from "../Assets/image";
import NotificationCard from "./Notification_Card";
import { toggleStatusTab } from "../../store/cart";
import { fetchUserInfo } from "../../FetchAPI/Fetch";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "New arrivals", to: "/AfterHomePage?page=NEW ARRIVAL" },
  { label: "All products", to: "/AfterHomePage?page=PRODUCT" },
  { label: "Deals", to: "/AfterHomePage?page=DISCOUNT" },
  { label: "Compare", to: "/compare-product" },
];

const emptyProfile = { username: "", email: "", profile_picture: "" };

const Avatar = ({ src, initial, size = "h-8 w-8" }) =>
  src ? (
    <img src={src} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} flex items-center justify-center rounded-full bg-raised text-sm font-medium text-ink-2`}>
      {initial}
    </span>
  );

const Navbar = ({ token, onLogout }) => {
  const cart = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(emptyProfile);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setMenuOpen(false);
    navigate(`/Search?productName=${encodeURIComponent(query.trim())}`);
  };

  const scrollToContact = (event) => {
    event.preventDefault();
    setMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!token) {
      setProfile(emptyProfile);
      return;
    }
    fetchUserInfo()
      .then((response) => {
        const user = response?.data?.[0] || {};
        setProfile({ username: user.username || "", email: user.email || "", profile_picture: user.profile_picture || "" });
      })
      .catch(() => setProfile(emptyProfile));
  }, [token]);

  const initial = (profile.username || profile.email || "U").trim().charAt(0).toUpperCase();
  const avatarSrc = profile.profile_picture ? `${NETWORK_CONFIG.apiBaseUrl}/${profile.profile_picture}` : "";

  const searchForm = (
    <form onSubmit={submitSearch} className="relative w-full" role="search">
      <FiSearch size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search phones, watches, accessories"
        aria-label="Search"
        className="input pl-9"
      />
    </form>
  );

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="page-container flex h-16 items-center gap-6">
        <Link to="/" className="shrink-0" aria-label="Genius Store home">
          <img src={logo} alt="Genius Store" className="h-9 w-auto" />
        </Link>

        <div className="hidden max-w-xl flex-1 lg:block">{searchForm}</div>

        <div className="ml-auto flex items-center gap-1">
          <NavLink to="/add-to-favorite" className="icon-btn" aria-label="Favorites">
            <FiHeart size={18} strokeWidth={1.5} />
          </NavLink>
          <button type="button" onClick={() => dispatch(toggleStatusTab())} className="icon-btn relative w-auto gap-1.5 px-2" aria-label={`Cart, ${cartCount} items`}>
            <FiShoppingBag size={18} strokeWidth={1.5} />
            <span className="price text-[13px] text-ink">{cartCount}</span>
          </button>

          {token && (
            <Popup
              trigger={
                <button type="button" className="icon-btn" aria-label="Notifications">
                  <FiBell size={18} strokeWidth={1.5} />
                </button>
              }
              position="bottom right"
              arrow={false}
              closeOnDocumentClick
            >
              <NotificationCard />
            </Popup>
          )}

          {token ? (
            <Popup
              trigger={
                <button type="button" className="ml-2 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150 ease-out hover:bg-raised">
                  <Avatar src={avatarSrc} initial={initial} />
                  <span className="hidden max-w-[140px] truncate text-sm text-ink xl:block">{profile.username || "Account"}</span>
                </button>
              }
              position="bottom right"
              arrow={false}
              closeOnDocumentClick
            >
              <div className="card mt-2 w-64 p-2 shadow-float">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar src={avatarSrc} initial={initial} size="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{profile.username || "Account"}</p>
                    <p className="truncate text-[13px] text-ink-3">{profile.email}</p>
                  </div>
                </div>
                <div className="my-1 h-px bg-line" />
                <Link to="/user-profile" className="flex h-9 items-center rounded-lg px-2 text-sm text-ink hover:bg-raised">Profile</Link>
                <Link to="/myorder" className="flex h-9 items-center rounded-lg px-2 text-sm text-ink hover:bg-raised">My orders</Link>
                <button type="button" onClick={onLogout} className="flex h-9 w-full items-center rounded-lg px-2 text-sm text-danger hover:bg-danger-soft">
                  Log out
                </button>
              </div>
            </Popup>
          ) : (
            <div className="ml-2 hidden items-center gap-1 lg:flex">
              <Link to="/auth/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/auth/signup" className="btn btn-dark btn-sm">Sign up</Link>
            </div>
          )}

          <button type="button" className="icon-btn lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <FiMenu size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-line lg:block">
        <div className="page-container flex h-11 items-center gap-6">
          {LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm text-ink-2 transition-colors duration-150 ease-out hover:text-ink">
              {link.label}
            </Link>
          ))}
          <a href="#contact" onClick={scrollToContact} className="text-sm text-ink-2 transition-colors duration-150 ease-out hover:text-ink">
            Contact
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-200 ease-out lg:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`h-full w-80 max-w-[85vw] bg-surface p-4 transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <img src={logo} alt="Genius Store" className="h-8 w-auto" />
            <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <FiX size={18} strokeWidth={1.5} />
            </button>
          </div>
          {searchForm}
          <div className="mt-4 flex flex-col">
            {LINKS.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)} className="flex h-10 items-center rounded-lg px-2 text-[15px] text-ink hover:bg-raised">
                {link.label}
              </Link>
            ))}
            <a href="#contact" onClick={scrollToContact} className="flex h-10 items-center rounded-lg px-2 text-[15px] text-ink hover:bg-raised">
              Contact
            </a>
          </div>
          <div className="mt-6 border-t border-line pt-4">
            {token ? (
              <button type="button" onClick={onLogout} className="btn btn-danger w-full">Log out</button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth/login" className="btn btn-secondary">Log in</Link>
                <Link to="/auth/signup" className="btn btn-dark">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
