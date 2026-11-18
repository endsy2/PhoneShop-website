import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import ProductCard from "../Pages/home/ProductCard";
import Breadcrumb from "./Breadcrumb";

const PRICE_RANGES = {
  all: () => true,
  under300: (p) => p < 300,
  "300to700": (p) => p >= 300 && p <= 700,
  over700: (p) => p > 700,
};

const SORTS = {
  featured: () => 0,
  priceLow: (a, b) => a.finalPrice - b.finalPrice,
  priceHigh: (a, b) => b.finalPrice - a.finalPrice,
  nameAsc: (a, b) => String(a.name || "").localeCompare(String(b.name || "")),
  nameDesc: (a, b) => String(b.name || "").localeCompare(String(a.name || "")),
};

// A titled product grid with search-in-list, price range and sort. Used by the category,
// brand and collection pages.
const ProductListing = ({ title, subtitle, breadcrumb, data = [], loading = false, error = "" }) => {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data
      .map((item) => ({ ...item, finalPrice: Number(item?.price_discount ?? item?.price ?? 0) }))
      .filter((item) => (!q || String(item.name || "").toLowerCase().includes(q)) && PRICE_RANGES[priceRange](item.finalPrice))
      .sort(SORTS[sortBy]);
  }, [data, query, priceRange, sortBy]);

  const filtered = query || priceRange !== "all";

  return (
    <div className="page-container pt-6">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[-0.01em]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
        </div>
        {!loading && <span className="price text-sm text-ink-3">{products.length} products</span>}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-y border-line py-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this list" aria-label="Search this list" className="input pl-9" />
        </div>
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="input sm:w-44" aria-label="Price">
          <option value="all">Any price</option>
          <option value="under300">Under $300</option>
          <option value="300to700">$300 to $700</option>
          <option value="over700">Over $700</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input sm:w-48" aria-label="Sort">
          <option value="featured">Featured</option>
          <option value="priceLow">Price, low to high</option>
          <option value="priceHigh">Price, high to low</option>
          <option value="nameAsc">Name, A to Z</option>
          <option value="nameDesc">Name, Z to A</option>
        </select>
      </div>

      {error && <p className="mt-6 rounded-lg bg-danger-soft p-4 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-3">Loading products</p>
      ) : products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((item) => (
            <ProductCard key={`${item.phone_id}-${item.spec_id || item.promo_id || ""}`} product={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm text-ink">{filtered ? "No products match these filters" : "Nothing here yet"}</p>
          {filtered && (
            <button type="button" onClick={() => { setQuery(""); setPriceRange("all"); }} className="btn btn-secondary btn-sm mt-4">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
