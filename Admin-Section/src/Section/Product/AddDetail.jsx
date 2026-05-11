import React, { useEffect, useState } from "react";
import { addNewDetail, fetchProductVariantsWithSpecs, updateSpec } from "../../Fetch/FetchAPI";
import axios from "axios";

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

const API_URL_Admin = "http://localhost:3000/admin";

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
            .catch(() => setError("Failed to load products."));
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
            .catch(() => setError("Failed to load product variants."))
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
            setError("Please select a product and a color variant.");
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
                setSuccess("Spec updated successfully! Changes are now live on the user page.");
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
                setSuccess("New spec added successfully! It is now visible on the user page.");
            }

            // Refresh variants to show updated data
            const refreshed = await fetchProductVariantsWithSpecs(selectedProductId);
            setVariantsWithSpecs(refreshed?.data || []);
            setSelectedSpecStorage("");
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Something went wrong.");
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

    return (
        <div className="bg-white border-gray-300 border p-8 rounded-lg w-full max-w-4xl mx-auto mt-12 shadow-lg">
            <h1 className="text-center text-3xl text-primary font-bold mb-2">
                {isUpdate ? "Edit Spec" : "Add New Spec"}
            </h1>
            <p className="text-center text-sm text-gray-500 mb-8">
                Select a product and variant, then edit an existing spec or add a new one.
            </p>

            {/* ── Step 1: Select Product ── */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                    1. Select Product
                </label>
                <select
                    value={selectedProductId}
                    onChange={(e) => {
                        const id = e.target.value;
                        setSelectedProductId(id);
                        const found = productOptions.find((p) => String(p.phone_id) === id);
                        setSelectedProductName(found?.name || "");
                    }}
                    className="input-style w-full"
                >
                    <option value="">— Choose a product —</option>
                    {productOptions.map((p) => (
                        <option key={p.phone_id} value={p.phone_id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Step 2: Select Color Variant ── */}
            {selectedProductId && (
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-primary mb-2">
                        2. Select Color Variant
                    </label>
                    {loading ? (
                        <p className="text-sm text-gray-400">Loading variants…</p>
                    ) : uniqueColors.length === 0 ? (
                        <p className="text-sm text-red-500">No color variants found for this product.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {uniqueColors.map(({ id, color }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedVariantId(String(id))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium text-sm transition ${
                                        String(selectedVariantId) === String(id)
                                            ? "border-green-600 bg-green-50 text-green-700"
                                            : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
                                    }`}
                                >
                                    <span
                                        className="w-5 h-5 rounded-full border border-gray-300 inline-block flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    {color}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 3: Select Spec to Edit or Add New ── */}
            {selectedVariantId && (
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-primary mb-2">
                        3. Select Spec to Edit — or Add New
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {specsForVariant.map((spec) => (
                            <button
                                key={spec.spec_id}
                                type="button"
                                onClick={() => setSelectedSpecStorage(spec.storage)}
                                className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition ${
                                    selectedSpecStorage === spec.storage
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                                }`}
                            >
                                {spec.storage} — ${spec.price}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setSelectedSpecStorage("__new__")}
                            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition ${
                                selectedSpecStorage === "__new__"
                                    ? "border-green-600 bg-green-50 text-green-700"
                                    : "border-dashed border-gray-400 bg-white text-gray-500 hover:border-green-500"
                            }`}
                        >
                            + Add New Spec
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 4: Fill in the Form ── */}
            {selectedVariantId && selectedSpecStorage && (
                <>
                    <div className="border-t border-gray-200 pt-6 mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-4">
                            {isUpdate
                                ? `Editing spec: ${selectedSpecStorage}`
                                : "Adding a new spec for this variant"}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <Field label="Storage" name="storage" value={form.storage} onChange={handleFormChange} placeholder="e.g. 128GB" required />
                        <div className="flex flex-col">
                        <label className="text-sm font-medium text-primary mb-2">Price ($)</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleFormChange}
                            placeholder="e.g. 999.99"
                            className="input-style"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                        <Field label="Stock" name="stock" value={form.stock} onChange={handleFormChange} placeholder="e.g. 50" type="number" required />
                        <Field label="Screen Size" name="screen_size" value={form.screen_size} onChange={handleFormChange} placeholder="e.g. 6.1 inch" required />
                        <Field label="Processor" name="processor" value={form.processor} onChange={handleFormChange} placeholder="e.g. A17 Pro" required />
                        <Field label="RAM" name="ram" value={form.ram} onChange={handleFormChange} placeholder="e.g. 8GB" required />
                        <Field label="Battery" name="battery" value={form.battery} onChange={handleFormChange} placeholder="e.g. 4000mAh" required />
                        <Field label="Camera" name="camera" value={form.camera} onChange={handleFormChange} placeholder="e.g. 48MP" required />

                        <div className="md:col-span-2 flex justify-center gap-4 mt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-2 rounded-lg transition"
                            >
                                {submitting ? "Saving…" : isUpdate ? "Update Spec" : "Add Spec"}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2 rounded-lg transition"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* Success/Error Messages */}
            {(error || success) && (
                <div className="mt-6">
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-md animate-fade-in">
                            <span className="text-3xl">✅</span>
                            <div>
                                <p className="text-green-800 font-bold text-lg">{success}</p>
                                <p className="text-green-600 text-sm">Changes are now live on the user page!</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-md animate-fade-in">
                            <span className="text-3xl">❌</span>
                            <div>
                                <p className="text-red-800 font-bold text-lg">{error}</p>
                                <p className="text-red-600 text-sm">Please try again or contact support.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text", required }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-primary mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="input-style"
            required={required}
            min={type === "number" ? "0" : undefined}
        />
    </div>
);

export default AddDetail;
