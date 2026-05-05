import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const API_URL_COMMON = "http://localhost:3000/common";

const ProductRecommendations = ({ spec_id, type = "co-viewed" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecommendations();
    }, [spec_id, type]);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = "";
            let title = "";

            if (type === "co-viewed") {
                endpoint = `${API_URL_COMMON}/recommendations/${spec_id}/co-viewed?limit=6`;
                title = "Customers also viewed";
            } else if (type === "similar-price") {
                endpoint = `${API_URL_COMMON}/recommendations/${spec_id}/similar-price?limit=6&range=150`;
                title = "Similar price products";
            } else if (type === "top-rated") {
                endpoint = `${API_URL_COMMON}/recommendations/${spec_id}/top-rated?limit=6`;
                title = "Top rated in this category";
            } else if (type === "personalized") {
                endpoint = `${API_URL_COMMON}/recommendations/personalized?limit=8`;
                title = "Recommended for you";
            }

            const response = await axios.get(endpoint, { withCredentials: true });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Error loading recommendations:", error);
            setError("Error loading recommendations");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading recommendations...</p>;
    if (error || !products || products.length === 0) return null;

    const typeMap = {
        "co-viewed": "Customers who viewed this also viewed",
        "similar-price": "Similar Price Products",
        "top-rated": "Top Rated in This Category",
        "personalized": "Recommended For You"
    };

    return (
        <div className="my-8">
            <h3 className="text-2xl font-bold mb-6">{typeMap[type]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <ProductCard key={product.spec_id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
