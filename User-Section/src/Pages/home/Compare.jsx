import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiColumns, FiX } from "react-icons/fi";
import { clearCompare, removeFromCompare } from "../../store/compare";
import Price from "../../Components/Price";
import ProductImage from "../../Components/ProductImage";

const compareFields = [
  { label: "Colour", key: "color" },
  { label: "Storage", key: "storage" },
  { label: "RAM", key: "ram" },
  { label: "Display", key: "screen_size" },
  { label: "Processor", key: "processor" },
  { label: "Battery", key: "battery" },
  { label: "Camera", key: "camera" },
  { label: "Released", key: "release_date" },
];

const formatValue = (value, key) => {
  if (!value) return "—";
  if (key === "release_date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }
  return value;
};

const effectivePrice = (item) => Number(item?.price_discount ?? item?.price ?? Infinity);

const Compare = () => {
  const dispatch = useDispatch();
  const items = useSelector((store) => store.compare.compareItems);

  if (items.length === 0) {
    return (
      <div className="page-container flex flex-col items-center py-24 text-center">
        <FiColumns size={28} strokeWidth={1.5} className="text-ink-3" />
        <h1 className="mt-4 text-xl">Nothing to compare yet</h1>
        <p className="mt-1 text-sm text-ink-2">Use the compare button on a product page to add phones here</p>
        <Link to="/AfterHomePage?page=PRODUCT" className="btn btn-dark mt-6">Browse products</Link>
      </div>
    );
  }

  const cheapestId = items.reduce((best, item) => (!best || effectivePrice(item) < effectivePrice(best) ? item : best), null)?.phone_id;
  const differs = (key) => new Set(items.map((item) => String(formatValue(item[key], key)))).size > 1;

  return (
    <div className="page-container pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[-0.01em]">Compare</h1>
          <p className="mt-1 text-sm text-ink-3">Rows where the phones differ are shown in full colour</p>
        </div>
        <button type="button" onClick={() => dispatch(clearCompare())} className="btn btn-ghost btn-sm">Clear all</button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36" />
              {items.map((item) => (
                <th key={item.phone_id} className="px-3 pb-4 text-left align-top font-normal">
                  <div className="relative rounded-xl border border-line bg-surface p-3">
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCompare({ productId: item.phone_id }))}
                      className="icon-btn absolute right-2 top-2 h-7 w-7"
                      aria-label={`Remove ${item.name}`}
                    >
                      <FiX size={14} strokeWidth={1.5} />
                    </button>
                    <Link to={`/product-detail?phone_id=${item.phone_id}&phone_name=${encodeURIComponent(item.name || "")}`} className="block">
                      <div className="aspect-square overflow-hidden rounded-lg bg-raised">
                        <ProductImage src={item.images} alt={item.name} className="h-full w-full p-4" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-ink">{item.name}</p>
                    </Link>
                    <Price
                      size="sm"
                      price={item.price_discount ?? item.price}
                      original={item.price_discount ? item.price : null}
                      className="mt-1"
                    />
                    {items.length > 1 && item.phone_id === cheapestId && <p className="mt-1 text-xs text-brand">Lowest price</p>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareFields.map(({ label, key }) => {
              const different = differs(key);
              return (
                <tr key={key} className="border-t border-line">
                  <th scope="row" className="py-3 pr-3 text-left font-normal text-ink-3">{label}</th>
                  {items.map((item) => (
                    <td key={item.phone_id} className={`px-3 py-3 ${different ? "text-ink" : "text-ink-3"}`}>
                      {formatValue(item[key], key)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
