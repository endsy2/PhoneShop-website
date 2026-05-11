import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";

const Card = ({ data, page = "Default Page" }) => {
  const [Page, setPage] = useState("");
  useEffect(() => {
    setPage(page);
  });
  return data ? (
    Page === "Categories" ? (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white hover:from-green-50 hover:to-emerald-50 rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-green-200 transition-all duration-300 group">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-center group-hover:text-green-600 transition-colors">
          {data.category_name}
        </h2>
        <Link
          to={`/Sort?category=${data.category_name}`}
          className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View more →
        </Link>
      </div>
    ) : (
      <Link to={`/Sort?brand=${data.brand_name}`}>
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white hover:from-green-50 hover:to-emerald-50 rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-md group">
          <img
            src={`${NETWORK_CONFIG.apiBaseUrl}/${data.img?.split(",")[0].trim().replace(/uploads[\\/]/g, "").replace(/\s+/g, "")}`}
            alt={data.brand_name}
            className="w-12 h-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.target.src = "https://via.placeholder.com/48x48?text=Brand"; }}
          />
          <p className="font-semibold text-base text-gray-800 group-hover:text-green-600 transition-colors">
            {data.brand_name}
          </p>
        </div>
      </Link>
    )
  ) : (
    <p className="text-center text-gray-500">No categories available.</p>
  );
};

export default Card;
