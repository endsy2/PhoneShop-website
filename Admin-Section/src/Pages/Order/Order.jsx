import { useEffect, useState } from "react";
import TableProduct from "../../Component/TableProduct";
import Order_main from "../../Section/Order/Order_main";
import { OrderTableFetch, productData } from "../../Fetch/FetchAPI";
import TableOrder from "../../Component/TableOrder";

const Order = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await OrderTableFetch();

        // console.log(data);

        setItems(data); // Update state with fetched data
      } catch (error) {
        console.log("Error fetching initial data:", error);
      }
    };
    fetchOrder();
  }, []);

  return (
    <section>
      <Order_main />
      <TableOrder title="Order" items={items?.data || { data: [] }} />
    </section>
  );
};

export default Order;
