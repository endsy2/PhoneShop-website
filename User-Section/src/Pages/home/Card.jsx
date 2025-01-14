import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Card = ({ data, page = "Default Page" }) => {
  const [Page, setPage] = useState('');
  useEffect(() => {
    setPage(page)
  })
  return data ? (
    Page === "Categories" ? (
      <div
        className="flex flex-col items-center px-10 py-5 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all transform duration-300"
      >
        <div className="text-5xl text-blue-500">
          <i className="fas fa-mobile-alt"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {data.category_name}
        </h2>
        <Link
          to={`Sort?category=${data.category_name}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          View more &rarr;
        </Link>
      </div>

    ) : (

      <Link to={`Sort?brand=${data.brand_name}`} >
        <div className="flex items-center w-[200px] h-auto gap-4 p-4 bg-gray-100 hover:bg-gray-200 transition rounded-lg cursor-pointer shadow-md">
          <img
            src={`http://localhost:3000/${data.img
              ?.split(",")[0]
              .trim()
              .replace(/uploads[\\/]/g, "")
              .replace(/\s+/g, "")}`}
            alt={data.brand_name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <p className="font-semibold text-lg text-gray-800">
              {data.brand_name}
            </p>
          </div>
        </div>
      </Link>


    )
  ) : (
    <p className="text-center text-gray-500">No categories available.</p>

  );
};

export default Card;
