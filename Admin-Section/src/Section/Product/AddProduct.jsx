import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { addNewProductAPI, updateProduct } from "../../Fetch/FetchAPI";


const AddProduct = ({ product_id }) => {
  const location = useLocation();
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
  const [colors, setColors] = useState(["#000000"]); // Default to one color
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [ram, setRam] = useState('');
  const [battery, setBattery] = useState('');

  useEffect(() => {
    setID(product_id)
  }, [product_id])

  // Initialize colors as an array


  // Function to handle color value change
  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value; // Update the specific index
    setColors(newColors);
  };

  // Add a new color input
  const handleAddColor = () => {
    setColors([...colors, ""]); // Add a new empty string for color
  };

  // Remove a color input
  const handleRemoveColor = (index) => {
    const newColors = [...colors];
    newColors.splice(index, 1); // Remove the specific color
    setColors(newColors);
  };


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
      // console.log(formdata.colors);

      // console.log(formdata.images);

      // handleClear(); // Clear form after successful submission
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdate = async (e) => {

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
      const result = await updateProduct(formdata, id);
      window.location.reload();

    } catch (error) {
      console.log(error);
    }
  }


  const handleClear = () => {

    setName('');
    setBrand('');
    setImages([]);
    setPrice('');
    setDate('');
    setProcessor('');
    setStorage('');
    setCamera('');
    setColors(['']);
    setDescription('');
    setStock('');
    setScreenSize('');
    setRam('');
    setBattery('');
    setCategory('');
  }
  return (
    <div className="bg-white border-gray-300 border p-12 rounded-lg w-full max-w-9xl mx-auto mt-12 shadow-lg">
      <h1 className="text-center text-3xl text-primary font-bold mb-8">
        {location.pathname === "/dashboard/addProduct" ? <h1>Add Product</h1> : <h1>Update Product</h1>}
      </h1>
      <form
        onSubmit={(location.pathname === "/dashboard/addProduct") ? handleSubmit : handleUpdate}
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
          <input
            type="text"
            name="name_category"
            placeholder="Enter product category"
            value={category}
            className="input-style"
            onChange={(e) => setCategory(e.target.value)}
            required
          />
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
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-6">
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Color {index + 1}:</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="h-6 w-28 rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className={`bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition ${location.pathname === '/dashboard/addProduct' ? 'block' : 'hidden'}`}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add Color Button */}
            <button
              type="button"
              onClick={handleAddColor}
              className={`mt-4 bg-green-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition self-center ${location.pathname === '/dashboard/addProduct' ? 'block' : 'hidden'}`}
            >
              Add New Color
            </button>
          </div>
        </div>


        {/* brand */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Brand</label>
          <input
            type="text"
            name="name_brand"
            placeholder="Enter product brand"
            value={brand}
            className="input-style"
            onChange={((e) => setBrand(e.target.value))}
            required
          />
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
          <input
            type="text"
            name="ram"
            placeholder="Enter RAM size"
            className="input-style"
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            required
          />
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
    </div >
  );
};

export default AddProduct;
