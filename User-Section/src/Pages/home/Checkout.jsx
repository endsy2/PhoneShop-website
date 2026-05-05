import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeAllCart } from "../../store/cart";
import CheckoutCart from "../../Conponents/CheckoutCart";
import { fetchCheckOut } from "../../FetchAPI/Fetch";

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
      // Send the data to the server using the `fetchCheckOut` function
      const response = await fetchCheckOut(data);
      if (response) {
        setResponse("Sucessfully");
        setError("");
        setCustomerName("");
        setDelivery("");
        setLocation("");
        setPayment("");
        clearCart();
      } else {
        setError("Something went wrong");
        setResponse("");
      }
      console.log("Checkout response:", response);
    } catch (error) {
      console.error("Error during checkout:", error);
      setError(error?.message || error?.error || error?.data?.message || "Checkout failed. Please try again.");
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
        <div className="flex-col bg-gray-100 pt-2">
          <h2 className="mb-4 mt-2 pl-8 font-bold text-gray-900 text-2xl">
            GUEST CHECKOUT
          </h2>
          <div className="flex flex-col lg:flex-row justify-center px-8 pb-8 bg-gray-100 min-h-screen">
            <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
              <hr className="my-4 border-gray-300" />
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    DELIVERY INFORAMATON
                  </h3>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col w-full col-span-2">
                      <h4 className="pb-2">CUSTOMER NAME</h4>
                      <input
                        value={customerName}
                        type="text"
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {fieldErrors.customerName ? (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.customerName}</p>
                      ) : null}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="pb-2">Delivery Express</h4>
                      <select
                        value={delivery || ""}
                        onChange={(e) => setDelivery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Delivery Type</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Pick up">Pick up</option>
                      </select>
                      {fieldErrors.delivery ? (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.delivery}</p>
                      ) : null}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="pb-2">PAY METHOD</h4>
                      <select
                        value={payment || ""}
                        onChange={(e) => setPayment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Payment Method</option>
                        <option value="By Delivery">By Delivery</option>
                        <option value="Paid">Paid</option>
                      </select>
                      {fieldErrors.payment ? (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.payment}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col w-full col-span-2">
                      <h4 className="pb-2">LOCATION</h4>
                      <input
                        value={location || ""}
                        type="text"
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Village"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {fieldErrors.location ? (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-center pt-6 col-span-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                        disabled={submitting || !isFormReady}
                        className={`w-[300px] p-2 text-white rounded transition-all duration-300 ${submitting || !isFormReady ? "cursor-not-allowed bg-slate-400" : "bg-green-400 hover:bg-green-500"}`}
                      >
                        {submitting ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                    <div className="mt-10">
                      {response ? (
                        <p className="text-green-600 font-bold text-lg ">
                          {response}
                        </p>
                      ) : (
                        <p className="text-red-600 font-bold text-lg">
                          {error}
                        </p>
                      )}
                    </div>
                  </form>
                </div>
                {/* <CreditCard /> */}
              </div>
            </div>
            <div className="w-full  lg:w-1/2 mt-8 lg:mt-0 lg:ml-6 bg-white p-6 rounded-lg shadow-md">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">
                  ORDER SUMMARY
                </h3>
                <div className="flex justify-between mt-8">
                  <p>Product Name</p>
                  <p>Quantity</p>
                  <p>Price</p>
                </div>
                <div className=" border-t pt-4 py-4">
                  {fieldErrors.cart ? (
                    <p className="pb-2 text-sm text-red-600">{fieldErrors.cart}</p>
                  ) : null}
                  {cart.map((element) => (
                    <CheckoutCart key={element.productId} items={element} />
                  ))}

                  <p className="flex justify-between py-2 mt-5">
                    <span>Amount Quantity:</span>{" "}
                    <span>{totalQuatity | 0}</span>
                  </p>
                  <p className="flex justify-between py-1 text-sm text-slate-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </p>
                  <hr className="my-4 border-gray-300" />
                  <p className="flex justify-between font-semibold text-red-600 text-lg pt-2">
                    <span>Total Payment:</span>
                    <span>
                      ${finalTotal.toFixed(2)}
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center py-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-20 justify-center items-center py-36">
          <Link to="/auth/signup">
            <button className="w-[200px] font-bold text-xl p-3 bg-green-600 hover:bg-green-500 text-white rounded transition-all duration-300 text-center">
              Create Account
            </button>
          </Link>
          <Link to="/auth/login">
            <button className="w-[150px] font-bold text-xl p-3 bg-green-600 hover:bg-green-500 text-white rounded transition-all duration-300 text-center">
              Log In
            </button>
          </Link>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
