import React from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { removeFromFavorite } from "../../store/favorite";
// import { favorite_packages } from "../Assets/image";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Handle adding the product to the cart
  const handleAddToCart = () => {
    const finalPrice = product.price_discount != null ? Number(product.price_discount) : Number(product.price);
    dispatch(
      addToCart({
        productId: product.phone_id,
        quantity: 1,
        price: finalPrice, // Use discount price when available
      })
    );
    dispatch(toggleStatusTab());
  };

  // Handle removing the product from favorites
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
      {product.price_discount ? (
        <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          {product.discount_percentage ? `${product.discount_percentage}% OFF` : "SALE"}
        </span>
      ) : null}
      <Link to={`/product-detail?phone_name=${product.name}`}>
        <div className="w-auto h-[200px] flex justify-center items-center  rounded-md overflow-hidden mt-1">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-contain max-w-full max-h-full"
          />
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-gray-800">
          {product.name}
        </h3>
        <div className="flex justify-center items-center gap-2 mt-2">
          {product.price_discount ? (
            <>
              <s className="text-gray-500 text-sm font-mediu">
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

      <div className="w-full flex justify-center mt-4">
        {/* Add To Cart Button (optional) */}
        {/* Uncomment if needed */}
        {/* 
        <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-200 flex justify-center items-center gap-2"
        >
          Add To Cart
          <img src={favorite_packages} alt="Add to Cart" className="w-5" />
        </button> 
        */}

        {location.pathname === "/Add-to-favorite" && (
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
