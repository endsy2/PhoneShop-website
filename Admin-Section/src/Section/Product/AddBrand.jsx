import { useEffect, useState, useRef } from "react";
import { addNewBrandAPI, brandFetch, deleteBrandAPI } from "../../Fetch/FetchAPI";

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
      console.log(err);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the image is selected
    if (!img) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("images", img);  // Only append the first selected file

    try {
      const result = await addNewBrandAPI(formData); // Send the formData containing the image
      console.log(result);

      // After successful submission, reset the state and input fields
      setImg(null);  // Reset img state
      setBrand('');  // Reset brand input
      fileInputRef.current.value = '';  // Manually reset the file input value
      if (result?.status >= 200 && result?.status < 300) {
        setResult("Add Success")
        setError('')
        loadBrands();
      }
      // Handle success response here (e.g., show success message, clear fields)
    } catch (error) {
      console.log(error);
      setResult('')
      setError('Something went wrong')
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
    try {
      await deleteBrandAPI(brandName);
      setResult("Delete Success");
      setError("");
      loadBrands();
    } catch (err) {
      setResult("");
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-white border-gray-300 border p-8 rounded-lg w-full max-w-4xl mx-auto mt-12 shadow-lg">
      <h1 className="text-center text-3xl text-primary font-bold mb-8">
        Add New Brand
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-6"
      >
        {/* Brand */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Brand</label>
          <input
            type="text"
            name="brand"
            placeholder="Enter brand name"
            className="input-style"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>

        {/* Picture */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Picture</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}  // Set the ref on the input
            onChange={handleImageChange}  // Update the image handler
            className="h-10 w-full rounded-lg border text-primary p-1"
            required
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}  // Simplified reset
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </form>
      <div className="mt-16">
        {error && <p className="text-red-500">{error}</p>}
        {result && <p className="text-primary">{result}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-primary mb-3">Brand List</h2>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {brandList.length === 0 ? (
            <p className="p-4 text-gray-500">No brands found.</p>
          ) : (
            brandList.map((item) => (
              <div key={item.brand_name} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-800">{item.brand_name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteBrand(item.brand_name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBrand;
