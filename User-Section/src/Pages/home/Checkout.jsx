import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeAllCart } from "../../store/cart";
import CheckoutCart from "../../Conponents/CheckoutCart";
import { fetchCheckOut } from "../../FetchAPI/Fetch";
import BakongQR from "../../Components/BakongQR";
import { FiCheck, FiCreditCard, FiDollarSign, FiHome, FiLock, FiTruck } from "react-icons/fi";
import ProductImage from "../../Components/ProductImage";
import { formatPrice } from "../../utils/display";

// Defined outside the page so inputs keep focus between renders
const Field = ({ label, hint, error, children }) => (
  <div>
    {label && (
      <p className="label">
        {label} {hint && <span className="font-normal text-ink-3">{hint}</span>}
      </p>
    )}
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>
);

const option = (active) =>
  `flex h-12 flex-1 cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm transition-colors duration-150 ease-out ${
    active ? "border-ink text-ink" : "border-line-strong text-ink-2 hover:border-ink-3"
  }`;

const CheckoutPage = () => {
  const cart = useSelector((store) => store.cart.items);
  const [totalQuatity, setTotalQuantity] = useState();
  const [token, setToken] = useState("ad");
  const [customerName, setCustomerName] = useState("");
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [response, setResponse] = useState();
  const [error, setError] = useState();
  const [showBakongQR, setShowBakongQR] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null); // holds receipt data after success

  const dispatch = useDispatch();
  const clearCart = () => {
    dispatch(removeAllCart());
  };

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const finalTotal = subtotal;

  const validateForm = () => {
    const nextErrors = {};

    if (!customerName?.trim()) nextErrors.customerName = "Customer name is required";
    if (!delivery) nextErrors.delivery = "Please select delivery type";
    if (!payment) nextErrors.payment = "Please select payment method";
    if (!location?.trim()) nextErrors.location = "Delivery location is required";
    if (!cart.length) nextErrors.cart = "Your cart is empty";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormReady =
    customerName.trim() && delivery && payment && location.trim() && cart.length > 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please complete the required fields");
      setResponse("");
      return;
    }

    // Construct the `data` object with proper syntax
    const data = {
      customerName: customerName.trim(),
      delivery,
      location,
      payment,
      items: cart.map((element) => ({
        spec_id: element.productId,
        quantity: element.quantity,
      })),
    };

    try {
      setSubmitting(true);

      // If Bakong QR selected — show QR first, place order after payment confirmed
      if (payment === "Bakong QR") {
        setPendingOrderData(data);
        setShowBakongQR(true);
        setSubmitting(false);
        return;
      }
      const response = await fetchCheckOut(data);
      if (response) {
        const skipped = response.data?.skippedItems || 0;
        const msg = skipped > 0
          ? `Order placed. ${skipped} item(s) were skipped, please add them again from the product page`
          : "Order placed. We\u2019ll call to confirm delivery";
        setResponse(msg);
        setError("");
        setCustomerName("");
        setDelivery("");
        setLocation("");
        setPayment("");
        clearCart();
      } else {
        setError("Something went wrong. Please try again");
        setResponse("");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Checkout failed. Please try again";
      setError(serverMsg);
      setResponse("");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    let total = 0;
    cart.forEach((item) => (total += item.quantity));
    setTotalQuantity(total);
    setToken(localStorage.getItem('authToken'))
  }, [cart]);


  if (!token) {
    return (
      <div className="page-container flex flex-col items-center py-24 text-center">
        <FiLock size={24} strokeWidth={1.5} className="text-ink-3" />
        <h1 className="mt-4 text-2xl">Log in to check out</h1>
        <p className="mt-2 text-sm text-ink-2">Your cart is saved. Log in or create an account to place the order.</p>
        <div className="mt-8 flex gap-3">
          <Link to="/auth/login" className="btn btn-dark btn-lg">Log in</Link>
          <Link to="/auth/signup" className="btn btn-secondary btn-lg">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-8">
      <h1 className="text-3xl tracking-[-0.01em]">Checkout</h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <form
          className="card space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <h2 className="text-base font-medium">Delivery</h2>

          <Field label="Recipient name" hint="who receives the parcel" error={fieldErrors.customerName}>
            <input value={customerName} type="text" onChange={(e) => setCustomerName(e.target.value)} className="input" autoComplete="name" />
          </Field>

          <Field label="Delivery type" error={fieldErrors.delivery}>
            <div className="flex gap-3">
              {[
                { value: "Delivery", label: "Deliver to me", icon: FiTruck },
                { value: "Pick up", label: "Pick up at the shop", icon: FiHome },
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className={option(delivery === value)}>
                  <input type="radio" name="delivery" value={value} checked={delivery === value} onChange={(e) => setDelivery(e.target.value)} className="sr-only" />
                  <Icon size={16} strokeWidth={1.5} className="text-ink-3" />
                  {label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Address" error={fieldErrors.location}>
            <input value={location || ""} type="text" onChange={(e) => setLocation(e.target.value)} placeholder="House, street, district, city" className="input" autoComplete="street-address" />
          </Field>

          <div className="border-t border-line pt-5">
            <h2 className="mb-4 text-base font-medium">Payment</h2>
            <Field error={fieldErrors.payment}>
              <div className="flex flex-col gap-3 sm:flex-row">
                {[
                  { value: "By Delivery", label: "Cash on delivery", icon: FiDollarSign },
                  { value: "Bakong QR", label: "Bakong KHQR", icon: FiCreditCard },
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className={option(payment === value)}>
                    <input type="radio" name="payment" value={value} checked={payment === value} onChange={(e) => setPayment(e.target.value)} className="sr-only" />
                    <Icon size={16} strokeWidth={1.5} className="text-ink-3" />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <button type="submit" disabled={submitting || !isFormReady} className="btn btn-primary btn-lg w-full">
            {submitting ? "Placing order" : payment === "Bakong QR" ? "Continue to payment" : "Place order"}
          </button>

          {response && (
            <div className="flex items-start gap-3 rounded-lg bg-brand-soft p-4 text-sm text-brand">
              <FiCheck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <div>
                <p>{response}</p>
                <Link to="/myorder" className="mt-1 inline-block text-ink underline underline-offset-2">View my orders</Link>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
              <p>{error}</p>
              {error.includes("cart items") && (
                <button type="button" onClick={() => { clearCart(); setError(""); }} className="mt-2 underline underline-offset-2">
                  Clear the cart and start again
                </button>
              )}
            </div>
          )}
        </form>

        <aside className="card p-6 lg:sticky lg:top-32">
          <h2 className="text-base font-medium">Order summary</h2>
          {fieldErrors.cart && <p className="field-error">{fieldErrors.cart}</p>}
          <div className="mt-2 max-h-96 divide-y divide-line overflow-y-auto">
            {cart.map((element) => (
              <CheckoutCart key={element.productId} items={element} />
            ))}
          </div>
          <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-2">
              <dt>Items</dt>
              <dd className="price">{totalQuatity || 0}</dd>
            </div>
            <div className="flex justify-between text-ink-2">
              <dt>Delivery</dt>
              <dd>{delivery === "Pick up" ? "Pick up at the shop" : delivery ? "Deliver to me" : "Not chosen"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3 text-ink">
              <dt className="font-medium">Total</dt>
              <dd className="price text-xl">{formatPrice(finalTotal)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {showBakongQR && pendingOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-sm">
            <BakongQR
              amount={subtotal}
              orderData={pendingOrderData}
              onPaymentSuccess={({ orderId }) => {
                setShowBakongQR(false);
                setPendingOrderData(null);
                setPaymentReceipt({
                  orderId,
                  items: pendingOrderData.items,
                  cartItems: cart,
                  total: subtotal,
                  customerName: pendingOrderData.customerName,
                  delivery: pendingOrderData.delivery,
                  location: pendingOrderData.location,
                });
                setError("");
                setCustomerName("");
                setDelivery("");
                setLocation("");
                setPayment("");
                clearCart();
              }}
              onCancel={() => {
                setShowBakongQR(false);
                setPendingOrderData(null);
              }}
            />
          </div>
        </div>
      )}

      {paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="card w-full max-w-md overflow-hidden shadow-float">
            <div className="border-b border-line p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                <FiCheck size={18} strokeWidth={1.5} />
              </span>
              <h2 className="mt-4 text-xl">Payment received</h2>
              <p className="mt-1 text-sm text-ink-2">Bakong confirmed your transfer. We&apos;ll prepare your order now.</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-6">
              <dl className="space-y-2 text-sm">
                {[
                  ["Order", <span key="o" className="price">#{paymentReceipt.orderId}</span>],
                  ["Recipient", paymentReceipt.customerName],
                  ["Delivery", paymentReceipt.delivery],
                  ["Address", paymentReceipt.location],
                  ["Payment", "Bakong KHQR, paid"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6">
                    <dt className="text-ink-3">{label}</dt>
                    <dd className="text-right text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 divide-y divide-line border-y border-line">
                {paymentReceipt.cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-raised">
                      <ProductImage src={item.image} alt="" className="h-full w-full p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{item.productName || item.name}</p>
                      <p className="text-xs text-ink-3">{item.color ? `${item.color} · ` : ""}Qty {item.quantity}</p>
                    </div>
                    <span className="price text-sm">{formatPrice(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-medium">Total paid</span>
                <span className="price text-lg">{formatPrice(paymentReceipt.total)}</span>
              </div>
            </div>
            <div className="flex gap-2 border-t border-line p-4">
              <button type="button" onClick={() => setPaymentReceipt(null)} className="btn btn-secondary flex-1">Close</button>
              <Link to="/myorder" onClick={() => setPaymentReceipt(null)} className="btn btn-dark flex-1">View order</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
