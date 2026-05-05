import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearCompare, removeFromCompare } from "../../store/compare";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";

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
  if (!imagePath) return "";
  return `${NETWORK_CONFIG.apiBaseUrl}/${imagePath.trim().replace(/uploads[\\/]/g, "").replace(/\s+/g, "")}`;
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

const getEffectivePrice = (item) => Number(item?.price_discount ?? item?.price ?? Infinity);

const Compare = () => {
  const dispatch = useDispatch();
  const compareItems = useSelector((store) => store.compare.compareItems);

  const bestValuePhoneId = compareItems.reduce((bestId, item) => {
    if (!bestId) {
      return item.phone_id;
    }

    const currentBest = compareItems.find((product) => product.phone_id === bestId);
    return getEffectivePrice(item) < getEffectivePrice(currentBest) ? item.phone_id : bestId;
  }, null);

  const differingFieldKeys = new Set(
    compareFields
      .filter((field) => {
        const uniqueValues = new Set(
          compareItems.map((item) => String(formatValue(item[field.key], field.key)))
        );
        return uniqueValues.size > 1;
      })
      .map((field) => field.key)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-3 py-6 sm:px-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            {compareItems.length > 0 ? (
              <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-sm font-semibold text-emerald-800">
                  Best value is highlighted in green. Different specifications are highlighted in yellow.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(clearCompare())}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                >
                  Clear Compare
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 md:gap-6 justify-items-center">
                {compareItems.map((item) => (
                  <div key={item.phone_id} className={`w-full max-w-[340px] sm:max-w-[360px] rounded-2xl border bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${item.phone_id === bestValuePhoneId ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-300"}`}>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-3 gap-2">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 line-clamp-2">
                        {item.name || "Unknown product"}
                      </h2>
                      {item.phone_id === bestValuePhoneId ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                          Best Value
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCompare({ productId: item.phone_id }))}
                        className="whitespace-nowrap rounded-full bg-red-50 px-2 sm:px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors self-start sm:self-auto"
                      >
                        Remove
                      </button>
                    </div>

                    <Link
                      to={`/product-detail?phone_id=${item.phone_id}&phone_name=${encodeURIComponent(item.name || "")}`}
                      className="block"
                    >
                      <div className="flex h-56 sm:h-64 justify-center rounded-xl border border-slate-300 bg-white p-2 sm:p-3 shadow-sm overflow-hidden">
                        {imageUrlFromProduct(item) ? (
                          <img
                            src={imageUrlFromProduct(item)}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex w-full items-center justify-center text-xs sm:text-sm text-slate-400">
                            No image available
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="mt-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
                      {compareFields.map((field) => (
                        <p key={`${item.phone_id}-${field.key}`} className={`leading-6 sm:leading-7 rounded px-1 ${differingFieldKeys.has(field.key) ? "bg-amber-50" : ""}`}>
                          <span className="font-bold text-slate-900">{field.label}:</span>{" "}
                          <span className="break-words">{formatValue(item[field.key], field.key)}</span>
                        </p>
                      ))}
                    </div>

                    <p className="mt-4 text-lg sm:text-xl md:text-2xl font-extrabold text-red-600 break-words">
                      Price : {item.price_discount ? `${item.price_discount}$` : `${item.price}$`}
                    </p>
                    {item.price_discount ? (
                      <p className="mt-1 text-xs sm:text-sm text-slate-400 line-through">{item.price}$</p>
                    ) : null}
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 sm:p-12 text-center shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">No products selected yet</h2>
                <p className="mt-3 text-sm sm:text-base text-slate-500 px-2">
                  Use the Compare button on any product to add it here.
                </p>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex rounded-full bg-emerald-600 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
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