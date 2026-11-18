import AddProduct from "../Section/Product/AddProduct";
import AddProductHeader from "../Section/Product/AddProductHeader";

const AddProductPage = () => (
  <div className="space-y-6">
    <AddProductHeader description="A new phone with its first colour and spec" />
    <AddProduct />
  </div>
);

export default AddProductPage;
