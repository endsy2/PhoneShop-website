import AddProductHeader from "../Section/Product/AddProductHeader";
import AddDetail from "../Section/Product/AddDetail";

const AddDetailPage = () => (
  <div className="space-y-6">
    <AddProductHeader description="Storage options, price and stock per colour" />
    <AddDetail />
  </div>
);

export default AddDetailPage;
