import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { updateProductVariants, updateSpec } from "../../Fetch/FetchAPI";

const UpdateSpec = ({ product_id, storage }) => {
    const location = useLocation();
    const [id, setID] = useState("");
    const [oldStorage, setOldStorage] = useState("");
    const [newStorage, setNewStorage] = useState("");
    const [processor, setProcessor] = useState("");
    const [ram, setRam] = useState("");
    const [battery, setBattery] = useState("");
    const [camera, setCamera] = useState("");
    const [screen_size, setScreen_size] = useState("")
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");

    useEffect(() => {
        setID(product_id);
        setOldStorage(storage);
    }, [product_id, storage]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formdata = {
            newStorage,
            processor,
            ram,
            battery,
            camera,
            price,
            stock,
            screen_size,
        };
        const queryParam = {
            variantID: id,
            oldStorage
        }
        try {
            const result = await updateSpec(formdata, queryParam);
            window.location.reload();
            console.log(result);
            // console.log(formdata);
            // console.log(queryParam);

        } catch (error) {
            console.log(error);
        }
    };

    const handleClear = () => {
        setOldStorage("");
        setNewStorage("");
        setProcessor("");
        setRam("");
        setBattery("");
        setCamera("");
        setPrice("");
        setStock("");
    };

    return (
        <div className="bg-white border-gray-300 border p-12 rounded-lg w-full max-w-9xl mx-auto mt-12 shadow-lg">
            <h1 className="text-center text-3xl text-primary font-bold mb-8">Update Product</h1>
            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:items-center gap-10 py-10"
            >
                {/* Price */}

                {/* Storage */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Storage</label>
                    <input
                        type="text"
                        name="storage"
                        placeholder="Enter new storage capacity"
                        value={newStorage}
                        className="input-style"
                        onChange={(e) => setNewStorage(e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        placeholder="e.g. 999.99"
                        value={price}
                        className="input-style"
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                {/* Processor */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Processor</label>
                    <input
                        type="text"
                        name="processor"
                        placeholder="Enter processor details"
                        value={processor}
                        className="input-style"
                        onChange={(e) => setProcessor(e.target.value)}
                    />
                </div>

                {/* RAM */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">RAM</label>
                    <input
                        type="text"
                        name="ram"
                        placeholder="Enter RAM size"
                        value={ram}
                        className="input-style"
                        onChange={(e) => setRam(e.target.value)}
                    />
                </div>

                {/* Battery */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Battery</label>
                    <input
                        type="text"
                        name="battery"
                        placeholder="Enter battery capacity"
                        value={battery}
                        className="input-style"
                        onChange={(e) => setBattery(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Screen Size</label>
                    <input
                        type="text"
                        name="battery"
                        placeholder="Enter Screen Size"
                        value={screen_size}
                        className="input-style"
                        onChange={(e) => setScreen_size(e.target.value)}
                    />
                </div>

                {/* Camera */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Camera</label>
                    <input
                        type="text"
                        name="camera"
                        placeholder="Enter camera specifications"
                        value={camera}
                        className="input-style"
                        onChange={(e) => setCamera(e.target.value)}
                    />
                </div>

                {/* Stock */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        placeholder="Enter stock quantity"
                        value={stock}
                        className="input-style"
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>

                <div className="w-full gap-4 mt-4 grid grid-cols-2 justify-center items-center">
                    <input
                        type="submit"
                        value="Submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateSpec;
