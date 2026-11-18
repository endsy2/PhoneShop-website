import { useEffect, useState } from "react";
import Notice from "../../Component/Notice";
import { insertPromotion, productByID, productData } from "../../Fetch/FetchAPI";

const HeadMainOffer = () => {
    // State to manage form inputs
    const [formData, setFormData] = useState(
        { phone_name: "", Color: "", storage: "", discount_percent: "", start_date: "", end_date: "" }
    );

    // State to handle feedback messages
    const [feedbackMessage, setFeedbackMessage] = useState(null);
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
                setFeedbackMessage({ ok: false, text: "Couldn\u2019t save the promotion. Check the fields and try again" });
                return;
            }

            setFeedbackMessage({ ok: true, text: "Promotion saved" });
            window.location.reload();
        } catch (error) {
            // Handle errors from the API call
            console.error("Submission Error:", error);
            setFeedbackMessage({ ok: false, text: error?.message || "Couldn\u2019t save the promotion" });
        }
    };

    const select = (id, options, empty) => (
        <select id={id} value={formData[id]} onChange={handleInputChange} className="input" required>
            {options.length === 0 ? <option value="">{empty}</option> : options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
    );

    return (
        <form onSubmit={handleSubmit} className="card p-6">
            <h2 className="text-base font-medium">New promotion</h2>
            <p className="mt-1 text-[13px] text-ink-3">Applies to one colour and storage option. Saving again for the same option updates it</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label htmlFor="phone_name" className="label">Product</label>
                    <select id="phone_name" value={formData.phone_name} onChange={handleInputChange} className="input" required>
                        <option value="">Choose a product</option>
                        {productOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="Color" className="label">Colour</label>
                    {select("Color", colorOptions, "Choose a product first")}
                </div>
                <div>
                    <label htmlFor="storage" className="label">Storage</label>
                    {select("storage", storageOptions, "Choose a colour first")}
                </div>
                <div>
                    <label htmlFor="discount_percent" className="label">Discount (%)</label>
                    <input type="number" id="discount_percent" value={formData.discount_percent} onChange={handleInputChange} min="1" max="100" step="0.01" className="input price" required />
                </div>
                <div>
                    <label htmlFor="start_date" className="label">Starts</label>
                    <input type="date" id="start_date" value={formData.start_date} onChange={handleInputChange} className="input" required />
                </div>
                <div>
                    <label htmlFor="end_date" className="label">Ends</label>
                    <input type="date" id="end_date" value={formData.end_date} min={formData.start_date || undefined} onChange={handleInputChange} className="input" required />
                </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" className="btn btn-dark">Save promotion</button>
                {feedbackMessage && <Notice tone={feedbackMessage.ok ? "ok" : "error"}>{feedbackMessage.text}</Notice>}
            </div>
        </form>
    );
};

export default HeadMainOffer;
