import { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { fetchOfferByID, hasAdminPermission, productByID, removeOffer, removeVariants } from "../Fetch/FetchAPI";
import ProductImage from "../Component/ProductImage";
import { formatDate, formatPrice } from "../Utils/display";
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
  const [index] = useState(0);
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

  const handleDeletePromotion = async ({ promo_id }) => {
    if (!window.confirm("End this promotion now? The product goes back to its normal price.")) return;
    try {

      await removeOffer({ deleteid: promo_id });
      window.location.reload();
    } catch (error) {
      console.error(error);
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

  const isPromotion = location.pathname === `/dashboard/offer/${param.id}`;
  const canEdit = hasAdminPermission("catalog:write");
  const chip = (active) =>
    `h-9 rounded-lg border px-3 text-sm transition-colors duration-150 ease-out ${
      active ? "border-ink bg-surface text-ink" : "border-line-strong bg-surface text-ink-2 hover:text-ink"
    }`;

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
        <FiArrowLeft size={14} strokeWidth={1.5} /> Back
      </button>

      {items.length > 0 && selectedItem ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div>
            <div className="card aspect-square overflow-hidden p-3">
              <div className="h-full w-full rounded-lg bg-raised">
                <ProductImage src={selectedImage} alt={selectedItem.name} className="h-full w-full p-8" />
              </div>
            </div>
            {arrayImage.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {arrayImage.map((image, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleImageClick(image)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-raised ${selectedImage === image ? "border-ink" : "border-line hover:border-line-strong"}`}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <ProductImage src={image} alt="" className="h-full w-full p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h1 className="text-2xl tracking-[-0.01em]">{selectedItem.name || selectedItem.phone_name}</h1>
            <p className="price mt-1 text-xs text-ink-3">
              Product {selectedItem.phone_id} · colour {selectedItem.idphone_variants} · spec {selectedItem.spec_id || "—"}
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-2 border-t border-line pt-5">
              <span className={`price text-[28px] leading-none ${selectedItem.price_discount ? "text-brand" : "text-ink"}`}>
                {formatPrice(selectedItem.price_discount || selectedItem.price)}
              </span>
              {selectedItem.price_discount && <span className="price text-sm text-ink-3 line-through">{formatPrice(selectedItem.price)}</span>}
              {isPromotion && selectedItem.end_date && <span className="ml-auto text-[13px] text-ink-3">Ends {formatDate(selectedItem.end_date)}</span>}
            </div>

            <div className="mt-5">
              <p className="label">Colour</p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button key={color} type="button" onClick={() => handleColorChange(color)} className={chip(selectedColor === color)}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="label">Storage</p>
              <div className="flex flex-wrap gap-2">
                {filteredItemsByColor.map((item) => (
                  <button key={`${item.idphone_variants}-${item.storage}`} type="button" onClick={() => handleStorageChange(item.storage, item)} className={chip(selectedStorage === item.storage)}>
                    {item.storage}
                  </button>
                ))}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 border-t border-line pt-4 text-sm">
              {[
                ["Processor", selectedItem.processor],
                ["RAM", selectedItem.ram],
                ["Battery", selectedItem.battery],
                ["Camera", selectedItem.camera],
                ["Screen", selectedItem.screen_size],
                ["Released", formatDate(selectedItem.release_date)],
                ["Stock", selectedItem.spec_stock ?? selectedItem.stock],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-line py-2">
                  <dt className="text-ink-3">{label}</dt>
                  <dd className="text-right text-ink">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>

            {canEdit && !isPromotion && (
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={() => setOpenSpec(true)} className="btn btn-dark">
                  <FiEdit2 size={14} strokeWidth={1.5} /> Edit spec
                </button>
                <button type="button" onClick={() => setOpenColor(true)} className="btn btn-secondary">
                  <FiEdit2 size={14} strokeWidth={1.5} /> Edit colour
                </button>
                <button type="button" onClick={() => handleDelete(selectedItem.idphone_variants)} className="btn btn-danger ml-auto">
                  <FiTrash2 size={14} strokeWidth={1.5} /> Delete colour
                </button>
              </div>
            )}
            {isPromotion && hasAdminPermission("promotion:write") && (
              <div className="mt-6">
                <button type="button" onClick={() => handleDeletePromotion({ promo_id: selectedItem.promo_id })} className="btn btn-danger">
                  <FiTrash2 size={14} strokeWidth={1.5} /> End promotion
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-ink-3">Loading product</p>
      )}

      <Model open={openColor} onClose={() => setOpenColor(false)} id="updateVariants" product_id={selectedItem?.idphone_variants || null} initial={selectedItem} title="Edit colour" />
      <Model open={openSpec} onClose={() => setOpenSpec(false)} id="updateSpec" product_id={selectedSpec.idphone_variants} storage={selectedSpec.storage} initial={selectedItem} title={`Edit ${selectedSpec.storage || "spec"}`} />
    </div>
  );
};

export default Offer;
