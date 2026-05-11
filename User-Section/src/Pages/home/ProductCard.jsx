import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { removeFromFavorite } from "../../store/favorite";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";
import { FiShoppingCart, FiHeart, FiEye } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const stock = Number(product?.stock ?? product?.spec_stock ?? product?.available_stock ?? 0);
  const inStock = stock > 0;

  // Get real review data from product (if available)
  const avgRating = product?.avg_rating ? Number(product.avg_rating) : null;
  const reviewCount = product?.review_count ? Number(product.review_count) : 0;
  const hasReviews = reviewCount > 0 && avgRating !== null;

  // Get stock status
  const getStockStatus = () => {
    if (stock <= 0) return { text: "Out of Stock", color: "bg-red-500 text-white", dot: "bg-red-500" };
    if (stock <= 5) return { text: `Only ${stock} left`, color: "bg-amber-500 text-white", dot: "bg-amber-500" };
    return { text: "In Stock", color: "bg-emerald-500 text-white", dot: "bg-emerald-500" };
  };

  const stockStatus = getStockStatus();

  // Calculate discount percentage if not provided
  const discountPercentage = product.discount_percentage || 
    (product.price_discount ? Math.round(((product.price - product.price_discount) / product.price) * 100) : 0);

  // Handle adding the product to the cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeFromFavorite({ productId: product.phone_id }));
  };

  // Generate the product image URL
  const rawImage = (product.images || "").split(",")[0].trim().replace(/uploads[\\/]/g, "").replace(/\s+/g, "");
  const imageUrl = rawImage ? `${NETWORK_CONFIG.apiBaseUrl}/${rawImage}` : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200">
      {/* Product Link Wrapper */}
      <Link
        to={`/product-detail?phone_id=${product.phone_id}&phone_name=${encodeURIComponent(product.name || "")}`}
        className="block"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <span className="text-sm">🔥</span>
                <span>{discountPercentage}% OFF</span>
              </div>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className="absolute top-3 right-3 z-20">
            <div className={`${stockStatus.color} text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot} animate-pulse`}></span>
              {stockStatus.text}
            </div>
          </div>

          {/* Product Image */}
          <div className="relative w-full h-full p-6 flex items-center justify-center">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`object-contain w-full h-full transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { 
                e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                setImageLoaded(true);
              }}
            />
          </div>

          {/* Hover Overlay with Quick Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
            <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 ${
                  inStock 
                    ? "bg-white/90 hover:bg-green-600 hover:text-white text-gray-800" 
                    : "bg-gray-400/50 cursor-not-allowed text-gray-600"
                }`}
                title={inStock ? "Add to Cart" : "Out of Stock"}
              >
                <FiShoppingCart className="w-5 h-5" />
              </button>
              
              <Link
                to={`/product-detail?phone_id=${product.phone_id}&phone_name=${encodeURIComponent(product.name || "")}`}
                className="p-3 rounded-full bg-white/90 hover:bg-green-600 hover:text-white text-gray-800 backdrop-blur-md transition-all duration-200"
                title="Quick View"
              >
                <FiEye className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="text-gray-800 font-semibold text-base line-clamp-2 min-h-[3rem] group-hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.price_discount ? (
                <>
                  <span className="text-2xl font-bold text-green-600">
                    ${Number(product.price_discount).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-green-600">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Real Rating - Only show if product has reviews */}
            {hasReviews && (
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(avgRating) ? 'text-amber-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-600">({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Remove from Favorites Button (if on favorites page) */}
      {location.pathname === "/add-to-favorite" && (
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg"
          title="Remove from Favorites"
        >
          <FiHeart className="w-5 h-5 fill-current" />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
