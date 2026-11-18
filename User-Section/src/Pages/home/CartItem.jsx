import { useDispatch } from "react-redux";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { changeQuantity, removeFromCart } from "../../store/cart";
import ProductImage from "../../Components/ProductImage";
import { formatPrice } from "../../utils/display";

// One cart line, rendered from what the cart stored when the item was added
const CartItem = ({ product }) => {
  const { productId, productName, quantity, price, image, color } = product;
  const dispatch = useDispatch();

  const decrease = () =>
    quantity > 1
      ? dispatch(changeQuantity({ productId, quantity: quantity - 1 }))
      : dispatch(removeFromCart({ productId }));

  return (
    <div className="flex gap-4 py-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-raised">
        <ProductImage src={image} alt={productName} className="h-full w-full p-2" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{productName || "Product"}</p>
            {color && <p className="mt-0.5 text-xs text-ink-3">{color}</p>}
          </div>
          <button type="button" onClick={() => dispatch(removeFromCart({ productId }))} className="icon-btn -mr-2 -mt-1 h-7 w-7" aria-label={`Remove ${productName}`}>
            <FiX size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex h-8 items-center rounded-lg border border-line-strong">
            <button type="button" onClick={decrease} className="flex h-full w-8 items-center justify-center text-ink-2 hover:text-ink" aria-label="Decrease quantity">
              <FiMinus size={12} strokeWidth={1.5} />
            </button>
            <span className="price w-6 text-center text-[13px]">{quantity}</span>
            <button type="button" onClick={() => dispatch(changeQuantity({ productId, quantity: quantity + 1 }))} className="flex h-full w-8 items-center justify-center text-ink-2 hover:text-ink" aria-label="Increase quantity">
              <FiPlus size={12} strokeWidth={1.5} />
            </button>
          </div>
          <span className="price text-sm text-ink">{formatPrice(Number(price) * quantity)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
