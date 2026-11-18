import { NavLink } from "react-router-dom";
import PageHeader from "../../Component/PageHeader";

const TABS = [
  { label: "Product", to: "/dashboard/addProduct" },
  { label: "Colour", to: "/dashboard/addColor" },
  { label: "Specs", to: "/dashboard/addDetail" },
  { label: "Brand", to: "/dashboard/addBrand" },
  { label: "Category", to: "/dashboard/addCategory" },
];

// Title and tabs shared by the add-to-catalogue pages
const AddProductHeader = ({ description }) => (
  <div>
    <PageHeader title="Add to catalogue" description={description} />
    <nav className="mt-5 flex gap-6 border-b border-line" aria-label="Catalogue">
      {TABS.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `-mb-px border-b py-2.5 text-sm transition-colors duration-150 ease-out ${
              isActive ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default AddProductHeader;
