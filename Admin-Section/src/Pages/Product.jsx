import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../Component/PageHeader";
import ProductCaterogy from "../Section/Product-Conponent/ProductCaterogy";
import ProductNumber from "../Section/Product-Conponent/ProductNumber";
import { hasAdminPermission } from "../Fetch/FetchAPI";

const Product = () => (
  <div className="space-y-6">
    <PageHeader title="Products" description="Catalogue and stock by category">
      {hasAdminPermission("catalog:write") && (
        <Link to="/dashboard/addProduct" className="btn btn-dark">
          <FiPlus size={16} strokeWidth={1.5} />
          Add product
        </Link>
      )}
    </PageHeader>
    <ProductNumber />
    <ProductCaterogy />
  </div>
);

export default Product;
