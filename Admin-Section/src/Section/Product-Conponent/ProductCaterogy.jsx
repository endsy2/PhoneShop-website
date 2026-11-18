import { useEffect, useState } from "react";
import { categoryFetch, tableByCategory } from "../../Fetch/FetchAPI";
import TableProduct from "../../Component/TableProduct";

// Category chips above the products table
const ProductCaterogy = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState({ data: [] });

  useEffect(() => {
    categoryFetch()
      .then((data) => {
        const list = data?.data || [];
        setCategories(list);
        if (list.length > 0) setSelected(list[0].category_name || "");
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!selected) return;
    tableByCategory({ category: selected })
      .then((data) => setItems(data || { data: [] }))
      .catch((error) => console.error("Error fetching products:", error));
  }, [selected]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category">
        {categories.map(({ category_name }) => (
          <button
            key={category_name}
            type="button"
            role="tab"
            aria-selected={selected === category_name}
            onClick={() => setSelected(category_name)}
            className={`h-8 rounded-lg border px-3 text-[13px] transition-colors duration-150 ease-out ${
              selected === category_name ? "border-ink bg-surface text-ink" : "border-line-strong text-ink-2 hover:text-ink"
            }`}
          >
            {category_name}
          </button>
        ))}
      </div>
      <TableProduct title={selected || "Products"} items={items} category={selected} />
    </section>
  );
};

export default ProductCaterogy;
