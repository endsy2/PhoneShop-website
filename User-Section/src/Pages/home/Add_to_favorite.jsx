import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchdataProduct } from "../../FetchAPI/Fetch";
import { removeFromFavorite } from "../../store/favorite";
import ProductCard from "./ProductCard";

const AddToFavorite = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const favorite = useSelector((store) => store.favorite.favorite);
  const dispatch = useDispatch();

  // Fetch all products
  const handleFetchAllData = async () => {
    setLoading(true);
    try {
      const response = await fetchdataProduct();
      setProducts(response?.data || []);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearWishlist = () => {
    favorite.forEach((id) => {
      dispatch(removeFromFavorite({ productId: id }));
    });
  };

  // Calculate favorite products dynamically
  const favoriteProducts = products.filter((product) =>
    favorite.includes(product.phone_id)
  );

  useEffect(() => {
    handleFetchAllData();
  }, []); // Run only once to fetch data

  return (
    <div className="w-full bg-slate-50 px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Wish List</h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {favoriteProducts.length} item{favoriteProducts.length === 1 ? "" : "s"}
            </span>
            {favoriteProducts.length > 0 ? (
              <button
                type="button"
                onClick={handleClearWishlist}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Clear Wishlist
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.phone_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-700">Your wish list is empty.</p>
          <p className="mt-2 text-sm text-slate-500">Save products you like and compare them later.</p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Continue Shopping
          </Link>
        </div>
      )}
      </div>
    </div>
  );
};

export default AddToFavorite;
