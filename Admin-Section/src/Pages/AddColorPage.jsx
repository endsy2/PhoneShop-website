import AddColor from "../Section/Product/AddColor";
import AddProductHeader from "../Section/Product/AddProductHeader";

const AddColorPage = () => (
  <div className="space-y-6">
    <AddProductHeader description="Another colour of an existing product, with its photos" />
    <AddColor />
  </div>
);

export default AddColorPage;
