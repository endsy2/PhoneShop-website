import UpdateProductVariants from "./UpdateProductVariant";
import UpdateSpec from "./UpdateSpec";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";

// Dialog that hosts the edit forms
const Model = ({ open, onClose, id, product_id, storage, title, initial }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="card flex max-h-[90vh] w-full max-w-2xl flex-col shadow-float" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-base font-medium">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <FiX size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {id === "updateVariants" ? (
            <UpdateProductVariants product_id={product_id} initial={initial} />
          ) : id === "updateSpec" ? (
            <UpdateSpec product_id={product_id} storage={storage} initial={initial} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Model;
