import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProductByName } from "../../FetchAPI/Fetch";
import { NETWORK_CONFIG, USERENDPOINT } from "../../network/Network_EndPoint";
import { addToCompare } from "../../store/compare";
import Breadcrumb from "../../Components/Breadcrumb";
import { OrderListSkeleton } from "../../Components/Skeletons/OrderCardSkeleton";
import EmptyOrders from "../../Components/EmptyStates/EmptyOrders";

const MyOrderPage = () => {
  const [listOrderState, setListOrderState] = useState([]);
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
      console.log(error);
    }
  };

  const getOrder = async () => {
    const orderUrl = `${NETWORK_CONFIG.apiBaseUrl}${USERENDPOINT.GET_ORDER}`;
    try {
      setLoading(true);
      const response = await axios.get(orderUrl, { withCredentials: true });
      if (response.status === 200) {
        setListOrderState(groupOrdersByOrderId(response.data.data || []));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const groupOrdersByOrderId = (orders) => {
    return Object.values(
      orders.reduce((acc, order) => {
        const { order_id } = order;
        if (!acc[order_id]) {
          acc[order_id] = {
            orderNumber: order.order_id,
            username: order.username,
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
          discount_percentage: order.discount_percentage,
        });
        acc[order_id].total += parseFloat(order.amount_per_total_orderItem);
        return acc;
      }, {})
    );
  };

  useEffect(() => {
    getOrder();
  }, []);

  return (
    <div style={styles.wrapper}>
      <Breadcrumb items={[{ label: "My Orders" }]} />

      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>{listOrderState.length} order{listOrderState.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      <div style={styles.orderList}>
        {loading ? (
          <OrderListSkeleton count={3} />
        ) : listOrderState.length > 0 ? (
          listOrderState.map((order) => (
            <OrderCard key={order.orderNumber} order={order} onViewDetail={setSelectedOrder} />
          ))
        ) : (
          <EmptyOrders />
        )}
      </div>

      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCompareItem={handleCompareOrderItem}
        />
      )}
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
export const OrderCard = ({ order, onViewDetail }) => {
  const statusCfg = getStatusConfig(order.status);
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <div style={styles.card}>
      {/* Top bar: order id + status */}
      <div style={styles.cardTop}>
        <div style={styles.cardTopLeft}>
          <span style={styles.orderIdLabel}>Order</span>
          <span style={styles.orderIdValue}>#{order.orderNumber}</span>
          <span style={styles.orderDate}>{formatOrderDate(order.date)}</span>
        </div>
        <span style={{ ...styles.statusBadge, background: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Product list preview */}
      <div style={styles.itemsList}>
        {order.items.map((item, i) => (
          <div key={item.order_item_id} style={styles.itemRow}>
            <img
              src={getImageSrc(item.image)}
              alt={item.name}
              style={styles.itemImg}
              onError={(e) => { e.target.src = "https://via.placeholder.com/64x64?text=?"; }}
            />
            <div style={styles.itemMeta}>
              <p style={styles.itemName}>{item.name}</p>
              <div style={styles.itemTags}>
                <span style={{ ...styles.tag, background: "#f3f4f6", color: "#374151" }}>
                  <span
                    style={{
                      display: "inline-block", width: 10, height: 10,
                      borderRadius: "50%", background: item.color,
                      border: "1px solid #d1d5db", marginRight: 4
                    }}
                  />
                  {item.color}
                </span>
                <span style={{ ...styles.tag, background: "#f0fdf4", color: "#15803d" }}>
                  Qty {item.quantity}
                </span>
                {item.discount_percentage > 0 && (
                  <span style={{ ...styles.tag, background: "#fef2f2", color: "#dc2626" }}>
                    -{item.discount_percentage}%
                  </span>
                )}
              </div>
            </div>
            <div style={styles.itemPrice}>
              {item.discount_price && parseFloat(item.discount_price) < parseFloat(item.original_price) ? (
                <>
                  <span style={styles.priceOriginal}>${parseFloat(item.original_price).toFixed(2)}</span>
                  <span style={styles.priceDiscounted}>${parseFloat(item.discount_price).toFixed(2)}</span>
                </>
              ) : (
                <span style={styles.priceNormal}>${item.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Footer: total + button */}
      <div style={styles.cardFooter}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total ({order.items.length} item{order.items.length !== 1 ? "s" : ""})</span>
          <span style={styles.totalValue}>${order.total.toFixed(2)}</span>
        </div>
        <button style={styles.detailBtn} onClick={() => onViewDetail(order)}>
          View Receipt
        </button>
      </div>
    </div>
  );
};

// ─── Receipt Modal ────────────────────────────────────────────────────────────
const ReceiptModal = ({ order, onClose, onCompareItem }) => {
  const statusCfg = getStatusConfig(order.status);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.receiptLabel}>Receipt</p>
            <h2 style={styles.receiptTitle}>Order #{order.orderNumber}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Status + Meta */}
        <div style={styles.metaGrid}>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Status</p>
            <span style={{ ...styles.statusBadge, background: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Date</p>
            <p style={styles.metaValue}>{formatOrderDate(order.date)}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Payment</p>
            <p style={styles.metaValue}>{order.payment || "N/A"}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Delivery</p>
            <p style={styles.metaValue}>{order.delivery || "N/A"}</p>
          </div>
        </div>

        {/* Delivery address */}
        {order.location && (
          <div style={styles.addressBox}>
            <span style={styles.addressIcon}>📍</span>
            <span style={styles.addressText}>{order.location}</span>
          </div>
        )}

        {/* Items */}
        <div style={styles.modalItems}>
          {order.items.map((item) => (
            <div key={item.order_item_id} style={styles.modalItemRow}>
              <img
                src={getImageSrc(item.image)}
                alt={item.name}
                style={styles.modalItemImg}
                onError={(e) => { e.target.src = "https://via.placeholder.com/72x72?text=?"; }}
              />
              <div style={styles.modalItemInfo}>
                <p style={styles.itemName}>{item.name}</p>
                <div style={styles.itemTags}>
                  <span style={{ ...styles.tag, background: "#f3f4f6", color: "#374151" }}>
                    <span style={{
                      display: "inline-block", width: 10, height: 10,
                      borderRadius: "50%", background: item.color,
                      border: "1px solid #d1d5db", marginRight: 4
                    }} />
                    {item.color}
                  </span>
                  <span style={{ ...styles.tag, background: "#f0fdf4", color: "#15803d" }}>
                    Qty {item.quantity}
                  </span>
                </div>
              </div>
              <div style={styles.modalItemRight}>
                {item.discount_price && parseFloat(item.discount_price) < parseFloat(item.original_price) ? (
                  <>
                    <span style={styles.priceOriginal}>${parseFloat(item.original_price).toFixed(2)}</span>
                    <span style={styles.priceDiscounted}>${parseFloat(item.discount_price).toFixed(2)}</span>
                  </>
                ) : (
                  <span style={styles.priceNormal}>${item.price.toFixed(2)}</span>
                )}
                <button style={styles.compareBtn} onClick={() => onCompareItem(item)}>
                  Compare
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={styles.totalsBox}>
          <div style={styles.totalLine}>
            <span style={{ color: "#6b7280" }}>Subtotal</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div style={styles.totalLine}>
            <span style={{ color: "#6b7280" }}>Delivery</span>
            <span style={{ color: "#16a34a" }}>Free</span>
          </div>
          <div style={{ ...styles.totalLine, borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#16a34a" }}>${order.total.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e" },
  completed: { label: "Completed", bg: "#dcfce7", color: "#166534" },
  shipping:  { label: "Shipping",  bg: "#dbeafe", color: "#1e40af" },
  delivered: { label: "Delivered", bg: "#d1fae5", color: "#065f46" },
  canceled:  { label: "Canceled",  bg: "#fee2e2", color: "#991b1b" },
};

const getStatusConfig = (status) => {
  const key = (status || "pending").toLowerCase();
  return STATUS_MAP[key] || STATUS_MAP.pending;
};

const formatOrderDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getImageSrc = (images) => {
  if (!images) return "https://via.placeholder.com/64x64?text=?";
  const first = String(images).split(",")[0].trim();
  if (!first) return "https://via.placeholder.com/64x64?text=?";
  const path = first.replace(/\\/g, "/").replace(/^uploads\//, "");
  if (path.startsWith("http")) return path;
  return `${NETWORK_CONFIG.apiBaseUrl}/${path}`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: { display: "grid", gap: "20px", marginTop: "24px", paddingBottom: "40px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  title: { margin: 0, color: "#16a34a", fontSize: "26px", fontWeight: 800 },
  subtitle: { margin: "4px 0 0", color: "#9ca3af", fontSize: "13px" },
  orderList: { display: "grid", gap: "16px" },

  // Card
  card: {
    background: "#fff", borderRadius: "16px",
    border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px",
  },
  cardTopLeft: { display: "flex", alignItems: "center", gap: "10px" },
  orderIdLabel: { fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  orderIdValue: { fontSize: "18px", fontWeight: 800, color: "#111827" },
  orderDate: { fontSize: "13px", color: "#9ca3af" },
  statusBadge: {
    padding: "5px 14px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 700,
  },
  divider: { height: "1px", background: "#f3f4f6" },

  // Items list
  itemsList: { display: "grid", gap: "0px" },
  itemRow: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 20px",
    borderBottom: "1px solid #f9fafb",
  },
  itemImg: {
    width: 64, height: 64, objectFit: "cover",
    borderRadius: "10px", border: "1px solid #e5e7eb",
    flexShrink: 0, background: "#f9fafb",
  },
  itemMeta: { flex: 1, minWidth: 0 },
  itemName: { margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemTags: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tag: { padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center" },
  itemPrice: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 },
  priceOriginal: { fontSize: "12px", color: "#9ca3af", textDecoration: "line-through" },
  priceDiscounted: { fontSize: "15px", fontWeight: 800, color: "#dc2626" },
  priceNormal: { fontSize: "15px", fontWeight: 800, color: "#111827" },

  // Footer
  cardFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 20px",
  },
  totalRow: { display: "flex", flexDirection: "column", gap: "2px" },
  totalLabel: { fontSize: "12px", color: "#9ca3af" },
  totalValue: { fontSize: "20px", fontWeight: 800, color: "#111827" },
  detailBtn: {
    padding: "10px 22px", borderRadius: "10px",
    border: "1.5px solid #16a34a", background: "#fff",
    color: "#16a34a", fontWeight: 700, fontSize: "14px",
    cursor: "pointer",
  },

  // Modal
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px", zIndex: 50,
  },
  modal: {
    width: "min(680px, 100%)", background: "#fff", borderRadius: "20px",
    padding: "28px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
    display: "grid", gap: "20px", maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  receiptLabel: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af" },
  receiptTitle: { margin: "4px 0 0", fontSize: "22px", fontWeight: 800, color: "#111827" },
  closeBtn: {
    width: 34, height: 34, borderRadius: "50%",
    border: "1px solid #e5e7eb", background: "#fff",
    color: "#374151", fontWeight: 700, cursor: "pointer", fontSize: "14px",
  },

  // Meta grid
  metaGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px", padding: "16px", background: "#f9fafb", borderRadius: "12px",
  },
  metaItem: {},
  metaLabel: { margin: "0 0 4px", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  metaValue: { margin: 0, fontSize: "14px", fontWeight: 700, color: "#111827" },

  // Address
  addressBox: {
    display: "flex", alignItems: "flex-start", gap: "8px",
    padding: "12px 16px", background: "#f0fdf4", borderRadius: "10px",
    border: "1px solid #bbf7d0",
  },
  addressIcon: { fontSize: "16px", flexShrink: 0 },
  addressText: { fontSize: "14px", color: "#166534", fontWeight: 600 },

  // Modal items
  modalItems: { display: "grid", gap: "10px" },
  modalItemRow: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px", border: "1px solid #f3f4f6",
    borderRadius: "12px", background: "#fff",
  },
  modalItemImg: {
    width: 72, height: 72, objectFit: "cover",
    borderRadius: "10px", border: "1px solid #e5e7eb",
    flexShrink: 0, background: "#f9fafb",
  },
  modalItemInfo: { flex: 1, minWidth: 0 },
  modalItemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 },

  // Totals
  totalsBox: {
    display: "grid", gap: "10px",
    padding: "16px", background: "#f9fafb", borderRadius: "12px",
  },
  totalLine: { display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "#111827" },

  compareBtn: {
    padding: "5px 12px", borderRadius: "999px",
    border: "1px solid #16a34a", background: "#fff",
    color: "#16a34a", fontSize: "11px", fontWeight: 700, cursor: "pointer",
  },
};

export default MyOrderPage;
