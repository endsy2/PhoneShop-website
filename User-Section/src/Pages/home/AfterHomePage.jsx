import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchdataProduct, fetchProductByDate, fetchProductDiscount } from "../../FetchAPI/Fetch";
import ProductListing from "../../Components/ProductListing";

// Collections linked from the header: ?page=NEW ARRIVAL | DISCOUNT | PRODUCT
const COLLECTIONS = {
  "NEW ARRIVAL": { title: "New arrivals", subtitle: "Released in the last six months", load: fetchProductByDate },
  DISCOUNT: { title: "Deals", subtitle: "Promotions running now", load: fetchProductDiscount },
  PRODUCT: { title: "All products", load: fetchdataProduct },
};

const AfterHomePage = () => {
  const [params] = useSearchParams();
  const collection = COLLECTIONS[params.get("page")] || COLLECTIONS.PRODUCT;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    collection
      .load()
      .then((response) => setData(response?.data || []))
      .catch(() => setError("Couldn’t load products right now. Please try again"))
      .finally(() => setLoading(false));
  }, [collection]);

  return (
    <ProductListing
      title={collection.title}
      subtitle={collection.subtitle}
      breadcrumb={[{ label: collection.title }]}
      data={data}
      loading={loading}
      error={error}
    />
  );
};

export default AfterHomePage;
