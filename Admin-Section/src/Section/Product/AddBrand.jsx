import { useEffect, useState, useRef } from "react";
import { FiX } from "react-icons/fi";
import { addNewBrandAPI, brandFetch, deleteBrandAPI } from "../../Fetch/FetchAPI";
import Notice from "../../Component/Notice";
import ProductImage from "../../Component/ProductImage";

const AddBrand = () => {
  const [brand, setBrand] = useState('');
  const [img, setImg] = useState(null);  // Initially null, no image selected
  const fileInputRef = useRef(null); // Create a ref for the file input
  const [error, setError] = useState('')
  const [result, setResult] = useState('')  // Handle form submission
  const [brandList, setBrandList] = useState([]);

  const loadBrands = async () => {
    try {
      const data = await brandFetch();
      setBrandList(data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the image is selected
    if (!img) {
      setError("Choose a logo image");
      return;
    }

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("images", img);  // Only append the first selected file

    try {
      const result = await addNewBrandAPI(formData); // Send the formData containing the image

      // After successful submission, reset the state and input fields
      setImg(null);  // Reset img state
      setBrand('');  // Reset brand input
      fileInputRef.current.value = '';  // Manually reset the file input value
      if (result?.status >= 200 && result?.status < 300) {
        setResult(`Added ${brand}`)
        setError('')
        loadBrands();
      }
      // Handle success response here (e.g., show success message, clear fields)
    } catch {
      setResult('')
      setError('Couldn\u2019t add the brand. It may already exist')
      // Handle error response here
    }
  };

  // Reset the form
  const handleReset = (e) => {
    e.preventDefault();
    setBrand('');
    setImg(null);  // Reset image input to null
    fileInputRef.current.value = '';  // Manually reset the file input value
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];  // Get the first file
    if (file) {
      setImg(file);  // Set the selected image
    }
  };

  const handleDeleteBrand = async (brandName) => {
    if (!window.confirm(`Remove the brand ${brandName}?`)) return;
    try {
      await deleteBrandAPI(brandName);
      setResult(`Removed ${brandName}`);
      setError("");
      loadBrands();
    } catch (err) {
      setResult("");
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} onReset={handleReset} className="card space-y-4 p-6">
        <h2 className="text-base font-medium">New brand</h2>
        <div>
          <label htmlFor="brand" className="label">Name</label>
          <input id="brand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="input" required />
        </div>
        <div>
          <label htmlFor="logo" className="label">Logo</label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="block w-full text-sm text-ink-2 file:mr-3 file:h-9 file:rounded-lg file:border file:border-line-strong file:bg-surface file:px-3 file:text-sm file:text-ink hover:file:bg-raised"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-dark">Add brand</button>
          <button type="reset" className="btn btn-ghost">Clear</button>
        </div>
        <Notice>{result}</Notice>
        <Notice tone="error">{error}</Notice>
      </form>

      <section className="card">
        <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-medium">Brands</h2>
          <span className="price text-[13px] text-ink-3">{brandList.length}</span>
        </div>
        {brandList.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-3">No brands yet</p>
        ) : (
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {brandList.map((item) => (
              <li key={item.brand_name} className="flex h-12 items-center justify-between gap-3 px-5 text-sm">
                <span className="flex items-center gap-3">
                  <span className="h-8 w-8 overflow-hidden rounded-md bg-raised">
                    <ProductImage src={item.img} alt="" className="h-full w-full p-1" />
                  </span>
                  {item.brand_name}
                </span>
                <button type="button" onClick={() => handleDeleteBrand(item.brand_name)} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${item.brand_name}`}>
                  <FiX size={14} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AddBrand;
