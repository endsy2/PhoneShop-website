import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { fetchdataProduct } from "../../FetchAPI/Fetch";
import { removeFromFavorite } from "../../store/favorite";
import ProductCard from "./ProductCard";

const AddToFavorite = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const favorite = useSelector((store) => store.favorite.favorite);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchdataProduct()
      .then((response) => setProducts(response?.data || []))
      .catch((error) => console.error("Error fetching product data:", error))
      .finally(() => setLoading(false));
  }, []);

  const favoriteProducts = products.filter((product) => favorite.includes(product.phone_id));
  const clearAll = () => favorite.forEach((id) => dispatch(removeFromFavorite({ productId: id })));

  return (
    <div className="page-container pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[-0.01em]">Favorites</h1>
          {!loading && <p className="price mt-1 text-sm text-ink-3">{favoriteProducts.length} saved</p>}
        </div>
        {favoriteProducts.length > 0 && (
          <button type="button" onClick={clearAll} className="btn btn-ghost btn-sm">Clear all</button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-3">Loading favorites</p>
      ) : favoriteProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.phone_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
          <FiHeart size={28} strokeWidth={1.5} className="text-ink-3" />
          <p className="mt-4 text-sm text-ink">No favorites yet</p>
          <p className="mt-1 text-[13px] text-ink-3">Tap the heart on a product page to save it here</p>
          <Link to="/AfterHomePage?page=PRODUCT" className="btn btn-dark mt-6">Browse products</Link>
        </div>
      )}
    </div>
  );
};

export default AddToFavorite;
