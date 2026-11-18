import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-3">
    <Link to="/" className="hover:text-ink">Home</Link>
    {items.map((item, index) => (
      <Fragment key={index}>
        <FiChevronRight size={12} strokeWidth={1.5} />
        {item.link && index < items.length - 1 ? (
          <Link to={item.link} className="hover:text-ink">{item.label}</Link>
        ) : (
          <span className="text-ink-2">{item.label}</span>
        )}
      </Fragment>
    ))}
  </nav>
);

export default Breadcrumb;
