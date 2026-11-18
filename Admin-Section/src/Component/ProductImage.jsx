import { useState } from "react";
import { FiSmartphone } from "react-icons/fi";
import { imageUrl } from "../Utils/display";

// Product photo on a calm surface; a quiet phone glyph when the image is missing or fails.
const ProductImage = ({ src, alt = "", className = "" }) => {
  const url = imageUrl(src);
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className={`flex items-center justify-center bg-raised text-ink-3 ${className}`} aria-label={alt}>
        <FiSmartphone size={18} strokeWidth={1.5} />
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-contain ${className}`} />;
};

export default ProductImage;
