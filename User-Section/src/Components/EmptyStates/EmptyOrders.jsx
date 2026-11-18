import { Link } from "react-router-dom";
import { FiPackage } from "react-icons/fi";

const EmptyOrders = () => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
    <FiPackage size={28} strokeWidth={1.5} className="text-ink-3" />
    <h2 className="mt-4 text-base">No orders yet</h2>
    <p className="mt-1 text-sm text-ink-2">Orders you place will show up here with their status and receipt</p>
    <Link to="/AfterHomePage?page=PRODUCT" className="btn btn-dark mt-6">Browse products</Link>
  </div>
);

export default EmptyOrders;
