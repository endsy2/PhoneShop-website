import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { addNewProductAPI, brandFetch, categoryFetch, productData } from "../../Fetch/FetchAPI";
import Notice from "../../Component/Notice";

// Defined outside the form so inputs keep focus between renders
const Field = ({ label, hint, children, className = "" }) => (
  <div className={className}>
    <label className="label">
      {label} {hint && <span className="font-normal text-ink-3">{hint}</span>}
    </label>
    {children}
  </div>
);

const Group = ({ title, description, children }) => (
  <section className="grid gap-6 border-t border-line py-6 first:border-t-0 first:pt-0 md:grid-cols-[220px_1fr]">
    <div>
      <h2 className="text-sm font-medium">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-ink-3">{description}</p>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const AddProduct = ({ product_id }) => {
  const fileRef = useRef();
  const [id, setID] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [processor, setProcessor] = useState('');
  const [storage, setStorage] = useState('');
  const [camera, setCamera] = useState('');
  const [category, setCategory] = useState('');
  const [colors, setColors] = useState("");
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [ram, setRam] = useState('');
  const [battery, setBattery] = useState('');
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    setID(product_id)
  }, [product_id])

  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const categoryResult = await categoryFetch();
        const fetchedCategories = categoryResult?.data || [];
        setCategoryList(fetchedCategories);

        const brandResult = await brandFetch();
        const fetchedBrands = brandResult?.data || [];

        // Fallback to derive brands from products if brand endpoint has no data.
        if (fetchedBrands.length > 0) {
          setBrandList(fetchedBrands);
        } else {
          const productsResponse = await productData();
          const products = productsResponse?.data?.data || productsResponse?.data || [];
          const uniqueBrands = [...new Set(products.map((item) => item.brand).filter(Boolean))].map((name) => ({ brand_name: name }));
          setBrandList(uniqueBrands);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadSelectOptions();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formdata = {
      name,
      brand,
      images,
      price,
      date,
      processor,
      storage,
      camera,
      category,
      colors,
      description,
      stock,
      screenSize,
      ram,
      battery,
    }
    try {
      const result = await addNewProductAPI(formdata, id);
      if (result?.status >= 200 && result?.status < 300) {
        setResult(`Added ${name}. Add more colours or storage options from the tabs above`)
        setError('')
        handleClear();
      } else {
        setError("Couldn\u2019t add the product")
        setResult('')
      }
    } catch (error) {
      // Show the actual server error message (e.g. "product already exists")
      const serverMessage = error?.response?.data?.message || error?.message || "Couldn\u2019t add the product";
      setError(serverMessage)
      setResult('')
    }
  };

  const handleClear = () => {

    setName('');
    setBrand('');
    setImages([]);
    setPrice('');
    setDate('');
    setProcessor('');
    setStorage('');
    setCamera('');
    setColors('');
    setDescription('');
    setStock('');
    setScreenSize('');
    setRam('');
    setBattery('');
    setCategory('');
  }
  const text = (value, setter, props = {}) => (
    <input type="text" value={value} onChange={(e) => setter(e.target.value)} className="input" required {...props} />
  );

  return (
    <form onSubmit={handleSubmit} onReset={handleClear} className="card p-6">
      <Group title="Basics" description="Shown on the product page">
        <Field label="Product name">{text(name, setName)}</Field>
        <Field label="Release date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
        </Field>
        <Field label="Brand">
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input" required>
            <option value="" disabled>Choose a brand</option>
            {brandList.map((item, index) => (
              <option key={item.brand_name || index} value={item.brand_name || ""}>{item.brand_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" required>
            <option value="" disabled>Choose a category</option>
            {categoryList.map((item, index) => (
              <option key={item.category_name || index} value={item.category_name || ""}>{item.category_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input h-auto resize-y py-2" required />
        </Field>
      </Group>

      <Group title="First colour" description="More colours can be added later">
        <Field label="Colour name">{text(colors, setColors, { placeholder: "Black" })}</Field>
        <Field label="Photos">
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileRef}
            onChange={handleImageChange}
            className="block w-full text-sm text-ink-2 file:mr-3 file:h-9 file:rounded-lg file:border file:border-line-strong file:bg-surface file:px-3 file:text-sm file:text-ink hover:file:bg-raised"
          />
        </Field>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:col-span-2">
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
      </Group>

      <Group title="First spec" description="Storage, price and stock for this colour">
        <Field label="Storage">{text(storage, setStorage, { placeholder: "128GB" })}</Field>
        <Field label="RAM">{text(ram, setRam, { placeholder: "8GB" })}</Field>
        <Field label="Price" hint="USD">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className="input price" required />
        </Field>
        <Field label="Stock">
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0" className="input price" required />
        </Field>
      </Group>

      <Group title="Hardware" description="The same for every colour and storage option">
        <Field label="Screen">{text(screenSize, setScreenSize, { placeholder: "6.1 inch" })}</Field>
        <Field label="Processor">{text(processor, setProcessor)}</Field>
        <Field label="Battery">{text(battery, setBattery, { placeholder: "4000mAh" })}</Field>
        <Field label="Camera">{text(camera, setCamera, { placeholder: "48MP" })}</Field>
      </Group>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="submit" className="btn btn-dark">Add product</button>
        <button type="reset" className="btn btn-ghost">Clear</button>
      </div>
      <div className="mt-4 space-y-2">
        <Notice>{result}</Notice>
        <Notice tone="error">{error}</Notice>
      </div>
    </form>
  );
};

export default AddProduct;
