import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "./ProductCard";
import Card from "./Card";
import Price from "../../Components/Price";
import ProductImage from "../../Components/ProductImage";
import {
  fetchBrand,
  fetchCategory,
  fetchdataProduct,
  fetchProductByCategory,
  fetchProductByDate,
  fetchProductDiscount,
} from "../../FetchAPI/Fetch";

const productKey = (p) => `${p.phone_id}-${p.spec_id || p.promo_id || p.idphone_variants || ""}`;
const detailUrl = (p) => `/product-detail?phone_id=${p.phone_id}&phone_name=${encodeURIComponent(p.name || "")}`;

const SectionHeader = ({ title, subtitle, to }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
    </div>
    {to && (
      <Link to={to} className="inline-flex shrink-0 items-center gap-1.5 text-sm text-ink-2 transition-colors duration-150 ease-out hover:text-ink">
        View all <FiArrowRight size={14} strokeWidth={1.5} />
      </Link>
    )}
  </div>
);

// One horizontally scrolling row of product cards
const ProductRow = ({ products }) => (
  <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    {products.map((product) => (
      <div key={productKey(product)} className="w-[220px] shrink-0 snap-start">
        <ProductCard product={product} />
      </div>
    ))}
  </div>
);

const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {products.map((product) => (
      <ProductCard key={productKey(product)} product={product} />
    ))}
  </div>
);

const Section = ({ children }) => <section className="page-container mt-16">{children}</section>;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [discountProducts, setDiscountProducts] = useState([]);
  const [newArrival, setNewArrival] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [smartWatches, setSmartWatches] = useState([]);
  const [phones, setPhones] = useState([]);

  useEffect(() => {
    const load = (request, setter) =>
      request()
        .then((response) => setter(response?.data || []))
        .catch((error) => console.error(error));

    load(fetchdataProduct, setProducts);
    load(fetchProductDiscount, setDiscountProducts);
    load(fetchProductByDate, setNewArrival);
    load(fetchCategory, setCategories);
    load(fetchBrand, setBrands);
    load(() => fetchProductByCategory({ category: "Accessories" }), setAccessories);
    load(() => fetchProductByCategory({ category: "Smartwatches" }), setSmartWatches);
    load(() => fetchProductByCategory({ category: "Smartphones" }), setPhones);
  }, []);

  const deals = Array.from(new Map(discountProducts.map((item) => [item.phone_id, item])).values());
  const featured = deals[0] || products[0];

  return (
    <div className="pb-4">
      {/* Hero: what the shop is, next to today's best deal */}
      <section className="page-container grid items-center gap-10 pt-10 md:grid-cols-2 md:pt-16">
        <div className="max-w-xl">
          <p className="text-sm text-ink-3">Genius Store · Phnom Penh</p>
          <h1 className="mt-3 text-4xl font-medium leading-[1.08] tracking-[-0.02em] md:text-[52px]">
            Phones, watches and accessories, delivered across Phnom Penh
          </h1>
          <p className="mt-5 text-lg leading-7 text-ink-2">
            Order online and pay cash on delivery or with Bakong KHQR.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/AfterHomePage?page=PRODUCT" className="btn btn-dark btn-lg">Shop all products</Link>
            <Link to="/AfterHomePage?page=DISCOUNT" className="btn btn-secondary btn-lg">See deals</Link>
          </div>
        </div>

        {featured && (
          <Link to={detailUrl(featured)} className="group card block p-3 transition-colors duration-150 ease-out hover:border-line-strong">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-raised">
              <ProductImage src={featured.images || featured.image} alt={featured.name} className="h-full w-full p-8" />
            </div>
            <div className="flex items-end justify-between gap-4 px-3 pb-3 pt-5">
              <div>
                <p className="text-[13px] text-ink-3">{featured.price_discount ? "Deal of the day" : "Featured"}</p>
                <p className="mt-1 text-lg text-ink">{featured.name}</p>
              </div>
              <Price
                size="lg"
                price={featured.price_discount ?? featured.price}
                original={featured.price_discount ? featured.price : null}
                className="justify-end"
              />
            </div>
          </Link>
        )}
      </section>

      {brands.length > 0 && (
        <Section>
          <SectionHeader title="Brands" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.map((element) => (
              <Card key={element.brand_name} data={element} page="Brands" />
            ))}
          </div>
        </Section>
      )}

      {deals.length > 0 && (
        <Section>
          <SectionHeader title="Deals" subtitle="Promotions running now" to="/AfterHomePage?page=DISCOUNT" />
          <ProductRow products={deals} />
        </Section>
      )}

      {newArrival.length > 0 && (
        <Section>
          <SectionHeader title="New arrivals" subtitle="Released in the last six months" to="/AfterHomePage?page=NEW ARRIVAL" />
          <ProductGrid products={newArrival} />
        </Section>
      )}

      {phones.length > 0 && (
        <Section>
          <SectionHeader title="Smartphones" to="/Sort?category=Smartphones" />
          <ProductRow products={phones} />
        </Section>
      )}

      {categories.length > 0 && (
        <Section>
          <SectionHeader title="Shop by category" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((element) => (
              <Card key={element.category_name} data={element} page="Categories" />
            ))}
          </div>
        </Section>
      )}

      {accessories.length > 0 && (
        <Section>
          <SectionHeader title="Accessories" to="/Sort?category=Accessories" />
          <ProductRow products={accessories} />
        </Section>
      )}

      {smartWatches.length > 0 && (
        <Section>
          <SectionHeader title="Smartwatches" to="/Sort?category=Smartwatches" />
          <ProductRow products={smartWatches} />
        </Section>
      )}

      {products.length > 0 && (
        <Section>
          <SectionHeader title="All products" to="/AfterHomePage?page=PRODUCT" />
          <ProductGrid products={products} />
        </Section>
      )}
    </div>
  );
};

export default HomePage;
