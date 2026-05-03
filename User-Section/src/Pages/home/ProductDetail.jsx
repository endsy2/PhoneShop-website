import React, { useCallback, useEffect, useState } from "react";
import {
  // desertColor,
  // blackColor,
  // silverColor,
  // naturalColor,
  // call_green,
  telegram_green,
  // buy_green,
  messenger_green,
  compare,
  addToCartWhite,
  // telegramWhite,
  // messengerWhite,
  heartFill,
  heart,
  instagram_green,
} from "../Assets/image";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import Installment_Card from "./Installment_Payment_Card";
import { fetchdataProduct, fetchProductByName } from "../../FetchAPI/Fetch";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { useDispatch, useSelector } from "react-redux";
import { addtofavorite, removeFromFavorite } from "../../store/favorite";
import { addToCompare } from "../../store/compare";
import ProductCard from "./ProductCard";

const ProductDetail = () => {
  const [items, setItems] = useState([]);
  const [arrayImage, setArrayImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favorite = useSelector((store) => store.favorite.favorite);
  const [product, setProduct] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("phone_name");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductByName({ phone_name: query });

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
  }, [query]);

  const handlefetchProduct = async () => {
    const response = await fetchdataProduct();
    setProduct(response.data);
    // console.log(response.data);
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: selectedItem.spec_id,
        productName: selectedItem.name,
        quantity: 1,
        price: selectedItem.price_discount || selectedItem.price,
      })
    );
    dispatch(toggleStatusTab());
  };

  useEffect(() => {
    fetchData();
    handlefetchProduct();
  }, [fetchData, query]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
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
      setSelectedSpec({
        idphone_variants: productByStorage.idphone_variants,
        storage: productByStorage.storage,
        specs: productByStorage.specs || {},
      });
    }
  };

  if (loading)
    return <p className="text-center text-xl">Loading product details...</p>;
  if (error)
    return <p className="text-center text-red-600">{`Error: ${error}`}</p>;

  const uniqueColors = [...new Set(items.map((item) => item.color))];
  const selectedItem = items.find(
    (item) => item.color === selectedColor && item.storage === selectedStorage
  );

  return (
    <div className="mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Product Images */}
        <div className="flex flex-col items-center">
          <img
            src={`http://localhost:3000/${selectedImage}`}
            alt="Main Product"
            className="w-full max-w-[500px] h-auto md:h-96 object-contain mb-4 shadow-lg rounded-lg"
          />
          <div className="flex mt-4 space-x-4">
            {arrayImage.map((image, idx) => (
              <img
                key={idx}
                src={`http://localhost:3000/${image}`}
                alt={`Thumbnail ${idx + 1}`}
                className="w-20 h-20 transition-transform duration-300 ease-in-out rounded-lg hover:scale-110 cursor-pointer"
                onClick={() => handleImageClick(image)}
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
            <p className="text-2xl text-red-600 font-bold flex">
              Price:{" "}
              {selectedItem?.price_discount ? (
                <>
                  <s>{selectedItem?.price}$</s>
                  <p className="ml-5">{selectedItem?.price_discount}$</p>
                </>
              ) : (
                <p>{selectedItem?.price}$</p>
              )}
            </p>
            <span className="h-6 border-l border-gray-400 "></span>

            <p className="text-gray-600">
              Release Date:{" "}
              {new Date(selectedItem?.release_date).toLocaleDateString()}
            </p>
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
                  className="w-full md:w-[200px] justify-center flex bg-green-600 p-3 rounded-xl items-center gap-2 text-white font-semibold hover:text-green-800"
                  onClick={() => handleAddToCart()}
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
      <div>
        <div className="flex justify-between items-center mt-8">
          <p href="#" className="text-blue-500 text-lg font-semibold">
            PRODUCT
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {product.map((product, index) => (
            <div
              key={index}
              onClick={() => {
                window.location.reload(); // Reload the page
                window.scrollTo(0, 0); // Scroll to the top of the page
              }}
            >
              <ProductCard key={product.id} product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
