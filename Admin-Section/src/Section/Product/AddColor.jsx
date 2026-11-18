import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { addNewColorFetch, productData } from '../../Fetch/FetchAPI';
import Notice from '../../Component/Notice';

const AddColor = () => {
    const [color, setColor] = useState('');
    const [productName, setProductName] = useState('');
    const [stock, setStock] = useState('');
    const [images, setImages] = useState([]);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [productOptions, setProductOptions] = useState([]);
    const fileRef = useRef();

    useEffect(() => {
        const loadProductOptions = async () => {
            try {
                const response = await productData();
                const rows = response?.data?.data || response?.data || [];
                const uniqueProductNames = [...new Set(rows.map((item) => item.name).filter(Boolean))];
                setProductOptions(uniqueProductNames);
            } catch (err) {
              console.error(err);
            }
        };

        loadProductOptions();
    }, []);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to Array
        setImages([...images, ...files]); // Append new files to the existing ones
    };

    const handleRemoveImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const validateForm = () => {
        if (!productName.trim()) {
            setError('Choose a product');
            return false;
        }
        if (!color) {
            setError('Enter the colour name');
            return false;
        }
        if (!images.length) {
            setError('Add at least one photo');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = {
            color,
            productName,
            stock: stock || 0, // Default stock to 0 if empty
            images,
        };

        try {
            const response = await addNewColorFetch(formData);
            if (response?.status >= 200 && response?.status < 300) {
                handleClear();
                setResult(`Added ${color} to ${productName}`);
            } else {
                setError('Couldn\u2019t add the colour');
                setResult('');
            }
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || 'Couldn\u2019t add the colour';
            setError(msg);
            setResult('');
        }
    };

    const handleClear = () => {
        setColor('');
        setProductName('');
        setStock('');
        setImages([]);
        if (fileRef.current) fileRef.current.value = '';
        setError('');
        setResult('');
    };

    return (
        <form onSubmit={handleSubmit} onReset={handleClear} className="card max-w-2xl space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="product" className="label">Product</label>
                    <select id="product" value={productName} onChange={(e) => setProductName(e.target.value)} className="input" required>
                        <option value="" disabled>Choose a product</option>
                        {productOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="colour" className="label">Colour name</label>
                    <input id="colour" type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Blue" className="input" required />
                </div>
                <div>
                    <label htmlFor="stock" className="label">Stock <span className="font-normal text-ink-3">optional</span></label>
                    <input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input price" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="photos" className="label">Photos</label>
                    <input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileRef}
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
            </div>
            <p className="text-[13px] text-ink-3">Add storage options and prices for this colour on the Specs tab</p>
            <div className="flex gap-2">
                <button type="submit" className="btn btn-dark">Add colour</button>
                <button type="reset" className="btn btn-ghost">Clear</button>
            </div>
            <Notice>{result}</Notice>
            <Notice tone="error">{error}</Notice>
        </form>
    );
};

export default AddColor;
