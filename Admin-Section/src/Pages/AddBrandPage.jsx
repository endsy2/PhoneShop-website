import AddProductHeader from "../Section/Product/AddProductHeader";
import AddBrand from "../Section/Product/AddBrand";

const AddBrandPage = () => (
  <div className="space-y-6">
    <AddProductHeader description="Brands group products on the storefront" />
    <AddBrand />
  </div>
);

export default AddBrandPage;
