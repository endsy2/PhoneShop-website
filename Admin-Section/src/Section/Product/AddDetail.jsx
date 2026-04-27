import React, { useEffect, useState } from "react";
import { addNewDetail, productData } from "../../Fetch/FetchAPI";

const AddDetail = () => {
    const [product_name, setProductName] = useState("");
    const [product_id, setProductID] = useState("");
    const [productOptions, setProductOptions] = useState([]);
    const [color, setColor] = useState("#000000");
    const [screen_size, setScreenSize] = useState("");
    const [processor, setProcessor] = useState("");
    const [ram, setRam] = useState("");
    const [storage, setStorage] = useState("");
    const [battery, setBattery] = useState("");
    const [camera, setCamera] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    useEffect(() => {
        const loadProductOptions = async () => {
            try {
                const response = await productData();
                const rows = response?.data?.data || response?.data || [];
                const uniqueProducts = [];
                const seen = new Set();

                for (const item of rows) {
                    if (!item?.name) continue;
                    const key = `${item.phone_id}-${item.name}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    uniqueProducts.push({ phone_id: item.phone_id, name: item.name });
                }

                setProductOptions(uniqueProducts);
            } catch (err) {
                console.log(err);
            }
        };

        loadProductOptions();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (
            !product_id ||
            !color ||
            !screen_size ||
            !processor ||
            !ram ||
            !storage ||
            !battery ||
            !camera
        ) {
            alert("Please fill in all fields.");
            return;
        }

        // Prepare data to send
        const formData = {
            product_id,
            product_name,
            color,
            screen_size,
            processor,
            ram,
            storage,
            battery,
            camera,
            price,
            stock
        };

        try {
            const data = await addNewDetail({ formdata: formData });
            console.log("Response:", data);
            if (data.length !== 0) {
                setResult("Add New Spec Success")
            }
            // Clear fields on successful submission
            setError('')
            handleReset();
        } catch (error) {
            console.error("Error:", error);
            setResult('')
            setError('Something went wrong')
        }
    };

    // Handle reset
    const handleReset = () => {
        setProductName("");
        setProductID("");
        setColor("#000000");
        setScreenSize("");
        setProcessor("");
        setRam("");
        setStorage("");
        setBattery("");
        setCamera("");
        setStorage("");
        setPrice("");
    };

    return (
        <div className="bg-white border-gray-300 border p-8 rounded-lg w-full max-w-4xl mx-auto mt-12 shadow-lg">
            <h1 className="text-center text-3xl text-primary font-bold mb-8">
                Add New Detail
            </h1>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-6"
            >
                {/* Product Name */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">
                        Product Name
                    </label>
                    <select
                        value={product_id}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            setProductID(selectedId);
                            const selectedProduct = productOptions.find(
                                (item) => String(item.phone_id) === selectedId
                            );
                            setProductName(selectedProduct?.name || "");
                        }}
                        className="input-style"
                        required
                    >
                        <option value="">Select product</option>
                        {productOptions.map((item) => (
                            <option key={item.phone_id} value={item.phone_id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Color */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Enter color"
                        className="input-style h-10"
                        required
                    />
                </div>
                {/*price*/}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Price</label>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter Price"
                        className="input-style"
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Stock</label>
                    <input
                        type="text"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Enter Price"
                        className="input-style"
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
                        value={screen_size}
                        onChange={(e) => setScreenSize(e.target.value)}
                        placeholder="Enter screen size"
                        className="input-style"
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
                        value={processor}
                        onChange={(e) => setProcessor(e.target.value)}
                        placeholder="Enter processor type"
                        className="input-style"
                        required
                    />
                </div>

                {/* RAM */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">RAM</label>
                    <input
                        type="text"
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        placeholder="Enter RAM size"
                        className="input-style"
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
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        placeholder="Enter storage capacity"
                        className="input-style"
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
                        value={battery}
                        onChange={(e) => setBattery(e.target.value)}
                        placeholder="Enter battery capacity"
                        className="input-style"
                        required
                    />
                </div>

                {/* Camera */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Camera</label>
                    <input
                        type="text"
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        placeholder="Enter camera specifications"
                        className="input-style"
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex justify-center items-center gap-4 mt-4">
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        Submit
                    </button>
                    <button
                        onClick={handleReset}
                        type="reset"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        Reset
                    </button>
                </div>
            </form>
            {error && <p className="text-red-500">{error}</p>}
            {result && <p className="text-primary">{result}</p>}
        </div>
    );
};

export default AddDetail;
