import { useEffect, useState } from "react";
import { addNewDetail, fetchProductVariantsWithSpecs, updateSpec, API_BASE_URL } from "../../Fetch/FetchAPI";
import axios from "axios";
import { FiPlus } from "react-icons/fi";
import Notice from "../../Component/Notice";

const EMPTY_FORM = {
    screen_size: "",
    processor: "",
    ram: "",
    storage: "",
    battery: "",
    camera: "",
    price: "",
    stock: "",
};

const API_URL_Admin = `${API_BASE_URL}/admin`;

// Fetch all products for the dropdown
const fetchAllProducts = async () => {
    const response = await axios.get(`${API_URL_Admin}/productOptions`, { withCredentials: true });
    return response.data?.data || [];
};

const AddDetail = () => {
    // Step 1 — product selection
    const [productOptions, setProductOptions] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedProductName, setSelectedProductName] = useState("");

    // Step 2 — variant + spec selection
    const [variantsWithSpecs, setVariantsWithSpecs] = useState([]);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [selectedSpecStorage, setSelectedSpecStorage] = useState(""); // "__new__" = add new spec

    // Step 3 — form fields
    const [form, setForm] = useState(EMPTY_FORM);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load product list on mount
    useEffect(() => {
        fetchAllProducts()
            .then(setProductOptions)
            .catch(() => setError("Couldn\u2019t load products"));
    }, []);

    // When product changes, load its variants + specs
    useEffect(() => {
        if (!selectedProductId) {
            setVariantsWithSpecs([]);
            setSelectedVariantId("");
            setSelectedSpecStorage("");
            setForm(EMPTY_FORM);
            return;
        }

        setLoading(true);
        setError("");
        fetchProductVariantsWithSpecs(selectedProductId)
            .then((data) => {
                setVariantsWithSpecs(data?.data || []);
                setSelectedVariantId("");
                setSelectedSpecStorage("");
                setForm(EMPTY_FORM);
            })
            .catch(() => setError("Couldn\u2019t load this product\u2019s colours"))
            .finally(() => setLoading(false));
    }, [selectedProductId]);

    // When variant changes, reset spec selection
    useEffect(() => {
        setSelectedSpecStorage("");
        setForm(EMPTY_FORM);
    }, [selectedVariantId]);

    // When spec storage is selected, pre-fill the form with existing data
    useEffect(() => {
        if (!selectedSpecStorage || selectedSpecStorage === "__new__") {
            setForm(EMPTY_FORM);
            return;
        }

        const spec = variantsWithSpecs.find(
            (row) =>
                String(row.idphone_variants) === String(selectedVariantId) &&
                row.storage === selectedSpecStorage
        );

        if (spec) {
            setForm({
                screen_size: spec.screen_size || "",
                processor: spec.processor || "",
                ram: spec.ram || "",
                storage: spec.storage || "",
                battery: spec.battery || "",
                camera: spec.camera || "",
                price: spec.price || "",
                stock: spec.stock || "",
            });
        }
    }, [selectedSpecStorage, selectedVariantId, variantsWithSpecs]);

    // Unique colors for the selected product
    const uniqueColors = [
        ...new Map(
            variantsWithSpecs.map((row) => [row.idphone_variants, row.color])
        ).entries(),
    ].map(([id, color]) => ({ id, color }));

    // Existing specs for the selected variant
    const specsForVariant = variantsWithSpecs.filter(
        (row) =>
            String(row.idphone_variants) === String(selectedVariantId) &&
            row.spec_id !== null
    );

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!selectedProductId || !selectedVariantId) {
            setError("Choose a product and a colour first");
            return;
        }

        setSubmitting(true);

        try {
            const isUpdate = selectedSpecStorage && selectedSpecStorage !== "__new__";

            if (isUpdate) {
                // UPDATE existing spec
                const queryParam = {
                    variantID: selectedVariantId,
                    oldStorage: selectedSpecStorage,
                };
                const formdata = {
                    newStorage: form.storage,
                    screen_size: form.screen_size,
                    processor: form.processor,
                    ram: form.ram,
                    battery: form.battery,
                    camera: form.camera,
                    stock: form.stock,
                    price: form.price,
                };
                await updateSpec(formdata, queryParam);
                setSuccess("Saved. The storefront shows the new values now");
            } else {
                // INSERT new spec
                const selectedVariant = variantsWithSpecs.find(
                    (row) => String(row.idphone_variants) === String(selectedVariantId)
                );
                const formdata = {
                    product_id: selectedProductId,
                    product_name: selectedProductName,
                    color: selectedVariant?.color || "",
                    ...form,
                };
                await addNewDetail({ formdata });
                setSuccess("Added. It\u2019s on the storefront now");
            }

            // Refresh variants to show updated data
            const refreshed = await fetchProductVariantsWithSpecs(selectedProductId);
            setVariantsWithSpecs(refreshed?.data || []);
            setSelectedSpecStorage("");
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Couldn\u2019t save the option");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setSelectedSpecStorage("");
        setError("");
        setSuccess("");
    };

    const isUpdate = selectedSpecStorage && selectedSpecStorage !== "__new__";

    const chip = (active) =>
        `h-9 rounded-lg border px-3 text-sm transition-colors duration-150 ease-out ${
            active ? "border-ink bg-surface text-ink" : "border-line-strong bg-surface text-ink-2 hover:text-ink"
        }`;

    return (
        <div className="card max-w-3xl divide-y divide-line">
            <Step number={1} title="Product">
                <select
                    value={selectedProductId}
                    onChange={(e) => {
                        const id = e.target.value;
                        setSelectedProductId(id);
                        const found = productOptions.find((p) => String(p.phone_id) === id);
                        setSelectedProductName(found?.name || "");
                    }}
                    className="input max-w-sm"
                    aria-label="Product"
                >
                    <option value="">Choose a product</option>
                    {productOptions.map((p) => (
                        <option key={p.phone_id} value={p.phone_id}>{p.name}</option>
                    ))}
                </select>
            </Step>

            {selectedProductId && (
                <Step number={2} title="Colour">
                    {loading ? (
                        <p className="text-sm text-ink-3">Loading colours</p>
                    ) : uniqueColors.length === 0 ? (
                        <p className="text-sm text-ink-3">This product has no colours yet. Add one on the Colour tab</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {uniqueColors.map(({ id, color }) => (
                                <button key={id} type="button" onClick={() => setSelectedVariantId(String(id))} className={chip(String(selectedVariantId) === String(id))}>
                                    {color}
                                </button>
                            ))}
                        </div>
                    )}
                </Step>
            )}

            {selectedVariantId && (
                <Step number={3} title="Storage option" description="Edit an existing option or add a new one">
                    <div className="flex flex-wrap gap-2">
                        {specsForVariant.map((spec) => (
                            <button key={spec.spec_id} type="button" onClick={() => setSelectedSpecStorage(spec.storage)} className={chip(selectedSpecStorage === spec.storage)}>
                                {spec.storage} <span className="price ml-1 text-ink-3">${spec.price}</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setSelectedSpecStorage("__new__")}
                            className={`${chip(selectedSpecStorage === "__new__")} ${selectedSpecStorage === "__new__" ? "" : "border-dashed"} inline-flex items-center gap-1.5`}
                        >
                            <FiPlus size={14} strokeWidth={1.5} /> New option
                        </button>
                    </div>
                </Step>
            )}

            {selectedVariantId && selectedSpecStorage && (
                <form onSubmit={handleSubmit} onReset={handleReset} className="p-6">
                    <p className="text-sm font-medium">
                        {isUpdate ? `Edit ${selectedSpecStorage}` : `New storage option for ${selectedProductName}`}
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Storage" name="storage" value={form.storage} onChange={handleFormChange} placeholder="128GB" required />
                        <Field label="RAM" name="ram" value={form.ram} onChange={handleFormChange} placeholder="8GB" required />
                        <Field label="Price (USD)" name="price" value={form.price} onChange={handleFormChange} type="number" step="0.01" required />
                        <Field label="Stock" name="stock" value={form.stock} onChange={handleFormChange} type="number" required />
                        <Field label="Screen" name="screen_size" value={form.screen_size} onChange={handleFormChange} placeholder="6.1 inch" required />
                        <Field label="Processor" name="processor" value={form.processor} onChange={handleFormChange} required />
                        <Field label="Battery" name="battery" value={form.battery} onChange={handleFormChange} placeholder="4000mAh" required />
                        <Field label="Camera" name="camera" value={form.camera} onChange={handleFormChange} placeholder="48MP" required />
                    </div>
                    <div className="mt-6 flex gap-2">
                        <button type="submit" disabled={submitting} className="btn btn-dark">
                            {submitting ? "Saving" : isUpdate ? "Save changes" : "Add option"}
                        </button>
                        <button type="reset" className="btn btn-ghost">Cancel</button>
                    </div>
                </form>
            )}

            {(error || success) && (
                <div className="space-y-2 p-6">
                    <Notice>{success}</Notice>
                    <Notice tone="error">{error}</Notice>
                </div>
            )}
        </div>
    );
};

const Step = ({ number, title, description, children }) => (
    <section className="p-6">
        <div className="mb-3 flex items-baseline gap-2">
            <span className="price text-[13px] text-ink-3">{number}</span>
            <h2 className="text-sm font-medium">{title}</h2>
            {description && <span className="text-[13px] text-ink-3">{description}</span>}
        </div>
        {children}
    </section>
);

const Field = ({ label, name, value, onChange, placeholder, type = "text", required, step }) => (
    <div>
        <label htmlFor={`spec-${name}`} className="label">{label}</label>
        <input
            id={`spec-${name}`}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`input ${type === "number" ? "price" : ""}`}
            required={required}
            min={type === "number" ? "0" : undefined}
            step={step}
        />
    </div>
);

export default AddDetail;
