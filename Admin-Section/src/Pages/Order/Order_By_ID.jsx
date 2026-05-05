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
  const nav = useNavigate();

  const fetchDataOrderItems = async () => {
    try {
      const response = await fetchOrderItemsByID(id);
      if (response) {
        setOrdersItems(response.orderItems);
        setOrders(response.customerData);
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

  return (
    <div className="container mx-auto bg-white rounded-lg shadow-xl mt-8 p-4 lg:p-8">
      {orders ? (
        <div className="space-y-8">
          {/* Customer Details Section */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600">Customer Name</p>
                <p className="text-black font-semibold">{orders[0]?.display_name || orders[0]?.username || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="text-black font-semibold">{orders[0]?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <p className="text-black font-semibold">{orders[0]?.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="text-black font-semibold">
                  {formatDate(orders[0]?.order_date) || "N/A"}
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
