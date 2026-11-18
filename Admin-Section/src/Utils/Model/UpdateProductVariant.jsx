import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { updateProductVariants } from "../../Fetch/FetchAPI";
import Notice from "../../Component/Notice";

// Rename a colour and replace its photos (the API swaps the whole photo set)
const UpdateProductVariants = ({ product_id, initial }) => {
    const [images, setImages] = useState([]);
    const [colors, setColors] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setColors(initial?.color || "");
    }, [initial]);

    const handleImageChange = (e) => setImages([...images, ...Array.from(e.target.files)]);
    const handleRemoveImage = (index) => setImages(images.filter((_, i) => i !== index));

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!images.length) {
            setError("Add the photos to keep for this colour. They replace the current ones");
            return;
        }
        try {
            const response = await updateProductVariants({ images, colors }, product_id);
            if (response?.status >= 200 && response?.status < 300) {
                window.location.reload();
            } else {
                setError("Couldn’t save the colour");
            }
        } catch {
            setError("Couldn’t save the colour");
        }
        setResult("");
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label htmlFor="variant-colour" className="label">Colour name</label>
                <input id="variant-colour" type="text" value={colors} onChange={(e) => setColors(e.target.value)} className="input" required />
            </div>
            <div>
                <label htmlFor="variant-photos" className="label">Photos <span className="font-normal text-ink-3">replace the current ones</span></label>
                <input
                    id="variant-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm text-ink-2 file:mr-3 file:h-9 file:rounded-lg file:border file:border-line-strong file:bg-surface file:px-3 file:text-sm file:text-ink hover:file:bg-raised"
                />
                {images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((image, index) => (
                            <div key={index} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line bg-raised">
                                <img src={URL.createObjectURL(image)} alt="" className="h-full w-full object-cover" />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-surface/90 text-ink-2 hover:text-danger" aria-label="Remove photo">
                                    <FiX size={12} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button type="submit" className="btn btn-dark">Save colour</button>
            <Notice>{result}</Notice>
            <Notice tone="error">{error}</Notice>
        </form>
    );
};

export default UpdateProductVariants;
