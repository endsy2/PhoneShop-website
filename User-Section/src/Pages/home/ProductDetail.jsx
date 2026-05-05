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

const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";

const buildRatingMeta = (item) => {
  if (!item) {
    return { score: 0, reviewCount: 0, recommendPercent: 0, reviews: [] };
  }

  const seedFromName = String(item.name || "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = Number(item.phone_id || 0) + seedFromName;
  const score = Number((4 + (seed % 16) / 20).toFixed(1));
  const reviewCount = 24 + (seed % 180);
  const recommendPercent = 86 + (seed % 11);

  return {
    score,
    reviewCount,
    recommendPercent,
    reviews: [
      {
        id: "rev-1",
        author: "Alex",
        title: "Great daily performance",
        text: `Smooth experience and stable battery for ${item.name}.`,
      },
      {
        id: "rev-2",
        author: "Kim",
        title: "Worth the value",
        text: "Display quality and camera output are impressive at this price.",
      },
      {
        id: "rev-3",
        author: "Sam",
        title: "Solid for work and media",
        text: "Storage and speed feel reliable for multitasking and video.",
      },
    ],
  };
};

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
  const ratingMeta = useMemo(() => buildRatingMeta(selectedItem), [selectedItem]);

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
    return <p className="text-center text-xl">Loading product details...</p>;
  if (error)
    return <p className="text-center text-red-600">{`Error: ${error}`}</p>;

  return (
    <div className="mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Product Images */}
        <div className="flex flex-col items-center">
          <img
            src={`${NETWORK_CONFIG.apiBaseUrl}/${selectedImage}`}
            alt="Main Product"
            className="w-full max-w-[500px] h-auto md:h-96 object-contain mb-4 shadow-lg rounded-lg"
            onError={(e) => { e.target.src = "https://via.placeholder.com/500x400?text=No+Image"; }}
          />
          <div className="flex mt-4 space-x-4">
            {arrayImage.map((image, idx) => (
              <img
                key={idx}
                src={`${NETWORK_CONFIG.apiBaseUrl}/${image}`}
                alt={`Thumbnail ${idx + 1}`}
                className="w-20 h-20 transition-transform duration-300 ease-in-out rounded-lg hover:scale-110 cursor-pointer"
                onClick={() => handleImageClick(image)}
                onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No+Image"; }}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">
            {selectedItem?.name || "Product"}
          </h2>
          <div className="flex items-center gap-4 my-5">
            <div className="flex items-center gap-3 text-2xl font-bold text-red-600">
              <span>Price:</span>
              {selectedItem?.price_discount ? (
                <>
                  <s>{selectedItem?.price}$</s>
                  <span>{selectedItem?.price_discount}$</span>
                </>
              ) : (
                <span>{selectedItem?.price}$</span>
              )}
            </div>
            <span className="h-6 border-l border-gray-400 "></span>

            <p className="text-gray-600">
              Release Date:{" "}
              {new Date(selectedItem?.release_date).toLocaleDateString()}
            </p>
          </div>

          {savedAmount > 0 ? (
            <p className="mb-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
              You save ${savedAmount.toFixed(2)}
            </p>
          ) : null}

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Quantity</span>
            <div className="inline-flex items-center rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="h-10 w-10 text-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.min(availableStock || 99, prev + 1))}
                className="h-10 w-10 text-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>

            <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : "text-emerald-600"}`}>
              {isOutOfStock ? "Out of stock" : `${availableStock} in stock`}
            </span>
          </div>

          {/* Storage Options */}
          <div className="mb-6">
            <h3 className="font-semibold text-xl text-gray-800">Storage</h3>
            <div className="flex space-x-4 mt-2">
              {items
                .filter((item) => item.color === selectedColor)
                .map((item) => (
                  <button
                    key={item.storage}
                    onClick={() => handleStorageChange(item.storage)}
                    className={`px-6 py-4 border rounded-lg text-gray-800 font-semibold ${selectedStorage === item.storage
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    {item.storage}
                  </button>
                ))}
            </div>
          </div>

          {/* Color Options */}
          <div className="mb-6">
            <h3 className="font-semibold text-xl text-gray-800">Color</h3>
            <div className="flex space-x-4 mt-2">
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full cursor-pointer border ${selectedColor === color
                    ? "ring-2 ring-green-500"
                    : "border-gray-300"
                    }`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>
          {/* Product Specifications */}

          {/* Contact and Purchase Options */}
          <div className="flex flex-col items-start gap-4">
            <a
              href="https://t.me/yourtelegramusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-green-600  items-center gap-2 font-semibold hover:text-green-700"
            >
              <img src={telegram_green} alt="Telegram" className="w-6" />
              Contact on Telegram
            </a>
            <a
              href="https://m.me/yourmessengerusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-green-600  items-center gap-2 font-semibold hover:text-green-700"
            >
              <img src={messenger_green} alt="Messenger" className="w-6" />
              Contact on Messenger
            </a>
            <a
              href="https://i.me/yourinstagramusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-green-600  items-center gap-2 font-semibold hover:text-green-700"
            >
              <img src={instagram_green} alt="instagram" className="w-6" />
              Contact on Instagram
            </a>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 w-full">
                <button
                  href="/cart"
                  className={`w-full md:w-[200px] justify-center flex p-3 rounded-xl items-center gap-2 text-white font-semibold ${isOutOfStock ? "cursor-not-allowed bg-slate-400" : "bg-green-600 hover:text-green-800"}`}
                  onClick={() => handleAddToCart()}
                  disabled={isOutOfStock}
                >
                  <img src={addToCartWhite} alt="Add to Cart" className="w-5" />
                  Add to Cart
                </button>
                <button
                  className="w-full md:w-[200px] flex justify-center gap-2 items-center text-white bg-green-600 p-3 font-semibold rounded-xl hover:text-green-800"
                  onClick={() => handeAddToFavorite(selectedItem.phone_id)}
                >
                  <img
                    className="w-6"
                    src={
                      favorite.findIndex(
                        (element) => element === selectedItem.phone_id
                      ) >= 0
                        ? heartFill
                        : heart
                    }
                    alt=""
                  />
                  <p className="max-lg:hidden">Add To Favorite</p>
                </button>
                <button
                  type="button"
                  onClick={handleCompare}
                  className="w-full md:w-[200px] flex justify-center gap-2 items-center text-white bg-green-600 p-3 font-semibold rounded-xl hover:text-green-800"
                >
                  <img
                    className="w-6"
                    src={compare}
                    alt="Compare"
                  />
                  <p className="max-lg:hidden">Compare</p>
                </button>
              </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-semibold">Specifications</h3>
        <div className="mt-4 hover:cursor-pointer">
          <details className="border rounded mb-2 p-2">
            <summary className="font-semibold">Screen</summary>
            <div className="py-4">
              <p className="pt-2 pl-14">Size:{selectedItem.screen_size}</p>
            </div>
          </details>
          <details className="border rounded mb-2 p-2">
            <summary className="font-semibold">Battery</summary>
            <div className="py-4">
              <p className="pt-2 pl-14">Battery:{selectedItem.battery}</p>
            </div>
          </details>
          <details className="border rounded mb-2 p-2">
            <summary className="font-semibold">Camera</summary>
            <div className="py-4">
              <p className="pt-2 pl-14">Camera:{selectedItem.camera}</p>
            </div>
          </details>
          <details className="border rounded mb-2 p-2">
            <summary className="font-semibold">Processor</summary>
            <div className="py-4">
              <p className="pt-2 pl-14">Processor:{selectedItem.processor}</p>
            </div>
          </details>
          <details className="border rounded mb-2 p-2">
            <summary className="font-semibold">Ram</summary>
            <p>Ram:{selectedItem.ram}</p>
          </details>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">Customer Reviews</h3>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-amber-600">{ratingMeta.score}/5</p>
            <p className="text-sm text-slate-500">{ratingMeta.reviewCount} verified reviews</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-700">
          {ratingMeta.recommendPercent}% of buyers recommend this product.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {ratingMeta.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">{review.title}</p>
              <p className="mt-2 text-sm text-slate-600">{review.text}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">By {review.author}</p>
            </div>
          ))}
        </div>
      </div>

      {recentlyViewed.length > 0 ? (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-slate-900">Recently Viewed</h3>
            <p className="text-sm text-slate-500">Quickly revisit products you checked before</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {recentlyViewed.map((item) => (
              <ProductCard key={`recent-${item.phone_id}`} product={item} />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="flex justify-between items-center mt-8">
          <p href="#" className="text-blue-500 text-lg font-semibold">
            PRODUCT
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {product.map((product, index) => (
            <div
              key={product.phone_id || product.id || index}
              onClick={() => {
                window.scrollTo(0, 0); // Scroll to the top of the page
              }}
            >
              <ProductCard key={product.phone_id || product.id || index} product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
