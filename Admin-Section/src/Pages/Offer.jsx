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
    if (!window.confirm("Delete this color variant and all its images? This cannot be undone.")) return;
    try {
      await removeVariants({ deleteid: deleteId });
      const remaining = items.filter((item) => item.idphone_variants !== deleteId);
      setItems(remaining);
      // Reset selection to first remaining item
      if (remaining.length > 0) {
        const first = remaining[0];
        setSelectedColor(first.color);
        setSelectedStorage(first.storage);
        setSelectedSpec({ idphone_variants: first.idphone_variants, storage: first.storage });
        const images = first.images?.split(",").map((img) => img.trim().replaceAll("uploads\\", "").replace(/\s+/g, ""));
        setArrayImage(images || []);
        setSelectedImage(images?.[0] || "");
      } else {
        navigate(-1); // no variants left, go back
      }
    } catch (error) {
      alert("Failed to delete color: " + (error?.response?.data?.message || error.message));
    }
  };

  const handleDeleteSpec = async (variant_id, storage) => {
    if (!variant_id || !storage) {
      alert("Please select a storage option first.");
      return;
    }
    if (!window.confirm(`Delete spec "${storage}" for this color? This cannot be undone.`)) return;
    try {
      await removeSpec(variant_id, storage);
      // Remove deleted spec from items and update selection
      const remaining = items.filter(
        (item) => !(item.idphone_variants === variant_id && item.storage === storage)
      );
      setItems(remaining);
      if (remaining.length > 0) {
        const first = remaining[0];
        setSelectedColor(first.color);
        setSelectedStorage(first.storage);
        setSelectedSpec({ idphone_variants: first.idphone_variants, storage: first.storage });
      }
    } catch (error) {
      alert("Failed to delete spec: " + (error?.response?.data?.message || error.message));
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

  const handleStorageChange = (storage, spec) => {
    setSelectedStorage(storage);
    setSelectedSpec({ idphone_variants: spec.idphone_variants, storage: spec.storage });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstItemWithColor = items.find((item) => item.color === color);
    if (!firstItemWithColor) return;
    setSelectedStorage(firstItemWithColor.storage);
    setSelectedSpec({
      idphone_variants: firstItemWithColor.idphone_variants,
      storage: firstItemWithColor.storage,
    });
    const images = firstItemWithColor.images
      ?.split(",")
      .map((image) => image.trim().replaceAll("uploads\\", "").replace(/\s+/g, ""));
    setArrayImage(images || []);
    setSelectedImage(images?.[0] || "");
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
      setSelectedColor(defaultItem.color);
      setSelectedStorage(defaultItem.storage);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-green-600 font-semibold transition-colors"
        >
          <span className="text-xl">←</span> Back
        </button>
        {items.length > 0 && selectedItem ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* ── Left: Image Gallery ── */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col items-center gap-4">
                <div className="w-full aspect-square max-w-sm bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                  <img
                    src={`http://localhost:3000/${selectedImage}`}
                    alt="Product"
                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {arrayImage.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageClick(image)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === image ? "border-green-500 shadow-md scale-105" : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <img
                        src={`http://localhost:3000/${image}`}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No+Image"; }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Right: Product Details ── */}
              <div className="p-8 flex flex-col gap-5">

                {/* Title & IDs */}
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{selectedItem.name || selectedItem.phone_name}</h1>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>ID: <span className="font-semibold text-gray-700">{selectedItem.phone_id}</span></span>
                    <span>Variant ID: <span className="font-semibold text-gray-700">{selectedItem.idphone_variants}</span></span>
                    <span>Spec ID: <span className="font-semibold text-gray-700">{selectedItem.spec_id || "N/A"}</span></span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-500">Price</span>
                  {selectedItem.price_discount ? (
                    <>
                      <span className="text-2xl font-extrabold text-green-600">${selectedItem.price_discount}</span>
                      <span className="text-base text-gray-400 line-through">${selectedItem.price}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-extrabold text-green-600">${selectedItem.price}</span>
                  )}
                </div>

                {/* Colors */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Color</p>
                  <div className="flex gap-2">
                    {uniqueColors.map((color, idx) => (
                      <button
                        key={idx}
                        title={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color ? "border-green-500 scale-110 shadow-md" : "border-gray-300 hover:border-green-400"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Storage</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredItemsByColor.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStorageChange(item.storage, item)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          selectedStorage === item.storage
                            ? "bg-green-600 text-white border-green-600 shadow"
                            : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {item.storage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Specifications</h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    {[
                      ["Processor", selectedItem.processor],
                      ["RAM", selectedItem.ram],
                      ["Battery", selectedItem.battery],
                      ["Camera", selectedItem.camera],
                      ["Screen Size", selectedItem.screen_size],
                      ["Release Date", formatDate(selectedItem.release_date)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-1">
                        <span className="font-semibold text-gray-600">{label}:</span>
                        <span className="text-gray-800">{value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex gap-3 pt-2 ${location.pathname === `/dashboard/offer/${param.id}` ? "" : ""}`}>
                  {location.pathname !== `/dashboard/offer/${param.id}` && (
                    <>
                      <button
                        onClick={() => setOpenSpec(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition shadow"
                      >
                        ✏️ Update Spec
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.idphone_variants)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition shadow"
                      >
                        🗑️ Delete Color
                      </button>
                    </>
                  )}
                  {location.pathname === `/dashboard/offer/${param.id}` && (
                    <button
                      onClick={() => handleDeletePromotion({ promo_id: selectedItem.promo_id })}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition shadow"
                    >
                      🗑️ Delete Promotion
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow text-gray-400 text-lg">
            No product data available
          </div>
        )}
      </div>

      {/* Modals */}
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
        product_id={selectedSpec.idphone_variants}
        storage={selectedSpec.storage}
      />
    </div>
  );
};

export default Offer;
