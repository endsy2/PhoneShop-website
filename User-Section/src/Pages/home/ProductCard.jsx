import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FiHeart, FiPlus, FiStar } from "react-icons/fi";
import { addToCart, toggleStatusTab } from "../../store/cart";
import { removeFromFavorite } from "../../store/favorite";
import Price from "../../Components/Price";
import ProductImage from "../../Components/ProductImage";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const stock = Number(product?.stock ?? product?.spec_stock ?? product?.available_stock ?? 0);
  const inStock = stock > 0;
  const avgRating = product?.avg_rating ? Number(product.avg_rating) : null;
  const reviewCount = Number(product?.review_count || 0);
  const salePrice = product.price_discount != null ? Number(product.price_discount) : null;
  const detailUrl = `/product-detail?phone_id=${product.phone_id}&phone_name=${encodeURIComponent(product.name || "")}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        productId: product.spec_id || product.phone_id,
        productName: product.name,
        quantity: 1,
        price: salePrice ?? Number(product.price),
        image: product.images || product.image || "",
        color: product.color || "",
      })
    );
    dispatch(toggleStatusTab());
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeFromFavorite({ productId: product.phone_id }));
  };

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-line bg-surface transition-colors duration-150 ease-out hover:border-line-strong">
      <Link to={detailUrl} className="flex flex-1 flex-col">
        <div className="m-2 aspect-square overflow-hidden rounded-lg bg-raised">
          <ProductImage src={product.images || product.image} alt={product.name} className="h-full w-full p-4" />
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
          <h3 className="line-clamp-2 min-h-[40px] text-sm leading-5 text-ink">{product.name}</h3>
          <Price price={salePrice ?? product.price} original={salePrice != null ? product.price : null} className="mt-2" />
          <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-ink-3">
            {reviewCount > 0 && avgRating !== null && (
              <span className="inline-flex items-center gap-1">
                <FiStar size={12} strokeWidth={1.5} />
                <span className="price">{avgRating.toFixed(1)}</span>
                <span className="price">({reviewCount})</span>
              </span>
            )}
            {!inStock ? (
              <span>Out of stock</span>
            ) : stock <= 5 ? (
              <span className="text-warn">{stock} left</span>
            ) : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!inStock}
        className="icon-btn absolute bottom-3 right-3 border border-line bg-surface"
        aria-label={inStock ? `Add ${product.name} to cart` : "Out of stock"}
        title={inStock ? "Add to cart" : "Out of stock"}
      >
        <FiPlus size={16} strokeWidth={1.5} />
      </button>

      {location.pathname === "/add-to-favorite" && (
        <button
          type="button"
          onClick={handleRemove}
          className="icon-btn absolute right-4 top-4 bg-surface text-danger hover:bg-danger-soft hover:text-danger"
          aria-label="Remove from favorites"
          title="Remove from favorites"
        >
          <FiHeart size={16} strokeWidth={1.5} className="fill-current" />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
