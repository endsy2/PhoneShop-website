// Order or payment status as a small dot and a word. Colour only where it carries meaning.
const STATUS = {
  pending: { label: "Pending", dot: "bg-warn" },
  shipping: { label: "Shipping", dot: "bg-ink-2" },
  completed: { label: "Completed", dot: "bg-brand" },
  delivered: { label: "Delivered", dot: "bg-brand" },
  canceled: { label: "Canceled", dot: "bg-danger" },
  paid: { label: "Paid", dot: "bg-brand" },
  unpaid: { label: "Unpaid", dot: "bg-warn" },
};

const StatusDot = ({ status, className = "" }) => {
  const s = STATUS[String(status || "pending").toLowerCase()] || { label: status, dot: "bg-ink-3" };
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] text-ink-2 ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export default StatusDot;
