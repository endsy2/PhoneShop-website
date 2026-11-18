import { formatPrice } from "../utils/display";

// The store's price tag: the price a customer pays, and when a promotion is live the list
// price struck through with the saving as a small tag. Used everywhere a price is shown.
const SIZES = {
  sm: { now: "text-sm", was: "text-xs" },
  md: { now: "text-base", was: "text-[13px]" },
  lg: { now: "text-[28px] leading-none", was: "text-sm" },
};

const Price = ({ price, original, size = "md", className = "" }) => {
  const now = Number(price);
  const was = Number(original);
  const onSale = was > 0 && now > 0 && now < was;
  const percent = onSale ? Math.round((1 - now / was) * 100) : 0;
  const s = SIZES[size] || SIZES.md;

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className={`price font-medium ${onSale ? "text-brand" : "text-ink"} ${s.now}`}>{formatPrice(now)}</span>
      {onSale && (
        <>
          <span className={`price text-ink-3 line-through ${s.was}`}>{formatPrice(was)}</span>
          <span className="price rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">−{percent}%</span>
        </>
      )}
    </span>
  );
};

export default Price;
