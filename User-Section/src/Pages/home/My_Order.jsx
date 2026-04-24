import axios from "axios";
import { NETWORK_CONFIG, USERENDPOINT } from "../../network/Network_EndPoint";

import React, { useState, useEffect } from 'react';

const MyOrderPage = () => {
    const [listOrderState, setListOrderState] = useState([]);

    const getOrder = async () => {
        let orderUrl = `${NETWORK_CONFIG.apiBaseUrl}${USERENDPOINT.GET_ORDER}`;
        console.log(orderUrl);
        try {
            // setListOrderState(myOrderData);
            const response = await axios.get(orderUrl, { withCredentials: true });
            if (response.status === 200) {
                const groupedOrders = groupOrdersByOrderId(response.data.data);
                setListOrderState(groupedOrders);
                console.log(groupedOrders);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const groupOrdersByOrderId = (orders) => {
        return Object.values(
            orders.reduce((acc, order) => {
                const { order_id } = order;
                if (!acc[order_id]) {
                    acc[order_id] = {
                        orderNumber: order.order_id,
                        username: order.username,
                        date: order.order_date,
                        status: order.status,
                        items: [],
                        total: 0,
                    };
                }
                acc[order_id].items.push({
                    order_item_id: order.order_item_id,
                    quantity: order.quantity,
                    price: parseFloat(order.amount_per_total_orderItem),
                    name: order.phone_name,
                    description: `Color: ${order.color}`,
                    image: order.images,
                });
                acc[order_id].total += parseFloat(order.amount_per_total_orderItem);
                return acc;
            }, {})
        );
    };

    useEffect(() => {
        getOrder();
    }, []);

    return (
        <div>
            <h1 className="text-green-600 text-3xl font-bold mb-4">My Orders</h1>
            <div className="space-y-4">
                {listOrderState.map((order) => (
                    <OrderCard key={order.orderNumber} order={order} />
                ))}
            </div>
        </div>
    );
};

export const OrderCard = ({ order }) => {
    return (
        <div className="p-6 bg-white shadow-lg rounded-lg w-full sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto">
            {/* Order Header */}
            <div className="border-b pb-4">
                <h2 className="text-lg font-bold">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
            </div>

            {/* Order Items */}
            <div className="mt-4 space-y-4">
                {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <img
                            src={`${NETWORK_CONFIG.apiBaseUrl}/${item.image}`}
                            alt={item.name}
                            className="w-16 h-16 rounded"
                        />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold">{item.name}</h3>
                            <p className="text-xs text-gray-500">{item.description}</p>
                            <p className="text-sm font-bold">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Qty: {item.quantity}</p>
                    </div>
                ))}
            </div>

            {/* Total Section */}
            <div className="mt-4 bg-gray-100 p-4 rounded flex justify-between items-center">
                <div>
                    <p className="text-lg font-bold">
                        Total: <span className="text-green-500">${order.total.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        ({order.items.reduce((acc, item) => acc + item.quantity, 0)} Items)
                    </p>
                </div>
                <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                    Detail
                </button>
            </div>
        </div>
    );
};


export default MyOrderPage;
