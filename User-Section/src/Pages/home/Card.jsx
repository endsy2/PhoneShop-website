import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductImage from "../../Components/ProductImage";

// A brand (logo + name) or a category (name) tile linking to the filtered product list.
const Card = ({ data, page = "Default Page" }) => {
  if (!data) return null;

  if (page === "Categories") {
    return (
      <Link
        to={`/Sort?category=${encodeURIComponent(data.category_name)}`}
        className="flex h-14 items-center justify-between rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors duration-150 ease-out hover:border-line-strong"
      >
        {data.category_name}
        <FiArrowRight size={16} strokeWidth={1.5} className="text-ink-3" />
      </Link>
    );
  }

  return (
    <Link
      to={`/Sort?brand=${encodeURIComponent(data.brand_name)}`}
      className="flex h-16 items-center gap-3 rounded-lg border border-line bg-surface px-3 transition-colors duration-150 ease-out hover:border-line-strong"
    >
      <ProductImage src={data.img} alt="" className="h-10 w-10 rounded-md" />
      <span className="truncate text-sm text-ink">{data.brand_name}</span>
    </Link>
  );
};

export default Card;
