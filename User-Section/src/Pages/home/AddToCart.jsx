import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiX } from "react-icons/fi";
import CartItem from "./CartItem";
import { toggleStatusTab } from "../../store/cart";
import { formatPrice } from "../../utils/display";

// Cart drawer, opened from the header
const AddToCart = () => {
  const carts = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const close = () => dispatch(toggleStatusTab());
  const subtotal = carts.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  const count = carts.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && dispatch(toggleStatusTab());
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30" onClick={close} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-line bg-surface shadow-float sm:w-[420px]" aria-label="Cart">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <h2 className="text-base font-medium">
            Cart <span className="price ml-1 text-sm font-normal text-ink-3">{count}</span>
          </h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close cart">
            <FiX size={18} strokeWidth={1.5} />
          </button>
        </div>

        {carts.length > 0 ? (
          <>
            <div className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {carts.map((item) => (
                <CartItem key={item.productId} product={item} />
              ))}
            </div>
            <div className="border-t border-line p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm text-ink-2">Subtotal</span>
                <span className="price text-lg text-ink">{formatPrice(subtotal)}</span>
              </div>
              <Link to="/checkout" onClick={close} className="btn btn-primary btn-lg w-full">Checkout</Link>
              <button type="button" onClick={close} className="btn btn-ghost mt-2 w-full">Continue shopping</button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <FiShoppingBag size={28} strokeWidth={1.5} className="text-ink-3" />
            <p className="mt-4 text-sm text-ink">Your cart is empty</p>
            <p className="mt-1 text-[13px] text-ink-3">Products you add will show up here</p>
            <button type="button" onClick={close} className="btn btn-secondary mt-6">Continue shopping</button>
          </div>
        )}
      </aside>
    </>
  );
};

export default AddToCart;
