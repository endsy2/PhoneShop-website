import React, { useEffect, useRef } from "react";
import { logo, menu, buy, favorite_packages, compare, user } from "../Assets/image";
import { Link, NavLink } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import Popup from "reactjs-popup";
import NotificationCard from "./Notification_Card";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import store from "../../store/store";
import { nav_icon } from "../../Constants";
import { toggleStatusTab } from "../../store/cart";

const Navbar = ({ token, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalQuatity, setTotalQuantity] = useState(0);
  const cart = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();
  const [toggleMenu, setToggleMenu] = useState(false);
  const [searchData, setSearchData] = useState("");

  // Create a reference to the footer
  const footerRef = useRef(null);


  const handleSearchChange = (e) => {
    setSearchData(e.target.value);
  };

  // Handle search click or press enter
  const handleSearchSubmit = () => {
    if (searchData.trim()) {
      // Navigate to search results page with the query
      setToggleMenu(false); // Close the mobile menu after search
      window.location.href = `Search?productName=${searchData}`;
    }
  };
  // Scroll to footer when "Contact Us" link is clicked
  const scrollToFooter = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.log("Footer reference is not set properly.");
    }
  };
  useEffect(() => {
    if (!token) {
      onLogin;
    }
    let total = 0;
    cart.forEach((item) => (total += item.quantity));
    setTotalQuantity(total);
  }, [token, onLogin, cart]);

  // Scroll to the footer when the "Contact" link is clicked

  const handleOpenTabCart = () => {
    dispatch(toggleStatusTab()); // Dispatch the action to open the cart tab
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="w-full  px-5 mx-auto">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Name */}
          <div className="flex items-center">
            <Link to="/">
              <img src={logo} alt="Phone Shop Logo" className="h-40 w-65" />
            </Link>
            {/* <Link to="/">             
                <span className="text-green-600 text-4xl font-bold ml-2 font-poppins tracking-wider">
                  Genius Store
                </span>
            </Link> */}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 mx-8 max-lg:hidden">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-28 py-2 border border-gray-300 rounded-full focus:outline-none "
              onChange={handleSearchChange}
              style={{ borderRadius: "8px" }}
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded"
              style={{ borderRadius: "4px" }}
              onClick={handleSearchSubmit}
            >
              SEARCH
            </button>
          </div>

          {/* Account Btn */}
          <div className="flex items-center space-x-6">
            {nav_icon.map((element) =>
              element.label === "AddToCart" ? (
                <div
                  key={element.label}
                  className="w-12 h-12 rounded-full flex justify-center items-center relative"
                  onClick={() => handleOpenTabCart()} // Add onClick event
                >
                  <img src={element.img} alt={element.label} className="w-8" />
                  <span className="absolute font-bold bottom-1 right-1 text-white bg-red-600 text-xs w-4 h-4 rounded-full flex justify-center items-center">
                    {totalQuatity}
                  </span>
                </div>
              ) : (
                <NavLink key={element.label} to={element.href}>

                  <img
                    src={element.img}
                    alt={element.label}
                    className={`w-8 md:block  `}
                  />
                </NavLink>
              )
            )}
            {token ? (
              <NavLink to='user-profile'>
                <img
                  src={user}
                  className={`w-8 md:block  `}
                />
              </NavLink>

            ) : ''}

            {/* Conditional Rendering Based on Token */}
            {token ? (
              // Show Notification Pop-up and Logout Button if token exists
              <div className="flex items-center justify-center space-x-4">
                <Popup
                  trigger={
                    <div className="cursor-pointer">
                      <IoIosNotifications size={24} />
                    </div>
                  }
                  position="bottom center"
                  arrow={true}
                  closeOnDocumentClick
                >
                  {/* Popup Content */}
                  <NotificationCard />
                </Popup>

                <button
                  onClick={onLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-full max-lg:hidden"
                  style={{ borderRadius: "8px" }}
                >
                  Log Out
                </button>

                {/* Hamburger Button (Mobile) */}
                <div className="flex justify-center items-center">
                  <button
                    className="flex items-center justify-center lg:hidden "
                    onClick={() => setToggleMenu(!toggleMenu)}
                    aria-label="Toggle menu"
                  >
                    <img src={menu} alt="Menu button" className="w-7" />
                  </button>
                </div>
              </div>

            ) : (
              // Show Login and Sign Up Buttons if no token exists
              <div className="flex justify-center items-center gap-3 ">
                <Link to="/auth/Login">
                  <button
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hidden lg:block"
                    style={{ borderRadius: "8px" }}
                  >
                    Log In
                  </button>
                </Link>
                <NavLink to="/auth/Signup">
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-full hidden lg:block"
                    style={{ borderRadius: "8px" }}
                  >
                    Sign Up
                  </button>
                </NavLink>

                {/* Hamburger Button (Mobile) */}
                <button
                  className="flex items-center justify-center lg:hidden"
                  onClick={() => setToggleMenu(!toggleMenu)}
                  aria-label="Toggle menu"
                >
                  <img src={menu} alt="Menu button" className="w-7" />
                </button>
              </div>


            )}

          </div>
        </div>
      </div>

      {/* Mobile Menu Icon */}


      {/* Navigation Links */}
      <div className="bg-green-600 max-lg:hidden">
        <div className="flex justify-center space-x-32 py-3 text-white">
          <Link to="/">
            <span className="hover:text-gray-200">Home</span>
          </Link>
          <Link
            to={`/AfterHomePage?page=NEW ARRIVAL`}
            className="hover:text-gray-200"
          >
            NEW ARRIVAL
          </Link>
          <Link
            to={`/AfterHomePage?page=PRODUCT`}
            className="hover:text-gray-200"
          >
            PRODUCT
          </Link>
          <Link
            to={`/AfterHomePage?page=DISCOUNT`}
            className="hover:text-gray-200"
          >
            DISCOUNT
          </Link>
          <a
            onClick={scrollToFooter}
            className="cursor-pointer hover:text-gray-200"
            href="#contact"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-gray-800 bg-opacity-50 lg:hidden transition-transform transform ${toggleMenu ? "translate-x-0" : "-translate-x-full"}`}
        onClick={() => setToggleMenu(false)} // Close menu on overlay click
      >
        <div
          className="w-96 bg-white h-full shadow-lg overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing on content click
        >
          {/* Navigation Links */}
          <div className="text-green-600  p-6">
            <div className="flex flex-col space-y-4 text-green-600  text-lg" onClick={() => setToggleMenu(false)}>
              <Link to="/" className="hover:text-green-700 hover:border-b-2 duration-400 border-green-600">

                Home
              </Link>
              <Link to={`/AfterHomePage?page=NEW ARRIVAL`} className="hover:text-green-700 hover:border-b-2 duration-400 border-green-600 ">
                NEW ARRIVAL
              </Link>
              <Link to={`/AfterHomePage?page=PRODUCT`} className="hover:text-green-700 hover:border-b-2 duration-400 border-green-600 ">
                PRODUCT
              </Link>
              <Link to={`/AfterHomePage?page=DISCOUNT`} className="hover:text-green-700 hover:border-b-2 duration-400 border-green-600">
                DISCOUNT
              </Link>

              <a
                onClick={scrollToFooter}
                className="cursor-pointer hover:text-green-700 hover:border-b-2 duration-400 border-green-600"
                href="#contact"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mx-6 mt-8 mb-6">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-28 py-2 border border-gray-300 rounded-full focus:outline-none"
              onChange={handleSearchChange}
              style={{ borderRadius: "8px" }}
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded"
              style={{ borderRadius: "4px" }}
              onClick={handleSearchSubmit}
            >
              SEARCH
            </button>
          </div>

          {/* Log Out Button */}
          {token ?
            <div className="flex justify-center mt-6">
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-6 py-2 w-full rounded-full"
                style={{ borderRadius: "8px" }}
                to='/'

              >
                Log Out
              </button>
            </div>
            :
            <div className="flex justify-center items-center gap-3 ">
              <Link to="/auth/Login">
                <button
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full "
                  style={{ borderRadius: "8px" }}
                >
                  Log In
                </button>
              </Link>
              <NavLink to="/auth/Signup">
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-full "
                  style={{ borderRadius: "8px" }}
                >
                  Sign Up
                </button>
              </NavLink>


            </div>

          }
        </div>
      </div>


      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="bg-white shadow-md md:hidden">
          <div className="flex flex-row items-center justify-center gap-8 pb-4">
            <Link to="/">
              <button className="relative">
                <span role="img" aria-label="cart">
                  <img src={buy} alt="buy_cart" className="w-[30px] h-auto" />
                </span>
              </button>
            </Link>
            {/* Other buttons here */}
            <button onClick={scrollToFooter} className="text-gray-800 mb-2">
              Contact Us
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
