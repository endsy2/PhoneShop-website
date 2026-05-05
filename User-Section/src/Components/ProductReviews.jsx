import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NETWORK_CONFIG } from '../network/Network_EndPoint';

const API_URL_COMMON = `${NETWORK_CONFIG.apiBaseUrl}/common`;

const ProductReviews = ({ spec_id }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("recent");
    const [filterRating, setFilterRating] = useState(null);
    
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        title: "",
        comment: ""
    });

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL_COMMON}/reviews/${spec_id}?sortBy=${sortBy}&filterRating=${filterRating || ""}`,
                { withCredentials: true }
            );
            setReviews(response.data.reviews || []);
            setStats(response.data.stats);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [spec_id, sortBy, filterRating]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleAddReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_URL_COMMON}/reviews`,
                { spec_id, ...formData },
                { withCredentials: true }
            );
            setFormData({ rating: 5, title: "", comment: "" });
            setShowReviewForm(false);
            fetchReviews();
        } catch (error) {
            console.error("Error adding review:", error);
            alert(error.response?.data?.message || "Error adding review");
        }
    };

    const handleVote = async (review_id, vote_type) => {
        try {
            await axios.post(
                `${API_URL_COMMON}/reviews/vote`,
                { review_id, vote_type },
                { withCredentials: true }
            );
            fetchReviews();
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleDeleteReview = async (review_id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(
                `${API_URL_COMMON}/reviews/${review_id}`,
                { withCredentials: true }
            );
            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const getRatingStars = (count) => {
        const percentage = Math.round((count / (stats?.total_reviews || 1)) * 100);
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm w-20">{count === 0 ? '0' : `${count} star`}</span>
                <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className="h-full bg-yellow-400 rounded" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-sm text-gray-500">{percentage}%</span>
            </div>
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {/* Rating Stats */}
            {stats && (
                <div className="mb-8 pb-8 border-b">
                    <div className="flex items-center gap-8 mb-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-yellow-500">
                                {stats.avg_rating?.toFixed(1) || "0"}
                            </div>
                            <div className="flex justify-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-xl ${i < Math.round(stats.avg_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Based on {stats.total_reviews} reviews</p>
                        </div>
                        <div className="flex-1">
                            {getRatingStars(stats.five_star || 0)}
                            {getRatingStars(stats.four_star || 0)}
                            {getRatingStars(stats.three_star || 0)}
                            {getRatingStars(stats.two_star || 0)}
                            {getRatingStars(stats.one_star || 0)}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Review Button */}
            <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>

            {/* Review Form */}
            {showReviewForm && (
                <form onSubmit={handleAddReview} className="mb-8 p-4 bg-gray-50 rounded border">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Rating</label>
                        <select
                            value={formData.rating}
                            onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded"
                        >
                            {[1,2,3,4,5].map(r => (
                                <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g., Great product!"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Review</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Share your experience with this product..."
                            className="w-full p-2 border rounded h-32"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Submit Review
                    </button>
                </form>
            )}

            {/* Filter Options */}
            <div className="mb-6 flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterRating(null)}
                    className={`px-3 py-1 rounded ${filterRating === null ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    All Reviews
                </button>
                {[5,4,3,2,1].map(r => (
                    <button
                        key={r}
                        onClick={() => setFilterRating(r)}
                        className={`px-3 py-1 rounded ${filterRating === r ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        {r}★ ({stats ? stats[`${r}_star`] || 0 : 0})
                    </button>
                ))}
            </div>

            {/* Sort Options */}
            <div className="mb-6">
                <label className="mr-2 text-sm font-semibold">Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <p className="text-center text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p className="text-center text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.review_id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                        ))}
                                    </div>
                                    <h4 className="font-semibold">{review.title}</h4>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review.review_id)}
                                    className="text-red-600 text-sm hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">by <strong>{review.username}</strong> • {new Date(review.created_at).toLocaleDateString()}</p>
                            <p className="mb-4">{review.comment}</p>
                            {review.is_verified_purchase && (
                                <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded mb-4">✓ Verified Purchase</span>
                            )}
                            <div className="flex gap-4 text-sm">
                                <button
                                    onClick={() => handleVote(review.review_id, 'helpful')}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    👍 Helpful ({review.helpful_count})
                                </button>
                                <button
                                    onClick={() => handleVote(review.review_id, 'unhelpful')}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    👎 ({review.unhelpful_count})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
