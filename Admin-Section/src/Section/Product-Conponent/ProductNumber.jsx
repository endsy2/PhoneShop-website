import { useEffect, useState } from "react";
import { productHeaderData } from "../../Fetch/FetchAPI";

const LABELS = { Product: "Products", Category: "Categories", Inventory: "Units in stock" };

const ProductNumber = () => {
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    productHeaderData()
      .then((response) => setCounts(response?.data?.data || []))
      .catch((error) => console.error("Error fetching product counts:", error));
  }, []);

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {counts.map((element) => (
        <div key={element.label} className="card p-5">
          <p className="text-[13px] text-ink-3">{LABELS[element.label] || element.label}</p>
          <p className="price mt-3 text-[28px] leading-none text-ink">{Number(element.quantity || 0).toLocaleString("en-US")}</p>
        </div>
      ))}
    </section>
  );
};

export default ProductNumber;
