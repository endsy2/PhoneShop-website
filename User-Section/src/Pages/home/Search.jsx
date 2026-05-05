import { useEffect, useState, useCallback } from "react";
import { fetchBrand, fetchCategory, fetchSearchDataByName } from "../../FetchAPI/Fetch";
import ProductCard from "./ProductCard";
import Card from "./Card";

const Search = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const productName = params.get("productName");

  const [brand, setBrand] = useState([]);
  const [data, setData] = useState([]);
  const [category, setCategory] = useState([]);

  const handleFetchCategory = async () => {
    try {
      const response = await fetchCategory();
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      const response = await fetchSearchDataByName({ phone_name: productName });
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [productName]);

  const handleFetchBrand = async () => {
    try {
      const response = await fetchBrand();
      setBrand(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    if (productName) {
      handleSearch();
    }
    handleFetchCategory();
    handleFetchBrand();
  }, [handleSearch, productName]);

  return (
    <div className="p-8  min-h-screen">
      <div className="container mx-auto">
        {/* Header */}

        <div className="flex flex-wrap lg:flex-nowrap gap-12">
          {/* Categories Section */}
          <div className="flex flex-col  bg-white shadow-lg rounded-lg p-6 w-full lg:w-1/4">
            <h2 className="text-2xl font-bold mb-6 ">Categories</h2>
            <div className="flex flex-col gap-4">
              {category.length > 0 ? (
                category.map((element, index) => (
                  <Card key={index} data={element} page="Categories" />
                ))
              ) : (
                <p className="text-gray-500">No categories available.</p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-600">
              Results for "{productName || "All Products"}"
            </h2>
            {data.length === 0 ? (
              <p className="text-gray-500">No products found for "{productName}"</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.map((element) => (
                  <ProductCard key={element.phone_id || element.id} product={element} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Brands Section */}
        <div className="mt-12 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6 ">Popular Brands</h2>
          <div className="flex flex-wrap gap-6">
            {brand.length > 0 ? (
              brand.map((element, index) => (
                <Card key={index} data={element} page="Brands" />
              ))
            ) : (
              <p className="text-gray-500">No brands available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
