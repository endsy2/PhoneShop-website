import { useEffect, useState } from "react";
import { updateProductVariants } from "../../Fetch/FetchAPI";


const UpdateProductVariants = ({ product_id }) => {
    const [id, setID] = useState('');
    const [images, setImages] = useState([]);
    const [colors, setColors] = useState("#000000");
    const [stock, setStock] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setID(product_id)
    }, [product_id])
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to Array
        setImages([...images, ...files]); // Append new files to the existing ones
    };

    const handleRemoveImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const formdata = {
    //         images,
    //         price,
    //         colors,
    //         stock
    //     }
    //     try {
    //         const result = await addNewProductAPI(formdata, id);
    //         // console.log(formdata.colors);

    //         // console.log(formdata.images);

    //         // handleClear(); // Clear form after successful submission
    //         console.log(result);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formdata = {
            images,
            colors,
            stock,
        }
        try {
            const result = await updateProductVariants(formdata, id);
            if (result?.status >= 200 && result?.status < 300) {
                setResult("Updated successfully!");
                setError('');
                window.location.reload();
            } else {
                setError("Update failed. Please try again.");
            }
        } catch (error) {
            setError("Update failed. Please try again.");
            console.log(error);
        }
    }


    const handleClear = () => {
        setImages([]);
        setColors('#000000');
        setStock('');
        setResult('');
        setError('');
    }
    return (
        <div className="bg-white border-gray-300 border p-12 rounded-lg w-full max-w-9xl mx-auto mt-12 shadow-lg">
            <h1 className="text-center text-3xl text-primary font-bold mb-8">Update Color / Images</h1>
            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 xl:grid-cols-2 md:items-center gap-10 py-10"
            >
                {/* Colors Section */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Color</label>
                    <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg shadow-md">
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors}
                                onChange={(e) => setColors(e.target.value)}
                                className="h-6 w-56 rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Stock</label>
                    <input
                        type="number"
                        placeholder="Enter stock quantity"
                        value={stock}
                        className="input-style"
                        onChange={(e) => setStock(e.target.value)}
                        min="0"
                    />
                </div>

                {/* Images */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-primary mb-2">Product Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
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
                                    className="absolute top-0 right-0 text-red-600 font-bold"
                                >X</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full gap-4 mt-4 grid grid-cols-2 justify-center items-center">
                    <input
                        type="submit"
                        value="Update"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition cursor-pointer"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >Clear</button>
                </div>
            </form>

            {result && <p className="mt-4 text-green-600 font-semibold text-center">{result}</p>}
            {error && <p className="mt-4 text-red-600 font-semibold text-center">{error}</p>}
        </div>
    );
};

export default UpdateProductVariants;
