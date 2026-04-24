import { useEffect, useState } from "react";
import { offer_header } from "../../Constants";
import { insertPromotion, productByID, productData } from "../../Fetch/FetchAPI";

const HeadMainOffer = () => {
    // State to manage form inputs
    const [formData, setFormData] = useState(
        offer_header.reduce((acc, field) => {
            acc[field.dbLabel] = ""; // Initialize all fields as empty strings
            return acc;
        }, {})
    );

    // State to handle feedback messages
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [productOptions, setProductOptions] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);
    const [storageOptions, setStorageOptions] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await productData();
                const productRows = response?.data?.data || [];
                const uniqueProductNames = [...new Set(productRows.map((item) => item.name).filter(Boolean))];
                setProductOptions(uniqueProductNames);
            } catch (error) {
                console.error("Failed to load product list:", error);
            }
        };

        loadProducts();
    }, []);

    useEffect(() => {
        const loadVariantsByProduct = async () => {
            if (!formData.phone_name) {
                setProductVariants([]);
                setColorOptions([]);
                setStorageOptions([]);
                return;
            }

            try {
                const response = await productByID(formData.phone_name);
                const variants = response?.data || [];
                setProductVariants(variants);

                const colors = [...new Set(variants.map((item) => item.color).filter(Boolean))];
                setColorOptions(colors);

                setFormData((prev) => ({
                    ...prev,
                    Color: colors.includes(prev.Color) ? prev.Color : (colors[0] || ""),
                }));
            } catch (error) {
                console.error("Failed to load product variants:", error);
                setProductVariants([]);
                setColorOptions([]);
                setStorageOptions([]);
            }
        };

        loadVariantsByProduct();
    }, [formData.phone_name]);

    useEffect(() => {
        if (!formData.Color) {
            setStorageOptions([]);
            return;
        }

        const storages = [...new Set(
            productVariants
                .filter((item) => item.color === formData.Color)
                .map((item) => item.storage)
                .filter(Boolean)
        )];

        setStorageOptions(storages);
        setFormData((prev) => ({
            ...prev,
            storage: storages.includes(prev.storage) ? prev.storage : (storages[0] || ""),
        }));
    }, [formData.Color, productVariants]);

    // Handle input change
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await insertPromotion({
                formData: {
                    ...formData,
                    discount_percent: String(formData.discount_percent || "").replace("%", "").trim(),
                },
            });

            if (!response) {
                setFeedbackMessage("No data returned. Please check your input or try again.");
                return;
            }

            setFeedbackMessage("Promotion submitted successfully!");
            console.log("Submitted Data:", response);
            window.location.reload();
        } catch (error) {
            // Handle errors from the API call
            console.error("Submission Error:", error);
            setFeedbackMessage(error?.message || "An error occurred during submission. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <section className="max-w-4xl mx-auto">
                <h1 className="green-title mb-20 green-text font-semibold text-center">
                    Offer Discount
                </h1>
                {console.log(formData)
                }
                <form
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    onSubmit={handleSubmit}
                >
                    {offer_header.map((element, index) => (
                        <div key={index} className="col-span-1">
                            <label
                                htmlFor={element.dbLabel}
                                className="text-sm font-medium text-primary mb-2"
                            >
                                {element.label}
                            </label>
                            {element.dbLabel === "phone_name" ? (
                                <select
                                    id={element.dbLabel}
                                    value={formData[element.dbLabel]}
                                    onChange={handleInputChange}
                                    className="input-style h-12 w-full px-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-0 transition"
                                    required
                                >
                                    <option value="">Select product</option>
                                    {productOptions.map((productName) => (
                                        <option key={productName} value={productName}>
                                            {productName}
                                        </option>
                                    ))}
                                </select>
                            ) : element.dbLabel === "Color" ? (
                                <select
                                    id={element.dbLabel}
                                    value={formData[element.dbLabel]}
                                    onChange={handleInputChange}
                                    className="input-style h-12 w-full px-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-0 transition"
                                    required
                                >
                                    {colorOptions.length === 0 ? (
                                        <option value="">No colors available</option>
                                    ) : (
                                        colorOptions.map((colorValue) => (
                                            <option key={colorValue} value={colorValue}>
                                                {colorValue}
                                            </option>
                                        ))
                                    )}
                                </select>
                            ) : element.dbLabel === "storage" ? (
                                <select
                                    id={element.dbLabel}
                                    value={formData[element.dbLabel]}
                                    onChange={handleInputChange}
                                    className="input-style h-12 w-full px-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-0 transition"
                                    required
                                >
                                    {storageOptions.length === 0 ? (
                                        <option value="">No storage available</option>
                                    ) : (
                                        storageOptions.map((storageValue) => (
                                            <option key={storageValue} value={storageValue}>
                                                {storageValue}
                                            </option>
                                        ))
                                    )}
                                </select>
                            ) : element.dbLabel === "discount_percent" ? (
                                <input
                                    type="number"
                                    id={element.dbLabel}
                                    value={formData[element.dbLabel]}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="input-style h-12 w-full px-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-0 transition"
                                    aria-label={element.label}
                                    required
                                />
                            ) : (
                                <FormField
                                    id={element.dbLabel}
                                    label={element.label}
                                    value={formData[element.dbLabel]}
                                    onChange={handleInputChange}
                                    type={
                                        ["start_date", "end_date"].includes(
                                            element.dbLabel
                                        )
                                            ? "date"
                                            : "text"
                                    }
                                />
                            )}
                        </div>
                    ))}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
                        <input
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition"
                            value="Submit"
                        />
                    </div>
                </form>
                {feedbackMessage && (
                    <p className="text-center text-sm mt-4 text-red-600">
                        {feedbackMessage}
                    </p>
                )}
            </section>
        </div>
    );
};

const FormField = ({ id, label, value, onChange, type }) => (
    <div className="flex flex-col items-start">
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className="input-style h-12 w-full px-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-0 transition"
            aria-label={label}
        />
    </div>
);

export default HeadMainOffer;
