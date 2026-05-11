import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  telegram_green,
  messenger_green,
  compare,
  addToCartWhite,
  heartFill,
  heart,
  instagram_green,
} from "../Assets/image";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchdataProduct, fetchProductByName } from "../../FetchAPI/Fetch";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { useDispatch, useSelector } from "react-redux";
import { addtofavorite, removeFromFavorite } from "../../store/favorite";
import { addToCompare } from "../../store/compare";
import ProductCard from "./ProductCard";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";
import ProductReviews from "../../Components/ProductReviews";
import Breadcrumb from "../../Components/Breadcrumb";

const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";

const ProductDetail = () => {
  const [items, setItems] = useState([]);
  const [arrayImage, setArrayImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState({});
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
    // console.log(response.data);
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
      })
    );
    dispatch(toggleStatusTab());
  };

  useEffect(() => {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading product details...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-4 p-8 bg-red-50 rounded-2xl border border-red-200">
          <span className="text-6xl">❌</span>
          <p className="text-xl font-semibold text-red-600">{`Error: ${error}`}</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: items[0]?.category_name || "Products", link: items[0]?.category_name ? `/Sort?category=${items[0].category_name}` : "/AfterHomePage?page=PRODUCT" },
            { label: items[0]?.brand_name || "Brand", link: items[0]?.brand_name ? `/Sort?brand=${items[0].brand_name}` : null },
            { label: items[0]?.name || "Product Details" }
          ]}
        />
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{selectedItem?.name || "Product"}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          {/* Product Images */}
          <div className="flex flex-col">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6 overflow-hidden group">
              {/* Discount Badge */}
              {selectedItem?.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <span>🔥</span>
                    <span>{selectedItem.discount_percentage}% OFF</span>
                  </div>
                </div>
              )}
              
              {/* Stock Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`${isOutOfStock ? 'bg-red-500' : availableStock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-200' : availableStock <= 5 ? 'bg-amber-200' : 'bg-emerald-200'} animate-pulse`}></span>
                  {isOutOfStock ? 'Out of Stock' : availableStock <= 5 ? `Only ${availableStock} left` : 'In Stock'}
                </div>
              </div>

              <img
                src={`${NETWORK_CONFIG.apiBaseUrl}/${selectedImage}`}
                alt="Main Product"
                className="w-full h-[400px] object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = "https://via.placeholder.com/500x400?text=No+Image"; }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {arrayImage.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => handleImageClick(image)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === image 
                      ? 'border-green-500 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-green-300 hover:scale-105'
                  }`}
                >
                  <img
                    src={`${NETWORK_CONFIG.apiBaseUrl}/${image}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No+Image"; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                {selectedItem?.name || "Product"}
              </h1>
              
              {/* Release Date */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">
                  Released: {new Date(selectedItem?.release_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-baseline gap-3 mb-2">
                {selectedItem?.price_discount ? (
                  <>
                    <span className="text-4xl font-extrabold text-green-600">
                      ${selectedItem.price_discount}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      ${selectedItem.price}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-green-600">
                    ${selectedItem?.price}
                  </span>
                )}
              </div>
              {savedAmount > 0 && (
                <p className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                  <span>💰</span>
                  You save ${savedAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Storage Options */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💾</span>
                Storage
              </h3>
              <div className="flex flex-wrap gap-3">
                {items
                  .filter((item) => item.color === selectedColor)
                  .map((item) => (
                    <button
                      key={item.storage}
                      onClick={() => handleStorageChange(item.storage)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedStorage === item.storage
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {item.storage}
                    </button>
                  ))}
              </div>
            </div>

            {/* Color Options */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎨</span>
                Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`relative w-12 h-12 rounded-full transition-all duration-300 ${
                      selectedColor === color
                        ? "ring-4 ring-green-500 ring-offset-2 scale-110"
                        : "ring-2 ring-gray-200 hover:ring-green-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xl">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🔢</span>
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-12 w-12 text-xl font-bold text-gray-700 hover:bg-gray-100 rounded-l-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="w-16 text-center text-lg font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(availableStock || 99, prev + 1))}
                    className="h-12 w-12 text-xl font-bold text-gray-700 hover:bg-gray-100 rounded-r-xl transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : "text-emerald-600"}`}>
                  {isOutOfStock ? "⚠️ Out of stock" : `✅ ${availableStock} available`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                className={`w-full h-14 flex items-center justify-center gap-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isOutOfStock 
                    ? "cursor-not-allowed bg-gray-300 text-gray-500" 
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <img src={addToCartWhite} alt="Cart" className="w-6" />
                <span>Add to Cart</span>
              </button>

              <div className="grid grid-cols-3 gap-3">
                <button
                  className="h-12 flex items-center justify-center gap-2 text-green-600 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl font-semibold transition-all duration-300"
                  onClick={handeAddToFavorite}
                >
                  <img
                    className="w-5"
                    src={favorite.findIndex((element) => element === selectedItem.phone_id) >= 0 ? heartFill : heart}
                    alt="Favorite"
                  />
                  <span className="hidden sm:inline">Favorite</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCompare}
                  className="h-12 flex items-center justify-center gap-2 text-green-600 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl font-semibold transition-all duration-300"
                >
                  <img className="w-5" src={compare} alt="Compare" />
                  <span className="hidden sm:inline">Compare</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(true);
                    setTimeout(() => {
                      document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="h-12 flex items-center justify-center gap-2 text-green-600 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl font-semibold transition-all duration-300"
                >
                  <span>⭐</span>
                  <span className="hidden sm:inline">Review</span>
                </button>
              </div>
            </div>

            {/* Contact Options */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">💬 Contact Us</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://t.me/yourtelegramusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors"
                >
                  <img src={telegram_green} alt="Telegram" className="w-5" />
                  <span className="text-sm">Telegram</span>
                </a>
                <a
                  href="https://m.me/yourmessengerusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors"
                >
                  <img src={messenger_green} alt="Messenger" className="w-5" />
                  <span className="text-sm">Messenger</span>
                </a>
                <a
                  href="https://i.me/yourinstagramusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg font-medium transition-colors"
                >
                  <img src={instagram_green} alt="Instagram" className="w-5" />
                  <span className="text-sm">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Specifications Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Specifications
          </h2>
          <div className="space-y-3">
            <details className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white p-4 font-semibold text-gray-900 hover:bg-green-50 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  Screen
                </span>
                <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium">Size:</span>
                  <span className="text-gray-900 font-semibold">{selectedItem.screen_size}</span>
                </div>
              </div>
            </details>

            <details className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white p-4 font-semibold text-gray-900 hover:bg-green-50 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-xl">🔋</span>
                  Battery
                </span>
                <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium">Capacity:</span>
                  <span className="text-gray-900 font-semibold">{selectedItem.battery}</span>
                </div>
              </div>
            </details>

            <details className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white p-4 font-semibold text-gray-900 hover:bg-green-50 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-xl">📷</span>
                  Camera
                </span>
                <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium">Resolution:</span>
                  <span className="text-gray-900 font-semibold">{selectedItem.camera}</span>
                </div>
              </div>
            </details>

            <details className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white p-4 font-semibold text-gray-900 hover:bg-green-50 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  Processor
                </span>
                <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium">Chipset:</span>
                  <span className="text-gray-900 font-semibold">{selectedItem.processor}</span>
                </div>
              </div>
            </details>

            <details className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white p-4 font-semibold text-gray-900 hover:bg-green-50 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-xl">🧠</span>
                  RAM
                </span>
                <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium">Memory:</span>
                  <span className="text-gray-900 font-semibold">{selectedItem.ram}</span>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="review-section" className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <ProductReviews
            spec_id={selectedItem?.spec_id || items[0]?.spec_id}
            openForm={showReviewForm}
            onFormClose={() => setShowReviewForm(false)}
          />
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">👁️</span>
                Recently Viewed
              </h3>
              <p className="text-sm text-gray-500 hidden sm:block">Products you checked before</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {recentlyViewed.map((item) => (
                <ProductCard key={`recent-${item.phone_id}`} product={item} />
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">🛍️</span>
              More Products
            </h3>
            <Link to="/AfterHomePage?page=PRODUCT" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group">
              View All
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {product.map((product, index) => (
              <div
                key={product.phone_id || product.id || index}
                onClick={() => {
                  window.scrollTo(0, 0);
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
