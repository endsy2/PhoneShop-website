import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiX } from "react-icons/fi";
import { API_BASE_URL, deleteOrderItemByID, fetchOrderItemsByID, hasAdminPermission, removeOrder } from "../../Fetch/FetchAPI.js";
import ProductImage from "../../Component/ProductImage";
import StatusDot from "../../Component/StatusDot";
import Notice from "../../Component/Notice";
import { formatDate, formatPrice } from "../../Utils/display";

const STATUSES = ["pending", "shipping", "delivered", "completed", "canceled"];

const paymentLabel = (payment) => (payment === "By Delivery" ? "Cash on delivery" : payment === "Bakong QR" ? "Bakong KHQR" : payment || "—");

const callAdmin = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}/admin/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <dt className="text-ink-3">{label}</dt>
    <dd className="text-right text-ink">{children || "—"}</dd>
  </div>
);

const Panel = ({ title, children }) => (
  <section className="card p-5">
    <h2 className="mb-2 text-sm font-medium">{title}</h2>
    <dl>{children}</dl>
  </section>
);

const Order_By_ID = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("pending");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const canUpdate = hasAdminPermission("order:update");
  const canDelete = hasAdminPermission("order:delete");
  const canPay = hasAdminPermission("payment:manage");

  const load = useCallback(async () => {
    const response = await fetchOrderItemsByID(id);
    if (!response) {
      setOrder(false);
      return;
    }
    setItems(response.orderItems || []);
    const header = response.customerData?.[0] || null;
    setOrder(header || false); // false = loaded, no such order
    setStatus(String(header?.status || "pending").toLowerCase());
  }, [id]);

  useEffect(() => {
    load().catch((error) => {
      console.error("Error fetching order:", error);
      setOrder(false);
    });
  }, [load]);

  const run = async (action, success) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      await load();
      setNotice({ ok: true, text: success });
    } catch (error) {
      setNotice({ ok: false, text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (next) => {
    if (next === "canceled" && !window.confirm("Cancel this order? Its items go back to stock.")) return;
    run(() => callAdmin(`updateOrderStatus/${order.order_id}`, { status: next }), `Status set to ${next}`);
  };

  const confirmPayment = () => {
    const question = order.payment === "By Delivery" ? "Confirm the cash was collected on delivery?" : "Confirm the payment was received?";
    if (window.confirm(question)) run(() => callAdmin(`confirmPayment/${order.order_id}`), "Payment marked as received");
  };

  const cancelPayment = () => {
    if (window.confirm("Mark this payment as not received?")) run(() => callAdmin(`cancelPayment/${order.order_id}`), "Payment marked as unpaid");
  };

  const removeItem = (item) => {
    if (window.confirm(`Remove ${item.phone_name} from this order?`)) {
      run(() => deleteOrderItemByID({ id: item.order_item_id }), "Item removed");
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm(`Delete order #${order.order_id}? This can't be undone.`)) return;
    try {
      await removeOrder({ deleteid: order.order_id });
      nav("/dashboard/order");
    } catch (error) {
      setNotice({ ok: false, text: error.message });
    }
  };

  if (order === null) return <p className="py-16 text-center text-sm text-ink-3">Loading order</p>;
  if (order === false) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink">Order #{id} doesn&apos;t exist</p>
        <p className="mt-1 text-sm text-ink-3">It may have been deleted</p>
        <Link to="/dashboard/order" className="btn btn-secondary mt-6">Back to orders</Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + parseFloat(item.amount_per_total_orderItem || 0), 0);
  const listTotal = items.reduce((sum, item) => sum + parseFloat(item.price_per_unit || 0) * Number(item.quantity || 0), 0);
  const discount = Math.max(0, listTotal - total);
  const units = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const paid = order.payment_verified === 1;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/order" className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
        <FiArrowLeft size={14} strokeWidth={1.5} /> Orders
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="price text-2xl">Order #{order.order_id}</h1>
          <p className="mt-1 text-sm text-ink-3">Placed {formatDate(order.order_date)}</p>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate ? (
            <select value={status} onChange={(e) => changeStatus(e.target.value)} disabled={busy} className="input h-9 w-40 capitalize" aria-label="Order status">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          ) : (
            <StatusDot status={status} />
          )}
          {canDelete && (
            <button type="button" onClick={deleteOrder} className="btn btn-danger h-9">
              <FiTrash2 size={14} strokeWidth={1.5} /> Delete
            </button>
          )}
        </div>
      </div>

      {notice && <Notice tone={notice.ok ? "ok" : "error"}>{notice.text}</Notice>}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        {/* The receipt */}
        <section className="card">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-medium">Items</h2>
            <span className="price text-[13px] text-ink-3">{units} units</span>
          </div>
          {items.length > 0 ? (
            <ul className="divide-y divide-line">
              {items.map((item) => {
                const unit = parseFloat(item.price_per_unit || 0);
                const lineTotal = parseFloat(item.amount_per_total_orderItem || 0);
                const paidUnit = item.quantity ? lineTotal / item.quantity : unit;
                return (
                  <li key={item.order_item_id} className="flex items-center gap-4 px-5 py-4">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-raised">
                      <ProductImage src={item.images} alt="" className="h-full w-full p-1" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{item.phone_name}</p>
                      <p className="mt-0.5 text-xs text-ink-3">
                        {item.color} · <span className="price">{item.quantity} × {formatPrice(paidUnit)}</span>
                        {paidUnit < unit && <span className="price ml-1.5 line-through">{formatPrice(unit)}</span>}
                      </p>
                    </div>
                    <span className="price text-sm text-ink">{formatPrice(lineTotal)}</span>
                    {canUpdate && status !== "canceled" && (
                      <button type="button" onClick={() => removeItem(item)} disabled={busy} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${item.phone_name}`}>
                        <FiX size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-ink-3">This order has no items</p>
          )}
          <dl className="border-t border-line px-5 py-4">
            {discount > 0 && (
              <>
                <Row label="List price"><span className="price">{formatPrice(listTotal)}</span></Row>
                <Row label="Promotion"><span className="price text-brand">−{formatPrice(discount)}</span></Row>
              </>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <dt className="text-sm font-medium">Total</dt>
              <dd className="price text-xl text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-4">
          <Panel title="Payment">
            <Row label="Method">{paymentLabel(order.payment)}</Row>
            <Row label="Status"><StatusDot status={paid ? "paid" : "unpaid"} /></Row>
            {canPay && status !== "canceled" && (
              <div className="mt-3 border-t border-line pt-3">
                {paid ? (
                  <button type="button" onClick={cancelPayment} disabled={busy} className="btn btn-secondary w-full">Mark as unpaid</button>
                ) : (
                  <button type="button" onClick={confirmPayment} disabled={busy} className="btn btn-primary w-full">
                    {order.payment === "By Delivery" ? "Cash collected" : "Payment received"}
                  </button>
                )}
              </div>
            )}
          </Panel>
          <Panel title="Customer">
            <Row label="Account">{order.username}</Row>
            <Row label="Recipient">{order.recipient_name || order.display_name}</Row>
            <Row label="Phone">{order.phone_number}</Row>
            <Row label="Email">{order.email}</Row>
          </Panel>
          <Panel title="Delivery">
            <Row label="Type">{order.delivery}</Row>
            <div className="mt-1.5 rounded-lg bg-raised px-3 py-2.5 text-sm text-ink-2">{order.location || order.address || "No address"}</div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Order_By_ID;
