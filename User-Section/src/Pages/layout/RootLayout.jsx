import { Outlet } from "react-router-dom";
import Navbar from "../home/Navbar";
import { useEffect, useState } from "react";
import Footer from "../home/Footer";
import { useSelector } from "react-redux";
import AddToCart from "../home/AddToCart";
import axios from "axios";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";

const RootLayout = () => {
  const [token, setToken] = useState(null);
  const stateTabCart = useSelector(store => store.cart?.statusTab);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = () => {
    const savedToken = localStorage.getItem("authToken");
    setToken(savedToken);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${NETWORK_CONFIG.apiBaseUrl}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.log("Logout API error:", error);
    } finally {
      setToken(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfile");
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <nav><Navbar token={token} onLogin={handleLogin} onLogout={handleLogout} /></nav>
      </header>
      <main
        className={`flex-1 max-w-full m-auto w-full transform transition-transform duration-500 
        ${stateTabCart ? "-translate-x-2 opacity-50" : ""}
      `}
      >
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
      {stateTabCart && <AddToCart />}
    </div>
  );
};

export default RootLayout;
