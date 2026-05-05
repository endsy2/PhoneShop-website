import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import { toggleStatusTab } from "../../store/cart";

const AddToCart = () => {
  const carts = useSelector((state) => state.cart.items);
  const statusTab = useSelector((state) => state.cart.statusTab);
  const dispatch = useDispatch();
  const cartRef = useRef(null);

  const handleCloseTabCart = () => {
    dispatch(toggleStatusTab());
  };

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        statusTab
      ) {
        handleCloseTabCart();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusTab]);

  return (
    <>
      {/* Backdrop */}
      {statusTab && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseTabCart}
        ></div>
      )}

      {/* Cart Panel */}
      <div
        ref={cartRef}
        className={`fixed top-0 right-0 bg-white shadow-xl w-full sm:w-96 h-full flex flex-col z-50
        transform transition-transform duration-500
        ${statusTab ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-green-600 text-white px-5 py-4">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button
            className="text-lg bg-white text-green-600 font-bold px-3 py-1 rounded hover:text-white hover:bg-gray-800 transition-colors"
            onClick={handleCloseTabCart}
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-5 overflow-y-auto">
          {carts.length > 0 ? (
            carts.map((item) => (
              <CartItem key={item.productId} product={item} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 text-center">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-green-600 p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white">Total:</span>
            <span className="text-xl font-bold text-white">
              $
              {carts
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="bg-gray-800 text-white py-2 font-bold rounded hover:bg-gray-700 transition-colors"
              onClick={handleCloseTabCart}
            >
              Close
            </button>
            <Link
              className={`font-bold py-2 rounded flex justify-center items-center transition-colors ${carts.length === 0 ? "pointer-events-none bg-slate-200 text-slate-500" : "bg-white text-green-600 hover:bg-green-500"}`}
              to={carts.length === 0 ? "#" : "/checkout"}
              onClick={carts.length === 0 ? undefined : handleCloseTabCart}
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddToCart;
