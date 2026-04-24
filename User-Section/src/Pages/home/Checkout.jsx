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
  const [delivery, setDelivery] = useState();
  const [payment, setPayment] = useState();
  const [location, setLocation] = useState();
  const [response, setResponse] = useState();
  const [error, setError] = useState();

  const dispatch = useDispatch();
  const clearCart = () => {
    dispatch(removeAllCart());
  };
  const handleSubmit = async () => {
    if (!customerName?.trim()) {
      setError("Please enter customer name");
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
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="pb-2">Delivery Express</h4>
                      <select
                        value={delivery || ""}
                        onChange={(e) => setDelivery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option>Select Delivery Type</option>
                        <option>Delivery</option>
                        <option>Pick up</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="pb-2">PAY METHOD</h4>
                      <select
                        value={payment || ""}
                        onChange={(e) => setPayment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option>Select Delivery Type</option>
                        <option>By Delivery</option>
                        <option>Paid</option>
                      </select>
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
                    </div>
                    <div className="flex items-center justify-center pt-6 col-span-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                        className="w-[300px] p-2 bg-green-400 hover:bg-green-500 text-white rounded transition-all duration-300"
                      >
                        Pay Now
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
                  {cart.map((element, index) => (
                    <CheckoutCart items={element} />
                  ))}
                  <p className="flex justify-between py-2 mt-5">
                    <span>Amount Quantity:</span>{" "}
                    <span>{totalQuatity | 0}</span>
                  </p>
                  <hr className="my-4 border-gray-300" />
                  <p className="flex justify-between font-semibold text-red-600 text-lg pt-2">
                    <span>Total Payment:</span>
                    <span>
                      $
                      {cart
                        .reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                        .toFixed(2)}
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
