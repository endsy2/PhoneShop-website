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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleCloseTabCart}
        ></div>
      )}

      {/* Cart Panel */}
      <div
        ref={cartRef}
        className={`fixed top-0 right-0 bg-white shadow-2xl w-full sm:w-[420px] h-full flex flex-col z-50
        transform transition-all duration-500 ease-in-out
        ${statusTab ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <p className="text-sm text-green-100">{carts.length} {carts.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 text-2xl font-bold"
            onClick={handleCloseTabCart}
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
          {carts.length > 0 ? (
            <div className="space-y-3">
              {carts.map((item) => (
                <CartItem key={item.productId} product={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-8xl opacity-20">🛒</div>
              <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some products to get started!</p>
              <button
                onClick={handleCloseTabCart}
                className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {carts.length > 0 && (
          <div className="bg-white border-t-2 border-gray-100 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-semibold text-lg">Subtotal:</span>
              <span className="text-3xl font-extrabold text-green-600">
                $
                {carts
                  .reduce((total, item) => total + item.price * item.quantity, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="space-y-3">
              <Link
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                to="/checkout"
                onClick={handleCloseTabCart}
              >
                <span>💳</span>
                <span>Proceed to Checkout</span>
              </Link>
              <button
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                onClick={handleCloseTabCart}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddToCart;
