import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiColumns, FiHeart, FiMinus, FiPhone, FiPlus, FiShoppingBag, FiTruck } from "react-icons/fi";
import { fetchdataProduct, fetchProductByName } from "../../FetchAPI/Fetch";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { addtofavorite, removeFromFavorite } from "../../store/favorite";
import { addToCompare } from "../../store/compare";
import ProductCard from "./ProductCard";
import ProductReviews from "../../Components/ProductReviews";
import Breadcrumb from "../../Components/Breadcrumb";
import Price from "../../Components/Price";
import ProductImage from "../../Components/ProductImage";

const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";

const ProductDetail = () => {
  const [items, setItems] = useState([]);
  const [arrayImage, setArrayImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [, setSelectedSpec] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favorite = useSelector((store) => store.favorite.favorite);
  const [product, setProduct] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("phone_name");
  const phoneId = searchParams.get("phone_id");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductByName({ phone_name: query, phone_id: phoneId });

      if (!response || !response.data || response.data.length === 0) {
        throw new Error("No data found for the product.");
      }

      const productData = response.data;
      setItems(productData);

      // Set default values
      const defaultProduct = productData[0];
      const images = defaultProduct.images
        ?.split(",")
        .map((image) =>
          image.trim().replaceAll("uploads\\", "").replace(/\s+/g, "")
        );
      setArrayImage(images || []);
      setSelectedImage(images?.[0] || "");
      setSelectedColor(defaultProduct.color);
      setSelectedStorage(defaultProduct.storage);
      setSelectedSpec({
        idphone_variants: defaultProduct.idphone_variants,
        storage: defaultProduct.storage,
        specs: defaultProduct.specs || {},
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, phoneId]);

  const handlefetchProduct = async () => {
    const response = await fetchdataProduct();
    setProduct(response.data);
  };

  const handleAddToCart = () => {
    if (!selectedItem?.spec_id) {
      return;
    }

    const maxStock = Number(selectedItem?.spec_stock ?? selectedItem?.color_stock ?? 0);
    const finalQuantity = Math.max(1, Math.min(quantity, maxStock || quantity));

    dispatch(
      addToCart({
        productId: selectedItem.spec_id,
        productName: selectedItem.name,
        quantity: finalQuantity,
        price: selectedItem.price_discount || selectedItem.price,
        image: selectedItem.images || selectedItem.image || "",
        color: selectedItem.color || "",
      })
    );
    dispatch(toggleStatusTab());
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchData();
    handlefetchProduct();
  }, [fetchData, query, phoneId]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setQuantity(1);
    const productByColor = items.find((item) => item.color === color);

    if (productByColor) {
      const images = productByColor.images
        ?.split(",")
        .map((image) =>
          image.trim().replaceAll("uploads\\", "").replace(/\s+/g, "")
        );
      setArrayImage(images || []);
      setSelectedImage(images?.[0] || "");
      setSelectedStorage(productByColor.storage);
      setSelectedSpec({
        idphone_variants: productByColor.idphone_variants,
        storage: productByColor.storage,
        specs: productByColor.specs || {},
      });
    }
  };

  const handeAddToFavorite = () => {
    if (
      favorite.findIndex((element) => element === selectedItem.phone_id) >= 0
    ) {
      dispatch(removeFromFavorite({ productId: selectedItem.phone_id }));
    } else {
      dispatch(addtofavorite({ productId: selectedItem.phone_id }));
    }
  };

  const handleCompare = () => {
    if (!selectedItem?.phone_id) {
      return;
    }

    dispatch(addToCompare(selectedItem));
    navigate("/compare-product");
  };

  const handleStorageChange = (storage) => {
    setSelectedStorage(storage);
    const productByStorage = items.find(
      (item) => item.color === selectedColor && item.storage === storage
    );
    if (productByStorage) {
      setQuantity(1);
      setSelectedSpec({
        idphone_variants: productByStorage.idphone_variants,
        storage: productByStorage.storage,
        specs: productByStorage.specs || {},
      });
    }
  };

  const uniqueColors = [...new Set(items.map((item) => item.color))];
  const selectedItem = items.find(
    (item) => item.color === selectedColor && item.storage === selectedStorage
  );
  const availableStock = Number(selectedItem?.spec_stock ?? selectedItem?.color_stock ?? 0);
  const isOutOfStock = !selectedItem || availableStock <= 0;
  const originalPrice = Number(selectedItem?.price || 0);
  const discountedPrice = selectedItem?.price_discount != null ? Number(selectedItem?.price_discount) : null;
  const savedAmount = discountedPrice != null ? Math.max(0, originalPrice - discountedPrice) : 0;

  useEffect(() => {
    try {
      const storedItems = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      if (Array.isArray(storedItems)) {
        setRecentlyViewed(storedItems.slice(0, 5));
      }
    } catch (storageError) {
      console.warn("Failed to read recently viewed products", storageError);
    }
  }, []);

  useEffect(() => {
    if (!selectedItem?.phone_id) {
      return;
    }

    const currentItem = {
      phone_id: selectedItem.phone_id,
      name: selectedItem.name,
      images: selectedItem.images,
      price: selectedItem.price,
      price_discount: selectedItem.price_discount,
      discount_percentage: selectedItem.discount_percentage,
      stock: selectedItem.spec_stock ?? selectedItem.color_stock ?? selectedItem.stock,
    };

    try {
      const storedItems = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      const safeItems = Array.isArray(storedItems) ? storedItems : [];
      const nextItems = [
        currentItem,
        ...safeItems.filter((item) => item.phone_id !== currentItem.phone_id),
      ].slice(0, 8);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextItems));
      setRecentlyViewed(nextItems.filter((item) => item.phone_id !== currentItem.phone_id).slice(0, 5));
    } catch (storageError) {
      console.warn("Failed to update recently viewed products", storageError);
    }
  }, [selectedItem]);

  if (loading)
    return (
      <div className="page-container py-24 text-center text-sm text-ink-3">Loading product</div>
    );
  if (error)
    return (
      <div className="page-container py-24 text-center">
        <p className="text-ink">We couldn&apos;t load this product</p>
        <p className="mt-1 text-sm text-ink-3">{error}</p>
        <Link to="/AfterHomePage?page=PRODUCT" className="btn btn-secondary mt-6">Browse all products</Link>
      </div>
    );

  const isFavorite = favorite.findIndex((element) => element === selectedItem?.phone_id) >= 0;
  const specs = [
    { label: "Screen", value: selectedItem?.screen_size },
    { label: "Processor", value: selectedItem?.processor },
    { label: "RAM", value: selectedItem?.ram },
    { label: "Storage", value: selectedItem?.storage },
    { label: "Battery", value: selectedItem?.battery },
    { label: "Camera", value: selectedItem?.camera },
  ];
  const chip = (active) =>
    `h-10 rounded-lg border px-4 text-sm transition-colors duration-150 ease-out ${
      active ? "border-ink bg-surface text-ink" : "border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink"
    }`;

  return (
    <div className="page-container pt-6">
      <Breadcrumb
        items={[
          { label: items[0]?.category_name || "Products", link: items[0]?.category_name ? `/Sort?category=${items[0].category_name}` : "/AfterHomePage?page=PRODUCT" },
          { label: items[0]?.brand_name || "Brand", link: items[0]?.brand_name ? `/Sort?brand=${items[0].brand_name}` : null },
          { label: items[0]?.name || "Product" },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="card aspect-square overflow-hidden p-3">
            <div className="h-full w-full rounded-lg bg-raised">
              <ProductImage src={selectedImage} alt={selectedItem?.name} className="h-full w-full p-10" />
            </div>
          </div>
          {arrayImage.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {arrayImage.map((image, idx) => (
                <button
                  key={image + idx}
                  type="button"
                  onClick={() => handleImageClick(image)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-raised transition-colors duration-150 ease-out ${
                    selectedImage === image ? "border-ink" : "border-line hover:border-line-strong"
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  <ProductImage src={image} alt="" className="h-full w-full p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="lg:pt-2">
          <p className="text-sm text-ink-3">{items[0]?.brand_name}</p>
          <h1 className="mt-1 text-3xl font-medium leading-tight tracking-[-0.01em]">{selectedItem?.name || "Product"}</h1>
          {selectedItem?.release_date && (
            <p className="mt-2 text-[13px] text-ink-3">
              Released {new Date(selectedItem.release_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <Price size="lg" price={discountedPrice ?? originalPrice} original={discountedPrice != null ? originalPrice : null} />
            {savedAmount > 0 && <p className="mt-2 text-[13px] text-ink-3">You save <span className="price">${savedAmount.toFixed(2)}</span></p>}
          </div>

          <div className="mt-6">
            <p className="label">Storage</p>
            <div className="flex flex-wrap gap-2">
              {items
                .filter((item) => item.color === selectedColor)
                .map((item) => (
                  <button key={item.storage} type="button" onClick={() => handleStorageChange(item.storage)} className={chip(selectedStorage === item.storage)}>
                    {item.storage}
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="label">Colour</p>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => (
                <button key={color} type="button" onClick={() => handleColorChange(color)} className={chip(selectedColor === color)}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="label">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="inline-flex h-10 items-center rounded-lg border border-line-strong">
                <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="flex h-full w-10 items-center justify-center text-ink-2 hover:text-ink" aria-label="Decrease quantity">
                  <FiMinus size={14} strokeWidth={1.5} />
                </button>
                <span className="price w-10 text-center text-sm">{quantity}</span>
                <button type="button" onClick={() => setQuantity((prev) => Math.min(availableStock || 99, prev + 1))} className="flex h-full w-10 items-center justify-center text-ink-2 hover:text-ink" aria-label="Increase quantity">
                  <FiPlus size={14} strokeWidth={1.5} />
                </button>
              </div>
              <span className={`text-[13px] ${isOutOfStock ? "text-danger" : availableStock <= 5 ? "text-warn" : "text-ink-3"}`}>
                {isOutOfStock ? "Out of stock" : availableStock <= 5 ? `Only ${availableStock} left` : `${availableStock} in stock`}
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            <button type="button" className="btn btn-primary btn-lg flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
              <FiShoppingBag size={18} strokeWidth={1.5} />
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </button>
            <button type="button" onClick={handeAddToFavorite} className={`btn btn-secondary btn-lg w-12 px-0 ${isFavorite ? "text-danger" : ""}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} title="Favorite">
              <FiHeart size={18} strokeWidth={1.5} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button type="button" onClick={handleCompare} className="btn btn-secondary btn-lg w-12 px-0" aria-label="Compare" title="Compare">
              <FiColumns size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-[13px] text-ink-2">
            <span className="inline-flex items-center gap-2"><FiTruck size={16} strokeWidth={1.5} className="text-ink-3" />Delivery across Phnom Penh</span>
            <a href="tel:096888750" className="inline-flex items-center gap-2 hover:text-ink"><FiPhone size={16} strokeWidth={1.5} className="text-ink-3" />Questions? 096 888 750</a>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="section-title">Specifications</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex h-11 items-center justify-between text-sm">
                <dt className="text-ink-3">{label}</dt>
                <dd className="text-ink">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="review-section">
          <ProductReviews
            spec_id={selectedItem?.spec_id || items[0]?.spec_id}
            openForm={showReviewForm}
            onFormClose={() => setShowReviewForm(false)}
          />
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-5">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {recentlyViewed.map((item) => (
              <ProductCard key={`recent-${item.phone_id}`} product={item} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="section-title">More products</h2>
          <Link to="/AfterHomePage?page=PRODUCT" className="text-sm text-ink-2 hover:text-ink">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {product.map((item, index) => (
            <div key={item.phone_id || index} onClick={() => window.scrollTo(0, 0)}>
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
