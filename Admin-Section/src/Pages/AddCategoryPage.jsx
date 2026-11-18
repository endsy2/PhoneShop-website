import AddProductHeader from "../Section/Product/AddProductHeader";
import AddCategory from "../Section/Product/AddCategory";

const AddCategoryPage = () => (
  <div className="space-y-6">
    <AddProductHeader description="Categories like Smartphones, Smartwatches, Accessories" />
    <AddCategory />
  </div>
);

export default AddCategoryPage;
