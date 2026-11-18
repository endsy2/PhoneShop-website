import { useEffect, useState } from "react";
import Order_main from "../../Section/Order/Order_main";
import { OrderTableFetch } from "../../Fetch/FetchAPI";
import TableOrder from "../../Component/TableOrder";
import PageHeader from "../../Component/PageHeader";

const Order = () => {
  const [items, setItems] = useState({ data: [] });

  useEffect(() => {
    OrderTableFetch()
      .then((response) => setItems(response?.data || { data: [] }))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Newest first" />
      <Order_main />
      <TableOrder items={items} />
    </div>
  );
};

export default Order;
