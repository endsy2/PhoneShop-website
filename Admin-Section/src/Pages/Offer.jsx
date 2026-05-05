import { useState, useEffect, useCallback } from "react";
import { fetchOfferByID, productByID, removeOffer, removeSpec, removeVariants } from "../Fetch/FetchAPI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Model from "../Utils/Model/Model";

const Offer = () => {
  const [items, setItems] = useState([]);
  const [arrayImage, setArrayImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [openColor, setOpenColor] = useState(false);
  const [openSpec, setOpenSpec] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [index, setIndex] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState({ idphone_variants: null, storage: null });
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("phone_name");
  const navigate = useNavigate();
  const location = useLocation();
  const param = useParams();

  const fetchData = useCallback(async () => {
    try {
      let response;
      if (location.pathname === `/dashboard/offer/${param.id}`) {
        // Fetch data for offer page
        response = await fetchOfferByID(param);
      } else {
        // Fetch data for product page
        response = await productByID(query);
      }

      if (!response || !response.data || response.data.length === 0) {
        console.error("No data received or something went wrong");
        return;
      }

      const productData = response.data;
      setItems(productData);

      // Initialize images and colors
      const images = productData[index]?.images
        ?.split(",")
        .map((image) => image.trim().replaceAll("uploads\\", "").replace(/\s+/g, ""));
      setArrayImage(images || []);
      setSelectedImage(images?.[0] || "");
      setSelectedColor(productData[index]?.color || null);
      setSelectedStorage(productData[index]?.storage || null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [query, index, location.pathname, param]);

  const handleDelete = async (deleteId) => {
    try {
      await removeVariants({ deleteid: deleteId });
      setItems((prevItems) => prevItems.filter((item) => item.idphone_variants !== deleteId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteSpec = async (variant_id, storage) => {
    try {
      await removeSpec(variant_id, storage);
      window.location.reload(); // Reload page after deleting
    } catch (error) {
      console.log("Error deleting spec:", error);
    }
  };
  const handleDeletePromotion = async ({ promo_id }) => {
    try {
      // console.log(promo_id);

      await removeOffer({ deleteid: promo_id });
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstItemWithColor = items.find((item) => item.color === color);

    // Update storage and images based on color selection
    setSelectedStorage(firstItemWithColor?.storage || null);
    const images = firstItemWithColor?.images
      ?.split(",")
      .map((image) => image.trim().replaceAll("uploads\\", "").replace(/\s+/g, ""));
    setArrayImage(images || []);
    setSelectedImage(images?.[0] || "");
  };

  const handleStorageChange = (storage, spec) => {
    setSelectedStorage(storage);
    setSelectedSpec({ idphone_variants: spec.idphone_variants, storage: spec.storage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (items.length > 0) {
      const defaultItem = items[0];
      setSelectedSpec({
        idphone_variants: defaultItem.idphone_variants,
        storage: defaultItem.storage,
      });
    }
  }, [items]);

  const uniqueColors = Array.from(new Set(items.map((item) => item.color)));
  const filteredItemsByColor = items.filter((item) => item.color === selectedColor);
  const selectedItem =
    filteredItemsByColor.find((item) => item.storage === selectedStorage) || items[index];

  return (
    <div className="container mx-auto bg-white rounded-lg shadow-lg max-w-7xl mt-10 p-8">
      {items.length > 0 && selectedItem ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            {selectedImage && (
              <img
                src={`http://localhost:3000/${selectedImage}`}
                alt="Product"
                className="w-full h-96 object-contain rounded-lg shadow-md transition-transform transform hover:scale-105"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
              />
            )}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {arrayImage.map((image, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:3000/${image}`}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer ${selectedImage === image ? "ring-2 ring-green-500" : ""
                    }`}
                  onClick={() => handleImageClick(image)}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No+Image"; }}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-800">{selectedItem.phone_name}</h1>
            <p className="text-gray-600">
              <strong>Product Code:</strong> {selectedItem.phone_id}
            </p>
            <p className="text-gray-600">
              <strong>Product Code:</strong> {selectedItem.name}
            </p>
            <p className="text-gray-600 flex gap-x-3">
              <strong>Price:</strong> {selectedItem.price_discount !== null ? (
                <s>{selectedItem.price}</s>
              ) : (
                <p>{selectedItem.price}</p>
              )}
              {selectedItem.price_discount && <p className="font-bold">{selectedItem.price_discount}</p>}
            </p>

            {/* Colors */}
            <div>
              <p className="text-gray-600 mb-4"><strong>Colors ID: {selectedItem.idphone_variants}</strong></p>
              <p className="text-gray-600 mb-2"><strong>Colors:</strong></p>
              <div className="flex gap-3">
                {uniqueColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full cursor-pointer border ${selectedColor === color ? "ring-2 ring-green-500" : "border-gray-300"
                      }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>

            {/* Storage Options */}
            <div>
              <p className="text-gray-600 mb-2"><strong>Storage Options:</strong></p>
              <div className="flex gap-3">
                {filteredItemsByColor.map((item, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded-lg ${selectedStorage === item.storage
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800"
                      }`}
                    onClick={() => handleStorageChange(item.storage, item)} // Passing the correct item
                  >
                    {item.storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-700 mb-3">Specifications</h2>
              <p><strong>Spec ID:</strong> {selectedItem.spec_id || "N/A"}</p>
              <p><strong>Processor:</strong> {selectedItem.processor || "N/A"}</p>
              <p><strong>RAM:</strong> {selectedItem.ram || "N/A"}</p>
              <p><strong>Battery:</strong> {selectedItem.battery || "N/A"}</p>
              <p><strong>Camera:</strong> {selectedItem.camera || "N/A"}</p>
              <p><strong>Screen Size:</strong> {selectedItem.screen_size || "N/A"}</p>
              <p><strong>Release Date:</strong> {formatDate(selectedItem.release_date)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 ${location.pathname === `/dashboard/offer/${param.id}` && "hidden"}`}
                onClick={() => setOpenColor(true)}
              >
                Update Color
              </button>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 ${location.pathname === `/dashboard/offer/${param.id}` && "hidden"}`}
                onClick={() => setOpenSpec(true)}
              >
                Update Spec
              </button>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 ${location.pathname === `/dashboard/offer/${param.id}` && "hidden"}`}
                onClick={() => handleDelete(selectedItem.idphone_variants)}
              >
                Delete Color
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
                onClick={
                  location.pathname === `/dashboard/offer/${param.id}` ? () => handleDeletePromotion({ promo_id: selectedItem.promo_id }) :
                    () => handleDeleteSpec(selectedSpec.idphone_variants, selectedSpec.storage)

                }
              >
                {location.pathname === `/dashboard/offer/${param.id}` ? 'Delete Promotion' : 'Delete Spec'}
              </button>

            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available</div>
      )
      }

      {/* Modal */}
      <Model
        open={openColor}
        onClose={() => setOpenColor(false)}
        id="updateVariants"
        product_id={selectedItem?.idphone_variants || null}
      />
      <Model
        open={openSpec}
        onClose={() => setOpenSpec(false)}
        id="updateSpec"
        product_id={selectedSpec.idphone_variants} // Correctly pass idphone_variants
        storage={selectedSpec.storage} // Correctly pass storage
      />
    </div >
  );
};

export default Offer;
