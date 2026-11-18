import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiX } from "react-icons/fi";
import { fetchProductByName } from "../../FetchAPI/Fetch";
import { NETWORK_CONFIG, USERENDPOINT } from "../../network/Network_EndPoint";
import { addToCompare } from "../../store/compare";
import Breadcrumb from "../../Components/Breadcrumb";
import EmptyOrders from "../../Components/EmptyStates/EmptyOrders";
import Price from "../../Components/Price";
import ProductImage from "../../Components/ProductImage";
import StatusDot from "../../Components/StatusDot";
import { formatPrice } from "../../utils/display";

const formatOrderDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const paymentLabel = (payment) => (payment === "By Delivery" ? "Cash on delivery" : payment === "Bakong QR" ? "Bakong KHQR" : payment || "—");

const groupOrdersByOrderId = (orders) =>
  Object.values(
    orders.reduce((acc, order) => {
      const { order_id } = order;
      if (!acc[order_id]) {
        acc[order_id] = {
          orderNumber: order.order_id,
          date: order.order_date,
          status: order.status,
          payment: order.payment,
          delivery: order.delivery,
          location: order.location,
          payment_verified: order.payment_verified,
          items: [],
          total: 0,
        };
      }
      acc[order_id].items.push({
        order_item_id: order.order_item_id,
        quantity: order.quantity,
        price: parseFloat(order.amount_per_total_orderItem),
        name: order.phone_name,
        color: order.color,
        image: order.images,
        discount_price: order.discount_price_per_unit,
        original_price: order.price_per_unit,
      });
      acc[order_id].total += parseFloat(order.amount_per_total_orderItem);
      return acc;
    }, {})
  );

// Unit price as a price tag (struck list price when it was bought on promotion)
const UnitPrice = ({ item }) => {
  const discounted = item.discount_price && parseFloat(item.discount_price) < parseFloat(item.original_price);
  return <Price size="sm" price={discounted ? item.discount_price : item.original_price || item.price / item.quantity} original={discounted ? item.original_price : null} />;
};

const ItemRow = ({ item, action }) => (
  <div className="flex items-center gap-4 py-4">
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-raised">
      <ProductImage src={item.image} alt={item.name} className="h-full w-full p-1.5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm text-ink">{item.name}</p>
      <p className="mt-0.5 text-xs text-ink-3">
        {item.color ? `${item.color} · ` : ""}Qty <span className="price">{item.quantity}</span>
      </p>
      <div className="mt-1"><UnitPrice item={item} /></div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <span className="price text-sm text-ink">{formatPrice(item.price)}</span>
      {action}
    </div>
  </div>
);

export const OrderCard = ({ order, onViewDetail }) => (
  <article className="card">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-baseline gap-3">
        <span className="price text-sm text-ink">#{order.orderNumber}</span>
        <span className="text-[13px] text-ink-3">{formatOrderDate(order.date)}</span>
      </div>
      <div className="flex items-center gap-5">
        <StatusDot status={order.payment_verified ? "paid" : "unpaid"} />
        <StatusDot status={order.status} />
      </div>
    </header>
    <div className="divide-y divide-line px-5">
      {order.items.map((item) => (
        <ItemRow key={item.order_item_id} item={item} />
      ))}
    </div>
    <footer className="flex items-center justify-between border-t border-line px-5 py-4">
      <p className="text-sm text-ink-2">
        Total <span className="price ml-2 text-base text-ink">{formatPrice(order.total)}</span>
      </p>
      <button type="button" onClick={() => onViewDetail(order)} className="btn btn-secondary btn-sm">
        Receipt
      </button>
    </footer>
  </article>
);

const ReceiptModal = ({ order, onClose, onCompareItem }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
    <div className="card flex max-h-[90vh] w-full max-w-lg flex-col shadow-float" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Receipt for order ${order.orderNumber}`}>
      <div className="flex items-start justify-between border-b border-line p-5">
        <div>
          <p className="text-[13px] text-ink-3">Receipt</p>
          <h2 className="price mt-0.5 text-lg">Order #{order.orderNumber}</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <FiX size={18} strokeWidth={1.5} />
        </button>
      </div>

      <div className="overflow-y-auto p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><dt className="text-[13px] text-ink-3">Date</dt><dd className="mt-0.5 text-ink">{formatOrderDate(order.date)}</dd></div>
          <div><dt className="text-[13px] text-ink-3">Status</dt><dd className="mt-0.5"><StatusDot status={order.status} /></dd></div>
          <div><dt className="text-[13px] text-ink-3">Payment</dt><dd className="mt-0.5 text-ink">{paymentLabel(order.payment)}</dd></div>
          <div><dt className="text-[13px] text-ink-3">Paid</dt><dd className="mt-0.5"><StatusDot status={order.payment_verified ? "paid" : "unpaid"} /></dd></div>
          <div className="col-span-2"><dt className="text-[13px] text-ink-3">Delivery</dt><dd className="mt-0.5 text-ink">{order.delivery || "—"}</dd></div>
        </dl>

        {order.location && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-raised px-3 py-2.5 text-sm text-ink-2">
            <FiMapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-3" />
            {order.location}
          </p>
        )}

        <div className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <ItemRow
              key={item.order_item_id}
              item={item}
              action={
                <button type="button" onClick={() => onCompareItem(item)} className="text-xs text-ink-3 underline-offset-2 hover:text-ink hover:underline">
                  Compare
                </button>
              }
            />
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="price text-lg">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  </div>
);

const MyOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCompareOrderItem = async (item) => {
    try {
      const response = await fetchProductByName({ phone_name: item.name });
      const productData = response?.data?.[0];
      if (productData) {
        dispatch(addToCompare(productData));
        navigate("/compare-product");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    axios
      .get(`${NETWORK_CONFIG.apiBaseUrl}${USERENDPOINT.GET_ORDER}`, { withCredentials: true })
      .then((response) => setOrders(groupOrdersByOrderId(response.data.data || [])))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container max-w-3xl pt-6">
      <Breadcrumb items={[{ label: "My orders" }]} />
      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-3xl tracking-[-0.01em]">My orders</h1>
        {!loading && <span className="price text-sm text-ink-3">{orders.length}</span>}
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-ink-3">Loading your orders</p>
        ) : orders.length > 0 ? (
          [...orders].reverse().map((order) => (
            <OrderCard key={order.orderNumber} order={order} onViewDetail={setSelectedOrder} />
          ))
        ) : (
          <EmptyOrders />
        )}
      </div>

      {selectedOrder && (
        <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onCompareItem={handleCompareOrderItem} />
      )}
    </div>
  );
};

export default MyOrderPage;
