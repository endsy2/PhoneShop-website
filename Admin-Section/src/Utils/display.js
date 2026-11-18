import { API_BASE_URL } from "../Fetch/FetchAPI";

export const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// Turns a stored image value ("a.jpg, b.jpg", "uploads\\a.jpg") into a URL for its first file.
export const imageUrl = (raw) => {
  const first = String(raw || "").split(",")[0].trim().replace(/\\/g, "/").replace(/^uploads\//, "");
  return first ? `${API_BASE_URL}/${first}` : "";
};
