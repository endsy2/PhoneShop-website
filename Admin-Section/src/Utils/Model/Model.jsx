import Product from "../../Pages/Product";
import UpdateOrder from "../../Section/Order/UpdateOrder";
import AddProduct from "../../Section/Product/AddProduct";
import UpdateProductVariants from "./UpdateProductVariant";
import UpdateSpec from "./UpdateSpec";

const Model = ({ open, onClose, id, product_id, value, storage }) => {
  const handleClose = (e) => {
    if (e.target.id === "wrapper") onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex justify-center items-center"
      id="wrapper"
      onClick={handleClose}
    >
      <div
        className="w-[1400px] max-h-[90vh] bg-white p-6 rounded-lg shadow-lg overflow-y-auto"
        style={{ maxHeight: "90vh" }} // Optional inline styling
      >
        <button
          className="text-primary text-2xl place-self-end"
          onClick={onClose}
        >
          X
        </button>
        {id === "addProduct" ? (
          <AddProduct product_id={product_id} />
        ) : id === "updateOrder" ? (
          <UpdateOrder order_items_id={value} />
        ) : id === "updateVariants" ? (<UpdateProductVariants product_id={product_id} />
        ) : id === 'updateSpec' ? (<UpdateSpec product_id={product_id} storage={storage} />)
          : null}
      </div>
    </div>
  );
};

export default Model;
