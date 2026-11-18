import { FiAlertCircle, FiCheck } from "react-icons/fi";

// Inline success / error message under a form
const Notice = ({ tone = "ok", children }) =>
  children ? (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${tone === "error" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand"}`}
    >
      {tone === "error" ? <FiAlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" /> : <FiCheck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />}
      {children}
    </p>
  ) : null;

export default Notice;
