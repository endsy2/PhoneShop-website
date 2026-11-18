import { useEffect, useState } from "react";
import Notice from "../../Component/Notice";
import { updateSpec } from "../../Fetch/FetchAPI";

const UpdateSpec = ({ product_id, storage, initial }) => {
    const [id, setID] = useState("");
    const [oldStorage, setOldStorage] = useState("");
    const [newStorage, setNewStorage] = useState("");
    const [processor, setProcessor] = useState("");
    const [ram, setRam] = useState("");
    const [battery, setBattery] = useState("");
    const [camera, setCamera] = useState("");
    const [screen_size, setScreen_size] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setID(product_id);
        setOldStorage(storage);
        // Start from the spec's current values so a single change doesn't mean retyping everything
        if (initial) {
            setNewStorage(initial.storage || storage || "");
            setProcessor(initial.processor || "");
            setRam(initial.ram || "");
            setBattery(initial.battery || "");
            setCamera(initial.camera || "");
            setScreen_size(initial.screen_size || "");
            setPrice(initial.price || "");
            setStock(initial.spec_stock ?? initial.stock ?? "");
        }
    }, [product_id, storage, initial]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formdata = { newStorage, processor, ram, battery, camera, price, stock, screen_size };
        const queryParam = { variantID: id, oldStorage };
        try {
            const result = await updateSpec(formdata, queryParam);
            if (result?.status >= 200 && result?.status < 300) {
                setResult("Saved. Reload the page to see the new values");
                setError("");
                window.location.reload();
            } else {
                setError(result?.data?.message || "Couldn\u2019t save the spec");
            }
        } catch (error) {
            const msg = error?.response?.data?.message || "Couldn\u2019t save the spec";
            setError(msg);
        }
    };

    const handleClear = () => {
        setNewStorage("");
        setProcessor("");
        setRam("");
        setBattery("");
        setCamera("");
        setPrice("");
        setStock("");
        setScreen_size("");
        setResult("");
        setError("");
    };

    const field = (label, value, setter, type = "text") => (
        <div>
            <label className="label">{label}</label>
            <input type={type} value={value} onChange={(e) => setter(e.target.value)} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} className={`input ${type === "number" ? "price" : ""}`} required />
        </div>
    );

    return (
        <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                {field("Storage", newStorage, setNewStorage)}
                {field("RAM", ram, setRam)}
                {field("Price (USD)", price, setPrice, "number")}
                {field("Stock", stock, setStock, "number")}
                {field("Screen", screen_size, setScreen_size)}
                {field("Processor", processor, setProcessor)}
                {field("Battery", battery, setBattery)}
                {field("Camera", camera, setCamera)}
            </div>
            <div className="flex gap-2">
                <button type="submit" className="btn btn-dark">Save changes</button>
                <button type="button" onClick={handleClear} className="btn btn-ghost">Clear</button>
            </div>
            <Notice>{result}</Notice>
            <Notice tone="error">{error}</Notice>
        </form>
    );
};

export default UpdateSpec;
