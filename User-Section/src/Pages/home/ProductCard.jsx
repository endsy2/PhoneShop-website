import React from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { removeFromFavorite } from "../../store/favorite";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const stock = Number(product?.stock ?? product?.spec_stock ?? product?.available_stock ?? 0);
  const inStock = stock > 0;
  
  // Use real rating if available, otherwise generate seed-based rating
  const rating = product?.avg_rating 
    ? Number(product.avg_rating).toFixed(1)
    : (4 + ((Number(product?.phone_id || 0) || String(product?.name || "").length) % 11) / 20).toFixed(1);
  
  const reviewCount = product?.review_count || 0;

  // Get stock status
  const getStockStatus = () => {
    if (stock <= 0) return { text: "Out of Stock", color: "bg-red-100 text-red-700" };
    if (stock <= 5) return { text: `Only ${stock} left!`, color: "bg-orange-100 text-orange-700" };
    return { text: "In Stock", color: "bg-emerald-100 text-emerald-700" };
  };

  const stockStatus = getStockStatus();

  // Handle adding the product to the cart
  const handleAddToCart = () => {
    const finalPrice = product.price_discount != null ? Number(product.price_discount) : Number(product.price);
    dispatch(
      addToCart({
        productId: product.spec_id || product.phone_id,
        productName: product.name,
        quantity: 1,
        price: finalPrice,
      })
    );
    dispatch(toggleStatusTab());
  };

  // Handle removing from favorites
  const handleRemove = () => {
    dispatch(removeFromFavorite({ productId: product.phone_id }));
  };

  // Generate the product image URL
  const imageUrl = `http://localhost:3000/${(product.images || "")
    .trim()
    .replace(/uploads[\\/]/g, "")
    .replace(/\s+/g, "")}`;

  return (
    <div className="relative bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      {/* Discount Badge */}
      {product.price_discount ? (
        <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          {product.discount_percentage ? `${product.discount_percentage}% OFF` : "SALE"}
        </span>
      ) : null}

      {/* Stock Status Badge */}
      <span className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-[11px] font-bold ${stockStatus.color}`}>
        {stockStatus.text}
      </span>

      {/* Product Link */}
      <Link
        to={`/product-detail?phone_id=${product.phone_id}&phone_name=${encodeURIComponent(product.name || "")}`}
      >
        <div className="w-full h-48 sm:h-56 md:h-64 flex justify-center items-center rounded-md overflow-hidden mt-1">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-contain max-w-full max-h-full"
          />
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-gray-800">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex justify-center items-center gap-1 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-gray-600">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex justify-center items-center gap-2 mt-2">
          {product.price_discount ? (
            <>
              <s className="text-gray-500 text-sm">
                ${product.price}
              </s>
              <p className="text-green-600 text-xl font-bold">
                ${product.price_discount}
              </p>
            </>
          ) : (
            <p className="text-green-600 text-xl font-bold">${product.price}</p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-2 text-white font-semibold rounded-lg transition-all duration-200 flex justify-center items-center gap-2 ${
            inStock ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {inStock ? "Add To Cart" : "Out of Stock"}
        </button>

        {/* Remove from Favorites (if on favorites page) */}
        {location.pathname === "/add-to-favorite" && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 text-xl text-red-600 font-bold hover:text-red-800 transition-all duration-200"
          >
            X
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
