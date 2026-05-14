import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeAllCart } from "../../store/cart";
import CheckoutCart from "../../Conponents/CheckoutCart";
import { fetchCheckOut } from "../../FetchAPI/Fetch";
import BakongQR from "../../Components/BakongQR";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";

const CheckoutPage = () => {
  const cart = useSelector((store) => store.cart.items);
  const [totalQuatity, setTotalQuantity] = useState();
  const [token, setToken] = useState("ad");
  const [customerName, setCustomerName] = useState("");
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [response, setResponse] = useState();
  const [error, setError] = useState();
  const [showBakongQR, setShowBakongQR] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null); // holds receipt data after success

  const dispatch = useDispatch();
  const clearCart = () => {
    dispatch(removeAllCart());
  };

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const finalTotal = subtotal;

  const validateForm = () => {
    const nextErrors = {};

    if (!customerName?.trim()) nextErrors.customerName = "Customer name is required";
    if (!delivery) nextErrors.delivery = "Please select delivery type";
    if (!payment) nextErrors.payment = "Please select payment method";
    if (!location?.trim()) nextErrors.location = "Delivery location is required";
    if (!cart.length) nextErrors.cart = "Your cart is empty";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormReady =
    customerName.trim() && delivery && payment && location.trim() && cart.length > 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please complete all required fields");
      setResponse("");
      return;
    }

    // Construct the `data` object with proper syntax
    const data = {
      customerName: customerName.trim(),
      delivery,
      location,
      payment,
      items: cart.map((element) => ({
        spec_id: element.productId,
        quantity: element.quantity,
      })),
    };

    try {
      setSubmitting(true);

      // If Bakong QR selected — show QR first, place order after payment confirmed
      if (payment === "Bakong QR") {
        setPendingOrderData(data);
        setShowBakongQR(true);
        setSubmitting(false);
        return;
      }
      const response = await fetchCheckOut(data);
      if (response) {
        const skipped = response.data?.skippedItems || 0;
        const msg = skipped > 0
          ? `Order placed! ${skipped} item(s) were skipped — please re-add them from the product detail page.`
          : "Order placed successfully!";
        setResponse(msg);
        setError("");
        setCustomerName("");
        setDelivery("");
        setLocation("");
        setPayment("");
        clearCart();
      } else {
        setError("Something went wrong. Please try again.");
        setResponse("");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Checkout failed. Please try again.";
      setError(serverMsg);
      setResponse("");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    let total = 0;
    cart.forEach((item) => (total += item.quantity));
    setTotalQuantity(total);
    setToken(localStorage.getItem('authToken'))
  }, [cart]);


  return (
    <>
      {token ? (
        <div className="flex-col bg-gradient-to-b from-gray-50 to-white pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-extrabold text-gray-900 text-3xl md:text-4xl flex items-center gap-3">
              <span className="text-3xl">🛒</span>
              Checkout
            </h2>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-center gap-6 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
            {/* Left Column - Delivery Information */}
            <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📦</span>
                Delivery Information
              </h3>
              <hr className="mb-6 border-gray-200" />
              
              <form className="space-y-6">
                {/* Recipient Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    RECIPIENT NAME <span className="text-xs text-gray-400 font-normal">(who receives the delivery)</span>
                  </label>
                  <input
                    value={customerName}
                    type="text"
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {fieldErrors.customerName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                {/* Delivery Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    DELIVERY TYPE
                  </label>
                  <select
                    value={delivery || ""}
                    onChange={(e) => setDelivery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Select Delivery Type</option>
                    <option value="Delivery">🚚 Delivery</option>
                    <option value="Pick up">🏪 Pick up</option>
                  </select>
                  {fieldErrors.delivery && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.delivery}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAYMENT METHOD
                  </label>
                  <select
                    value={payment || ""}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Select Payment Method</option>
                    <option value="By Delivery">Cash on Delivery</option>
                    <option value="Bakong QR">Bakong QR</option>
                  </select>
                  {fieldErrors.payment && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.payment}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    DELIVERY LOCATION
                  </label>
                  <input
                    value={location || ""}
                    type="text"
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your address (Village, Street, City)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {fieldErrors.location && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.location}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    disabled={submitting || !isFormReady}
                    className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      submitting || !isFormReady 
                        ? "cursor-not-allowed bg-gray-400" 
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        Place Order
                      </>
                    )}
                  </button>
                </div>

                {/* Response Messages */}
                {(response || error) && (
                  <div className="mt-6">
                    {response && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 font-semibold flex items-center gap-2">
                          <span className="text-xl">✅</span>
                          {response}
                        </p>
                      </div>
                    )}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 font-semibold flex items-center gap-2">
                          <span className="text-xl">❌</span>
                          {error}
                        </p>
                        {error.includes("cart items") && (
                          <button
                            type="button"
                            onClick={() => { clearCart(); setError(""); }}
                            className="mt-3 text-sm underline text-red-600 hover:text-red-800 font-medium"
                          >
                            Clear cart and start fresh
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-full lg:w-1/2 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 lg:sticky lg:top-6 h-fit">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Order Summary
              </h3>
              
              <div className="space-y-4">
                {/* Cart Items Header */}
                <div className="flex justify-between text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fieldErrors.cart && (
                    <p className="text-sm text-red-600 flex items-center gap-1 p-3 bg-red-50 rounded-lg">
                      <span>⚠️</span> {fieldErrors.cart}
                    </p>
                  )}
                  {cart.map((element) => (
                    <CheckoutCart key={element.productId} items={element} />
                  ))}
                </div>

                {/* Summary Calculations */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Total Items:</span>
                    <span className="font-semibold">{totalQuatity || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-xl font-bold text-green-600 pt-2">
                    <span>Total Payment:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bakong QR Modal Overlay */}
          {showBakongQR && pendingOrderData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 backdrop-blur-sm">
              <div className="w-full max-w-sm">
                <BakongQR
                  amount={subtotal}
                  orderData={pendingOrderData}
                  onPaymentSuccess={({ orderId }) => {
                    setShowBakongQR(false);
                    setPendingOrderData(null);
                    // Show receipt popup with order details
                    setPaymentReceipt({
                      orderId,
                      items: pendingOrderData.items,
                      cartItems: cart,
                      total: subtotal,
                      customerName: pendingOrderData.customerName,
                      delivery: pendingOrderData.delivery,
                      location: pendingOrderData.location,
                    });
                    setError("");
                    setCustomerName("");
                    setDelivery("");
                    setLocation("");
                    setPayment("");
                    clearCart();
                  }}
                  onCancel={() => {
                    setShowBakongQR(false);
                    setPendingOrderData(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Payment Success Receipt Modal */}
          {paymentReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
                  <div className="text-5xl mb-2">✅</div>
                  <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                  <p className="text-green-100 text-sm mt-1">Your Bakong payment was confirmed</p>
                </div>

                {/* Receipt Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Order ID */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Order ID</span>
                    <span className="font-bold text-gray-900">#{paymentReceipt.orderId}</span>
                  </div>

                  {/* Customer */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Recipient</span>
                    <span className="font-semibold text-gray-900">{paymentReceipt.customerName}</span>
                  </div>

                  {/* Delivery */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Delivery</span>
                    <span className="font-semibold text-gray-900">{paymentReceipt.delivery}</span>
                  </div>

                  {/* Location */}
                  <div className="flex justify-between items-start py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Address</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">{paymentReceipt.location}</span>
                  </div>

                  {/* Payment Method */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Payment</span>
                    <span className="font-semibold text-green-600">✓ Bakong QR (Paid)</span>
                  </div>

                  {/* Products */}
                  <div className="py-2">
                    <p className="text-gray-500 text-sm mb-3">Items Ordered</p>
                    <div className="space-y-3">
                      {paymentReceipt.cartItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          {item.image ? (
                            <img
                              src={`${NETWORK_CONFIG.apiBaseUrl}/${String(item.image).split(",")[0].trim().replace(/\\/g, "/").replace(/^uploads\//, "")}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/48x48?text=?"; }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">?</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{item.productName || item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                                style={{ background: item.color }}
                              />
                              <span className="text-xs text-gray-500">Qty {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 text-sm">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                    <span className="font-bold text-gray-900 text-lg">Total Paid</span>
                    <span className="font-bold text-green-600 text-xl">${paymentReceipt.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Close Button */}
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setPaymentReceipt(null)}
                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-300 transition-all duration-300"
                  >
                    Close
                  </button>
                  <Link to="/myorder" className="flex-1">
                    <button
                      onClick={() => setPaymentReceipt(null)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300"
                    >
                      View Order
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
          <div className="text-center space-y-8 max-w-md">
            <div className="space-y-4">
              <div className="text-6xl">🔒</div>
              <h2 className="text-3xl font-bold text-gray-900">Sign In Required</h2>
              <p className="text-gray-600">Please log in or create an account to proceed with checkout</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup" className="flex-1">
                <button className="w-full font-bold text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Create Account
                </button>
              </Link>
              <Link to="/auth/login" className="flex-1">
                <button className="w-full font-bold text-lg px-8 py-4 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Log In
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
