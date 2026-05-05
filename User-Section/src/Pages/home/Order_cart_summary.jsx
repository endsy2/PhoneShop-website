import React from "react";
import { Link } from "react-router-dom";

const OrderSummary = ({ items, shipping, total }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-8">Order Summary</h2>
      <hr className="my-4 border-gray-500" />
      <div className="flex justify-between mb-8">
        <span>Items</span>
        <span>{items.length} Items</span>
      </div>
      <div className="flex justify-between mb-8">
        <span>Shipping</span>
        <select className="border p-1 rounded fo">
          <option>Standard Delivery - $5.00</option>
        </select>
      </div>
      <hr className="mb-8 border-gray-500" />
      <div className="flex justify-between font-semibold">
        <span>Total Cost:</span>
        <span className="text-red-600">${total}</span>
      </div>
      <Link to="/checkout">
        <button className="bg-green-400 text-white w-full py-2 rounded mt-8 hover:bg-green-500">
          CHECKOUT
        </button>
      </Link>
    </div>
  );
};

export default OrderSummary;
