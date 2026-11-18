import { FiGrid, FiMessageSquare, FiPackage, FiPlusSquare, FiShoppingBag, FiTag, FiUsers } from "react-icons/fi";

// `permission` hides the link from staff whose role lacks it (see API/Utils/rbac.js).
export const nav_bar = [
  { icon: FiGrid, label: "Dashboard", path: "", permission: "dashboard:read" },
  { icon: FiShoppingBag, label: "Orders", path: "order", permission: "order:read" },
  { icon: FiPackage, label: "Products", path: "product", permission: "catalog:read" },
  { icon: FiPlusSquare, label: "Add product", path: "addProduct", permission: "catalog:write" },
  { icon: FiTag, label: "Promotions", path: "offer", permission: "promotion:write" },
  { icon: FiMessageSquare, label: "Messages", path: "message", permission: "notification:write" },
  { icon: FiUsers, label: "Staff", path: "staff", permission: "staff:manage" },
];

export const tableHeadProduct = ["ID", "Product", "Category", "Price", "Stock", "Released"];

export const tableHeadOrder = ["Order", "Customer", "Delivery address", "Date", "Amount", "Payment", "Status"];

export const tableHeadOffer = ["ID", "Product", "Promotion", "Price", "Sale price", "Discount", "Ends"];
