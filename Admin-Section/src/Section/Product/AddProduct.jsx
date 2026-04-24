import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { addNewProductAPI, brandFetch, categoryFetch, productData } from "../../Fetch/FetchAPI";


const AddProduct = ({ product_id }) => {
  const location = useLocation();
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
  const [colors, setColors] = useState("#000000"); // Default to one color
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
        console.log(err);
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
        setResult("Add New Product Success")
        setError('')
      } else {
        setError("Something Went Wrong")
        setResult('')
      }
      // console.log(formdata.colors);

      // console.log(formdata.images);

      handleClear(); // Clear form after successful submission
      console.log(result);
    } catch (error) {
      setError("Something Went Wrong")
      setResult('')
      console.log(error);
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
    setColors('#000000');
    setDescription('');
    setStock('');
    setScreenSize('');
    setRam('');
    setBattery('');
    setCategory('');
  }
  return (
    <div className="bg-white border-gray-300 border p-12 rounded-lg w-full max-w-9xl mx-auto mt-12 shadow-lg">
      <h1 className="text-center text-3xl text-primary font-bold mb-8">Add Product</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:items-center gap-10 "
      >
        {/* Product Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            placeholder="Enter product name"
            className="input-style"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Category
          </label>
          <select
            name="name_category"
            value={category}
            className="input-style"
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Select category</option>
            {categoryList.map((item, index) => (
              <option
                key={item.category_name || item.category || index}
                value={item.category_name || item.category || ""}
              >
                {item.category_name || item.category}
              </option>
            ))}
          </select>
        </div>

        {/* image */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Product Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple // This allows multiple files selection
            ref={fileRef}
            onChange={handleImageChange}
            className="h-10 w-full rounded-lg border border-gray-300 p-1 mb-2"
          />
          <div className="flex flex-wrap gap-4 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product Image ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 text-red-600"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Colors Section */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Colors</label>
          <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg shadow-md">

            <div className="flex items-center gap-6">
              {/* Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Color </span>
                <input
                  type="color"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="h-6 w-28 rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>


        {/* brand */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Brand</label>
          <select
            name="name_brand"
            value={brand}
            className="input-style"
            onChange={((e) => setBrand(e.target.value))}
            required
          >
            <option value="" disabled>Select brand</option>
            {brandList.map((item, index) => (
              <option
                key={item.brand_name || item.brand || index}
                value={item.brand_name || item.brand || ""}
              >
                {item.brand_name || item.brand}
              </option>
            ))}
          </select>
        </div>


        {/* Description */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter product description"
            className="input-style h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Price</label>
          <input
            type="number"
            name="price"
            placeholder="Enter product price"
            value={price}
            className="input-style"
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Enter product stock quantity"
            className="input-style"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>

        {/* Release Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Release Date
          </label>
          <input
            type="date"
            name="release_date"
            value={date}
            className="input-style"
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Screen Size */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Screen Size
          </label>
          <input
            type="text"
            name="screen_size"
            value={screenSize}
            placeholder="Enter screen size"
            className="input-style"
            onChange={(e) => setScreenSize(e.target.value)}
            required
          />
        </div>

        {/* Processor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Processor
          </label>
          <input
            type="text"
            name="processor"
            value={processor}
            placeholder="Enter processor details"
            className="input-style"
            onChange={(e) => setProcessor(e.target.value)}
            required
          />
        </div>

        {/* RAM */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">RAM</label>
          <select
            name="ram"
            className="input-style"
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            required
          >
            <option value="" disabled>Select RAM</option>
            <option value="32GB">32GB</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
          </select>
        </div>

        {/* Storage */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Storage
          </label>
          <input
            type="text"
            name="storage"
            placeholder="Enter storage capacity"
            value={storage}
            className="input-style"
            onChange={(e) => setStorage(e.target.value)}
            required
          />
        </div>

        {/* Battery */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Battery
          </label>
          <input
            type="text"
            name="battery"
            placeholder="Enter battery capacity"
            value={battery}
            className="input-style"
            onChange={(e) => setBattery(e.target.value)}
            required
          />
        </div>

        {/* Camera */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">
            Camera
          </label>
          <input
            type="text"
            name="camera"
            placeholder="Enter camera details"
            className="input-style"
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            required
          />
        </div>

        {/* Buttons */}
        <div className=" w-full gap-4 mt-4 grid grid-cols-2 justify-center items-center">
          <input
            type="submit"
            value="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          />
          <button
            type="button"
            onClick={(e) => handleClear(e)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </form >
      <div className="mt-16">
        {error && <p className="text-red-500">{error}</p>}
        {result && <p className="text-primary">{result}</p>}
      </div>
    </div >
  );
};

export default AddProduct;
