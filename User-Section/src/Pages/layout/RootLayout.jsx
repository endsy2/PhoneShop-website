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

  const handleLogout = async () => {
    try {
      await axios.post(`${NETWORK_CONFIG.apiBaseUrl}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error(error);
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
        <Navbar token={token} onLogout={handleLogout} />
      </header>
      <main className="w-full flex-1">
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
