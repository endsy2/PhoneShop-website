import axios from "axios";
import React, { useEffect, useState } from "react";
import { NETWORK_CONFIG, USERENDPOINT } from "../../network/Network_EndPoint";

const MyOrderPage = () => {
  const [listOrderState, setListOrderState] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getOrder = async () => {
    const orderUrl = `${NETWORK_CONFIG.apiBaseUrl}${USERENDPOINT.GET_ORDER}`;

    try {
      const response = await axios.get(orderUrl, { withCredentials: true });
      if (response.status === 200) {
        setListOrderState(groupOrdersByOrderId(response.data.data || []));
      }
    } catch (error) {
      console.log(error);
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
            items: [],
            total: 0,
          };
        }

        acc[order_id].items.push({
          order_item_id: order.order_item_id,
          quantity: order.quantity,
          price: parseFloat(order.amount_per_total_orderItem),
          name: order.phone_name,
          description: `Color: ${order.color}`,
          image: order.images,
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
      <div style={styles.headerRow}>
        <h1 style={styles.title}>My Orders</h1>
        <p style={styles.subtitle}>{listOrderState.length} orders found</p>
      </div>

      <div style={styles.orderList}>
        {listOrderState.length > 0 ? (
          listOrderState.map((order) => (
            <OrderCard
              key={order.orderNumber}
              order={order}
              onViewDetail={setSelectedOrder}
            />
          ))
        ) : (
          <div style={styles.emptyState}>No orders yet.</div>
        )}
      </div>

      {selectedOrder ? <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} /> : null}
    </div>
  );
};

export const OrderCard = ({ order, onViewDetail }) => {
  const statusStyle = getStatusStyle(order.status);
  const primaryItem = order.items[0];

  return (
    <div style={styles.card}>
      <div style={styles.cardTopRow}>
        <div>
          <p style={styles.orderLabel}>Order ID</p>
          <h2 style={styles.orderNumber}>#{order.orderNumber}</h2>
        </div>
        <span style={{ ...styles.statusBadge, ...statusStyle }}>{order.status || "Pending"}</span>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.detailGrid}>
          <div>
            <p style={styles.detailLabel}>Product</p>
            <p style={styles.detailValue}>{primaryItem?.name || "Order items"}</p>
            {order.items.length > 1 ? <p style={styles.detailHint}>+ {order.items.length - 1} more item(s)</p> : null}
          </div>
          <div>
            <p style={styles.detailLabel}>Total</p>
            <p style={styles.detailValue}>${order.total.toFixed(2)}</p>
          </div>
          <div>
            <p style={styles.detailLabel}>Date</p>
            <p style={styles.detailValue}>{formatOrderDate(order.date)}</p>
          </div>
        </div>

        {primaryItem ? (
          <div style={styles.itemPreview}>
            <div style={styles.itemInfo}>
              <p style={styles.itemName}>{primaryItem.name}</p>
              <p style={styles.itemDescription}>{primaryItem.description}</p>
            </div>
            <div style={styles.quantityPill}>Qty {primaryItem.quantity}</div>
          </div>
        ) : null}
      </div>

      <div style={styles.cardFooter}>
        <button type="button" style={styles.detailButton} onClick={() => onViewDetail(order)}>View Detail</button>
      </div>
    </div>
  );
};

const ReceiptModal = ({ order, onClose }) => {
  const subtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.receiptCard} onClick={(event) => event.stopPropagation()}>
        <div style={styles.receiptHeader}>
          <div>
            <p style={styles.receiptLabel}>Receipt</p>
            <h2 style={styles.receiptTitle}>Order #{order.orderNumber}</h2>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose}>X</button>
        </div>

        <div style={styles.receiptMetaGrid}>
          <div>
            <p style={styles.detailLabel}>Customer</p>
            <p style={styles.detailValue}>{order.username || "N/A"}</p>
          </div>
          <div>
            <p style={styles.detailLabel}>Date</p>
            <p style={styles.detailValue}>{formatOrderDate(order.date)}</p>
          </div>
          <div>
            <p style={styles.detailLabel}>Status</p>
            <p style={styles.detailValue}>{order.status || "Pending"}</p>
          </div>
        </div>

        <div style={styles.receiptItems}>
          {order.items.map((item) => (
            <div key={item.order_item_id} style={styles.receiptItemRow}>
              <div style={styles.receiptItemLeft}>
                <img
                  src={getOrderItemImageSrc(item.image)}
                  alt={item.name || "Product"}
                  style={styles.receiptItemImage}
                />
                <div>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemDescription}>{item.description}</p>
                </div>
              </div>
              <div style={styles.receiptAmounts}>
                <span>Qty {item.quantity}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.receiptTotals}>
          <div style={styles.receiptTotalRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.receiptTotalRow}>
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  const normalized = (status || "Pending").toLowerCase();

  if (normalized.includes("shipping")) {
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  }

  if (normalized.includes("delivered")) {
    return { backgroundColor: "#dcfce7", color: "#166534" };
  }

  if (normalized.includes("cancel")) {
    return { backgroundColor: "#fee2e2", color: "#b91c1c" };
  }

  return { backgroundColor: "#fef3c7", color: "#92400e" };
};

const formatOrderDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getOrderItemImageSrc = (images) => {
  if (!images) return "https://via.placeholder.com/80x80?text=No+Image";

  const firstImage = String(images).split(",")[0].trim();
  if (!firstImage) return "https://via.placeholder.com/80x80?text=No+Image";

  const normalizedPath = firstImage.replace(/\\/g, "/").replace(/^uploads\//, "");
  if (normalizedPath.startsWith("http")) return normalizedPath;

  return `${NETWORK_CONFIG.apiBaseUrl}/${normalizedPath}`;
};

const styles = {
  wrapper: { display: "grid", gap: "18px", marginTop: "24px", paddingBottom: "30px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: "12px", flexWrap: "wrap" },
  title: { margin: 0, color: "#16a34a", fontSize: "28px", fontWeight: 700 },
  subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
  orderList: { display: "grid", gap: "16px" },
  emptyState: { padding: "22px", border: "1px dashed #cbd5e1", borderRadius: "14px", backgroundColor: "#f8fafc", color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: "18px", border: "1px solid #e5e7eb", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", padding: "20px" },
  cardTopRow: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" },
  orderLabel: { margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" },
  orderNumber: { margin: "4px 0 0", fontSize: "22px", fontWeight: 700, color: "#111827" },
  statusBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 },
  cardBody: { display: "grid", gap: "18px", marginTop: "18px" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  detailLabel: { margin: 0, fontSize: "12px", color: "#6b7280" },
  detailValue: { margin: "6px 0 0", fontSize: "16px", fontWeight: 700, color: "#111827" },
  detailHint: { margin: "4px 0 0", fontSize: "12px", color: "#6b7280" },
  itemPreview: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "14px" },
  itemInfo: { display: "grid", gap: "4px" },
  itemName: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" },
  itemDescription: { margin: 0, fontSize: "13px", color: "#6b7280" },
  quantityPill: { padding: "8px 12px", borderRadius: "999px", backgroundColor: "#ecfdf5", color: "#15803d", fontSize: "12px", fontWeight: 700 },
  cardFooter: { display: "flex", justifyContent: "flex-end", marginTop: "18px" },
  detailButton: { border: "1px solid #16a34a", backgroundColor: "#fff", color: "#16a34a", padding: "10px 16px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" },
  modalBackdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 50 },
  receiptCard: { width: "min(760px, 100%)", backgroundColor: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "grid", gap: "18px", maxHeight: "90vh", overflowY: "auto" },
  receiptHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
  receiptLabel: { margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" },
  receiptTitle: { margin: "4px 0 0", fontSize: "24px", fontWeight: 800, color: "#111827" },
  closeButton: { border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#111827", borderRadius: "999px", width: "36px", height: "36px", cursor: "pointer", fontWeight: 700 },
  receiptMetaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "14px" },
  receiptItems: { display: "grid", gap: "12px" },
  receiptItemRow: { display: "flex", justifyContent: "space-between", gap: "12px", padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: "14px", backgroundColor: "#fff" },
  receiptItemLeft: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 },
  receiptItemImage: { width: "56px", height: "56px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#f8fafc", flexShrink: 0 },
  receiptAmounts: { display: "grid", justifyItems: "end", gap: "4px", color: "#374151", fontWeight: 700 },
  receiptTotals: { display: "grid", gap: "10px", paddingTop: "8px", borderTop: "1px dashed #d1d5db" },
  receiptTotalRow: { display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "#111827" },
};

export default MyOrderPage;