import { Outlet } from "react-router-dom";
import Navbar from "../home/Navbar";
import { useEffect, useState } from "react";
import Footer from "../home/Footer";
import { useSelector } from "react-redux";
import store from "../../store/store";
import AddToCart from "../home/AddToCart";
  import ChatSupport from "../../Components/ChatSupport";
import axios from "axios";

const RootLayout = () => {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setToken(token)
    }
  }, []);
  const [token, setToken] = useState(null);
  const stateTabCart = useSelector(store => store.cart?.statusTab);

  const handleLogin = () => {
    const newToken = "dummy-token"
    console.log("TOhssadsadsToken" + newToken)
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
    console.log("TOken have been clear")
    axios.defaults.withCredentials = false;
    window.location.href = '/'
  };

  return (
    <>
      <header>
        <nav><Navbar token={token} onLogin={handleLogin} onLogout={handleLogout} /></nav>
      </header>
      <main
        className={`flex-1 max-w-full m-auto transform transition-transform duration-500 
        ${stateTabCart ? "-translate-x-2 opacity-50" : ""}
      `}
      >
        <Outlet /> {/* Ensure nested routes are rendered */}
      </main>
      <footer>
        <Footer />
      </footer>
      {stateTabCart && <AddToCart />}
      <ChatSupport />
    </>
  );
};

export default RootLayout;
