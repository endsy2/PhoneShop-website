import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchBrand, fetchCategory, fetchSearchDataByName } from "../../FetchAPI/Fetch";
import ProductCard from "./ProductCard";
import Card from "./Card";

const Search = () => {
  const [params] = useSearchParams();
  const productName = params.get("productName") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    setLoading(true);
    (productName ? fetchSearchDataByName({ phone_name: productName }) : Promise.resolve({ data: [] }))
      .then((response) => setResults(response?.data || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [productName]);

  useEffect(() => {
    fetchCategory().then((r) => setCategories(r?.data || [])).catch((e) => console.error(e));
    fetchBrand().then((r) => setBrands(r?.data || [])).catch((e) => console.error(e));
  }, []);

  return (
    <div className="page-container pt-8">
      <p className="text-sm text-ink-3">Search results</p>
      <h1 className="mt-1 text-3xl tracking-[-0.01em]">&ldquo;{productName}&rdquo;</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="text-sm font-medium">Categories</h2>
          <div className="mt-3 flex flex-col gap-2">
            {categories.map((element) => (
              <Card key={element.category_name} data={element} page="Categories" />
            ))}
          </div>
        </aside>

        <section>
          {loading ? (
            <p className="py-16 text-center text-sm text-ink-3">Searching</p>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-sm text-ink">No products match &ldquo;{productName}&rdquo;</p>
              <p className="mt-1 text-[13px] text-ink-3">Try a shorter name, or browse a category or brand</p>
            </div>
          ) : (
            <>
              <p className="price mb-4 text-sm text-ink-3">{results.length} products</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {results.map((element) => (
                  <ProductCard key={`${element.phone_id}-${element.spec_id || ""}`} product={element} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {brands.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-5">Brands</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.map((element) => (
              <Card key={element.brand_name} data={element} page="Brands" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Search;
