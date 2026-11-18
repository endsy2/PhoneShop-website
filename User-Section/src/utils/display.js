import { NETWORK_CONFIG } from "../network/Network_EndPoint";

export const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Turns a stored image value ("a.jpg, b.jpg", "uploads\\a.jpg") into a URL for its first file.
export const imageUrl = (raw) => {
  const first = String(raw || "").split(",")[0].trim().replace(/\\/g, "/").replace(/^uploads\//, "");
  return first ? `${NETWORK_CONFIG.apiBaseUrl}/${first}` : "";
};
