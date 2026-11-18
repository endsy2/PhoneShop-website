import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProductByBrand, fetchProductByCategory } from "../../FetchAPI/Fetch";
import ProductListing from "../../Components/ProductListing";

// Products in one category (?category=) or from one brand (?brand=)
const Category = () => {
  const [params] = useSearchParams();
  const category = params.get("category");
  const brand = params.get("brand");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const request = category ? fetchProductByCategory({ category }) : fetchProductByBrand({ brand });
    request
      .then((response) => setData(response?.data || []))
      .catch(() => setError("Couldn’t load these products. Please try again"))
      .finally(() => setLoading(false));
  }, [category, brand]);

  const title = category || brand || "Products";
  return <ProductListing title={title} breadcrumb={[{ label: title }]} data={data} loading={loading} error={error} />;
};

export default Category;
