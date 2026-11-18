import { useEffect, useState } from "react";
import { productDiscout } from "../Fetch/FetchAPI";
import HeadMainOffer from "../Section/MainOffer/HeadMainOffer";
import TableOffer from "../Component/TableOffer";
import PageHeader from "../Component/PageHeader";

const MainOffer = () => {
  const [items, setItems] = useState({ data: [] });

  useEffect(() => {
    productDiscout()
      .then((data) => setItems(data || { data: [] }))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Promotions" description="Discounts running now, shown on the storefront deals page" />
      <HeadMainOffer />
      <TableOffer items={items} />
    </div>
  );
};

export default MainOffer;
