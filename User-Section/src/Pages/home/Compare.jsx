import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearCompare, removeFromCompare } from "../../store/compare";

const compareFields = [
  { label: "Color", key: "color" },
  { label: "Storage", key: "storage" },
  { label: "Display", key: "screen_size" },
  { label: "Battery", key: "battery" },
  { label: "Camera", key: "camera" },
  { label: "Processor", key: "processor" },
  { label: "RAM", key: "ram" },
  { label: "Release Date", key: "release_date" },
];

const imageUrlFromProduct = (product) => {
  const imagePath = (product?.images || "").split(",")[0] || "";

  if (!imagePath) {
    return "";
  }

  return `http://localhost:3000/${imagePath.trim().replace(/uploads[\\/]/g, "").replace(/\s+/g, "")}`;
};

const formatValue = (value, fieldKey) => {
  if (!value) {
    return "-";
  }

  if (fieldKey === "release_date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  return value;
};

const Compare = () => {
  const dispatch = useDispatch();
  const compareItems = useSelector((store) => store.compare.compareItems);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-8 md:px-10">
          <div className="mx-auto max-w-7xl">
            {compareItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compareItems.map((item) => (
                  <div key={item.phone_id} className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        {item.name || "Unknown product"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCompare({ productId: item.phone_id }))}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>

                    <Link to={`/product-detail?phone_name=${item.name}`} className="block">
                      <div className="flex justify-center rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                        {imageUrlFromProduct(item) ? (
                          <img
                            src={imageUrlFromProduct(item)}
                            alt={item.name}
                            className="w-full max-w-[320px] h-auto object-contain"
                          />
                        ) : (
                          <div className="flex w-full max-w-[320px] items-center justify-center text-sm text-slate-400 min-h-[200px]">
                            No image available
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="mt-4 space-y-2 text-[16px] text-slate-700">
                      {compareFields.map((field) => (
                        <p key={`${item.phone_id}-${field.key}`} className="leading-7">
                          <span className="font-bold text-slate-900">{field.label} :</span>{" "}
                          {formatValue(item[field.key], field.key)}
                        </p>
                      ))}
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-red-600">
                      Price : {item.price_discount ? `${item.price_discount}$` : `${item.price}$`}
                    </p>
                    {item.price_discount ? (
                      <p className="mt-1 text-sm text-slate-400 line-through">{item.price}$</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">No products selected yet</h2>
                <p className="mt-3 text-slate-500">
                  Use the Compare button on any product to add it here.
                </p>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Back to Shop
                  </Link>
                </div>
              </div>
            )}
          </div>
    </div>
  );
};

export default Compare;