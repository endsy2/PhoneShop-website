import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteOrderItemByID, fetchOrderItemsByID, removeOrder } from "../../Fetch/FetchAPI.js";
import Model from "../../Utils/Model/Model";
import { edit, trash } from "../../Assets";

const Order_By_ID = () => {
  const { id } = useParams();
  const [ordersItems, setOrdersItems] = useState([]);
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(false);
  const [idEdit, setIDEdit] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const nav = useNavigate();

  const fetchDataOrderItems = async () => {
    try {
      const response = await fetchOrderItemsByID(id);
      if (response) {
        setOrdersItems(response.orderItems);
        setOrders(response.customerData);
        // Set initial status - normalize to lowercase for consistent comparison
        if (response.customerData && response.customerData[0]) {
          const rawStatus = response.customerData[0].status || "pending";
          setCurrentStatus(rawStatus.toLowerCase());
        }
      } else {
        console.error("No order items data received");
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const handleRemoveItems = async (e, { id }) => {
    try {
      e.preventDefault();
      await deleteOrderItemByID({ id });
      window.location.reload();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const removeOrderFetch = async ({ id }) => {
    try {
      await removeOrder({ deleteid: id });
      nav(-1);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchDataOrderItems();
  }, [id]);

  // Status configuration for visual tracker
  const statusSteps = [
    { key: "pending", label: "Pending", icon: "⏳", color: "#fbbf24" },
    { key: "completed", label: "Completed", icon: "✓", color: "#a855f7" },
    { key: "shipping", label: "Shipping", icon: "🚚", color: "#3b82f6" },
    { key: "delivered", label: "Delivered", icon: "✅", color: "#22c55e" },
  ];

  return (
    <div className="container mx-auto bg-white rounded-lg shadow-xl mt-8 p-4 lg:p-8">
      {orders ? (
        <div className="space-y-8">
          {/* Order Header with Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{orders[0]?.order_id}</h1>
              <p className="text-gray-600 mt-1">Placed on {formatDate(orders[0]?.order_date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-green-500 cursor-pointer"
                value={currentStatus}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    const response = await fetch(`http://localhost:3000/admin/updateOrderStatus/${orders[0].order_id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ status: newStatus })
                    });
                    if (response.ok) {
                      setCurrentStatus(newStatus);
                    } else {
                      const data = await response.json();
                      alert(`Failed: ${data.message}`);
                    }
                  } catch (error) {
                    alert(`Error: ${error.message}`);
                  }
                }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Customer & Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Account Username:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.username || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Recipient Name:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.recipient_name || orders[0]?.display_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Phone Number:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.phone_number || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Delivery Type:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.delivery || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 font-medium">Delivery Address:</span>
                  <span className="text-gray-900 font-semibold bg-white px-3 py-2 rounded-lg">
                    {orders[0]?.location || orders[0]?.address || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Order Date:</span>
                  <span className="text-gray-900 font-semibold">{formatDate(orders[0]?.order_date)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <span className="text-gray-900 font-semibold">{orders[0]?.payment || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Payment Status:</span>
                  <span className={`font-bold px-3 py-1 rounded-full ${
                    orders[0]?.payment_verified === 1 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {orders[0]?.payment_verified === 1 ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="text-gray-900 font-bold text-lg">
                    ${ordersItems.reduce((total, item) => {
                      const price = parseFloat(item.discount_price_per_unit || item.price_per_unit || 0);
                      return total + price * item.quantity;
                    }, 0).toFixed(2)}
                  </span>
                </div>
                
                {/* Payment Action Buttons - Show based on payment status */}
                {orders[0]?.payment_verified === 0 ? (
                  // Payment is pending - show Confirm button
                  <div className="pt-3 border-t border-purple-200 space-y-2">
                    <button
                      onClick={async () => {
                        const paymentMethod = orders[0]?.payment || '';
                        const confirmMessage = paymentMethod === 'By Delivery' 
                          ? 'Confirm that cash payment has been collected upon delivery?'
                          : 'Confirm that payment has been received for this order?';
                        
                        if (window.confirm(confirmMessage)) {
                          try {
                            const response = await fetch(`http://localhost:3000/admin/confirmPayment/${orders[0].order_id}`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json'
                              },
                              credentials: 'include'
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok) {
                              alert('Payment confirmed successfully!');
                              window.location.reload();
                            } else {
                              console.error('Server error:', data);
                              alert(`Failed to confirm payment: ${data.message || 'Unknown error'}`);
                            }
                          } catch (error) {
                            console.error('Error confirming payment:', error);
                            alert(`Error confirming payment: ${error.message}`);
                          }
                        }
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">✓</span>
                      {orders[0]?.payment === 'By Delivery' 
                        ? 'Confirm Cash Collected' 
                        : 'Confirm Payment Received'}
                    </button>
                    <p className="text-xs text-gray-600 text-center">
                      {orders[0]?.payment === 'By Delivery'
                        ? 'Click after delivery person collects cash payment'
                        : 'Click to verify that payment has been received'}
                    </p>
                  </div>
                ) : (
                  // Payment is verified - show Cancel button
                  <div className="pt-3 border-t border-purple-200 space-y-2">
                    <button
                      onClick={async () => {
                        if (window.confirm('Cancel/Reject this payment? This will mark the payment as unpaid.')) {
                          try {
                            const response = await fetch(`http://localhost:3000/admin/cancelPayment/${orders[0].order_id}`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json'
                              },
                              credentials: 'include'
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok) {
                              alert('Payment canceled successfully!');
                              window.location.reload();
                            } else {
                              console.error('Server error:', data);
                              alert(`Failed to cancel payment: ${data.message || 'Unknown error'}`);
                            }
                          } catch (error) {
                            console.error('Error canceling payment:', error);
                            alert(`Error canceling payment: ${error.message}`);
                          }
                        }
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">✕</span>
                      Cancel Payment
                    </button>
                    <p className="text-xs text-gray-600 text-center">
                      Mark payment as unpaid/rejected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-md border border-amber-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Items:</span>
                  <span className="text-gray-900 font-semibold">
                    {ordersItems.reduce((total, item) => total + parseInt(item.quantity || 0), 0)} items
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Order Status:</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    currentStatus === 'delivered' ? 'bg-green-200 text-green-800' :
                    currentStatus === 'shipping' ? 'bg-blue-200 text-blue-800' :
                    currentStatus === 'completed' ? 'bg-purple-200 text-purple-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {currentStatus === 'delivered' ? '✅ Delivered' :
                     currentStatus === 'shipping' ? '🚚 Shipping' :
                     currentStatus === 'completed' ? '✓ Completed' :
                     '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Customer ID:</span>
                  <span className="text-gray-900 font-semibold">#{orders[0]?.customer_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Order ID:</span>
                  <span className="text-gray-900 font-semibold">#{orders[0]?.order_id || "N/A"}</span>
                </div>
              </div>
              
              {/* Delete Order Button */}
              <div className="pt-4 mt-4 border-t border-amber-200">
                <button
                  onClick={() => {
                    if (window.confirm('⚠️ Delete this order? This will permanently remove the order from both admin and user panels.')) {
                      removeOrderFetch({ id: orders[0].order_id });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🗑️</span>
                  Delete Order
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Permanently remove this order
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ordered Products</h2>
            <div className="bg-gray-50 text-sm p-6 rounded-lg shadow-md">
              <div className="hidden sm:grid grid-cols-6 md:grid-cols-8 lg:grid-cols-9 font-semibold text-gray-500 mb-4">
                <p className="col-span-2">Product</p>
                <p className="text-center">Color</p>
                <p className="text-center">Qty</p>
                <p className="text-center">Unit Price</p>
                <p className="text-center hidden lg:block">Discount</p>
                <p className="text-center hidden lg:block">Total</p>
                <p className="text-center hidden lg:block">Discounted Total</p>
              </div>
              {ordersItems.length > 0 ? (
                ordersItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 items-center py-4 border-t"
                  >
                    {/* Product Details */}
                    <div className="col-span-2 flex items-center gap-4">
                      <img
                        src={
                          item.images
                            ? `http://localhost:3000/${item.images.split(",")[0].trim().replace(/\\/g, "/").replace(/^uploads\//, "")}`
                            : "http://localhost:3000/fallback.jpg"
                        }
                        alt={item.phone_name || "Product Image"}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/64x64?text=No+Image"; }}
                      />
                      <p className="truncate">{item.phone_name}</p>
                    </div>

                    {/* Color */}
                    <div className="flex justify-center">
                      <div
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>

                    {/* Quantity */}
                    <p className="text-center">{item.quantity}</p>

                    {/* Unit Price */}
                    <p className="text-center">{item.price_per_unit}$</p>

                    {/* Discount */}
                    <p className="text-center hidden lg:block">{item.discount_percentage || 0}%</p>

                    {/* Total */}
                    <p className="text-center hidden lg:block">{item.total_before_discount}$</p>

                    {/* Discounted Total */}
                    <p className="text-center hidden lg:block">{item.total_after_discount}$</p>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2">
                      <button>
                        <img
                          src={trash}
                          alt="Remove"
                          className="w-6 h-6 cursor-pointer"
                          onClick={(e) => handleRemoveItems(e, { id: item.order_item_id })}
                        />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No products found.</p>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="text-right space-y-2">
            <div className="flex justify-between md:justify-end gap-8">
              <p className="text-gray-500">Subtotal</p>
              <p className="text-black font-semibold">
                {ordersItems.reduce((total, item) => total + parseFloat(item.amount_per_total_orderItem || 0), 0).toFixed(2)}$
              </p>
            </div>
            <div className="flex justify-between md:justify-end gap-8">
              <p className="text-gray-500">Discount</p>
              <p className="text-black font-semibold">
                {ordersItems.reduce((total, item) => {
                  const discounted = parseFloat(item.discount_price_per_unit || item.price_per_unit || 0);
                  const original = parseFloat(item.price_per_unit || 0);
                  return total + (original - discounted) * item.quantity;
                }, 0).toFixed(2)}$
              </p>
            </div>
            <div className="flex justify-between md:justify-end gap-8 text-xl font-bold">
              <p className="text-gray-600">Total</p>
              <p className="text-black font-semibold">
                {ordersItems.reduce((total, item) => {
                  const price = parseFloat(item.discount_price_per_unit || item.price_per_unit || 0);
                  return total + price * item.quantity;
                }, 0).toFixed(2)}$
              </p>
            </div>
          </div>

          {/* Delete Order Button */}
          <div className="flex justify-end">
            <button
              className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
              onClick={() => removeOrderFetch({ id: orders[0].order_id })}
            >
              Delete Order
            </button>
          </div>

          {/* Model for Update Order */}
        </div>
      ) : (
        <div className="text-center text-gray-600">Loading order details...</div>
      )}
    </div>
  );
};

export default Order_By_ID;
