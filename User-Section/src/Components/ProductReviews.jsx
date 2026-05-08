import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NETWORK_CONFIG } from '../network/Network_EndPoint';

const API = `${NETWORK_CONFIG.apiBaseUrl}/common`;

// Star display/selector component
const Stars = ({ rating, interactive = false, onSelect, size = "text-xl" }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                onClick={interactive ? () => onSelect(star) : undefined}
                className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-300 transition-colors' : ''}`}
            >
                ★
            </span>
        ))}
    </div>
);

const INITIAL_SHOW = 2;

const ProductReviews = ({ spec_id, openForm = false, onFormClose }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("recent");
    const [filterRating, setFilterRating] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState({ text: "", type: "" });
    const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
    const [showAll, setShowAll] = useState(false);

    const isLoggedIn = !!localStorage.getItem("authToken");
    const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_SHOW);

    // Open form when "Write Review" button is clicked from parent
    useEffect(() => {
        if (openForm) {
            setShowForm(true);
        }
    }, [openForm]);

    const fetchReviews = useCallback(async () => {
        if (!spec_id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({ sortBy });
            if (filterRating) params.set("filterRating", filterRating);
            const res = await axios.get(`${API}/reviews/${spec_id}?${params}`);
            setReviews(res.data.reviews || []);
            setStats(res.data.stats || null);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    }, [spec_id, sortBy, filterRating]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.comment.trim()) {
            setFormMsg({ text: "Please write a comment.", type: "error" });
            return;
        }
        setSubmitting(true);
        setFormMsg({ text: "", type: "" });
        try {
            await axios.post(`${API}/reviews`, { spec_id, ...form }, { withCredentials: true });
            setFormMsg({ text: "Review submitted successfully!", type: "success" });
            setForm({ rating: 5, title: "", comment: "" });
            setShowForm(false);
            if (onFormClose) onFormClose();
            fetchReviews();
        } catch (err) {
            setFormMsg({
                text: err.response?.data?.message || "Failed to submit. Please log in first.",
                type: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (review_id) => {
        if (!window.confirm("Delete your review?")) return;
        try {
            await axios.delete(`${API}/reviews/${review_id}`, { withCredentials: true });
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || "Could not delete review.");
        }
    };

    const handleVote = async (review_id, vote_type) => {
        if (!isLoggedIn) { alert("Please log in to vote."); return; }
        try {
            await axios.post(`${API}/reviews/vote`, { review_id, vote_type }, { withCredentials: true });
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || "Could not record vote.");
        }
    };

    const totalReviews = Number(stats?.total_reviews || 0);
    const avgRating = parseFloat(stats?.avg_rating || 0);

    return (
        <div>
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="text-2xl font-bold text-slate-900">Customer Reviews</h3>
                {isLoggedIn ? (
                    <button
                        type="button"
                        onClick={() => { setShowForm(!showForm); setFormMsg({ text: "", type: "" }); if (onFormClose && showForm) onFormClose(); }}
                        className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                        {showForm ? "Cancel" : "✍️ Write a Review"}
                    </button>
                ) : (
                    <p className="text-sm text-slate-500">
                        <a href="/auth/login" className="text-green-600 font-semibold underline">Log in</a> to write a review
                    </p>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4">Your Review</h4>

                    {/* Star rating selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <Stars rating={form.rating} interactive size="text-3xl" onSelect={(r) => setForm(f => ({ ...f, rating: r }))} />
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Title <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Great phone!"
                            maxLength={255}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Comment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.comment}
                            onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>

                    {formMsg.text && (
                        <p className={`text-sm mb-3 ${formMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                            {formMsg.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-slate-400 transition"
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            )}

            {/* Rating summary */}
            {totalReviews > 0 && stats && (
                <div className="flex flex-col sm:flex-row gap-6 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-col items-center justify-center min-w-[90px]">
                        <p className="text-5xl font-extrabold text-yellow-500">{avgRating.toFixed(1)}</p>
                        <Stars rating={Math.round(avgRating)} size="text-lg" />
                        <p className="text-xs text-slate-500 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                            const key = `${['five','four','three','two','one'][5 - star]}_star`;
                            const count = Number(stats[key] || 0);
                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-8 text-right text-slate-500">{star} ★</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-6 text-slate-500 text-xs">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter & Sort */}
            {totalReviews > 0 && (
                <div className="flex flex-wrap gap-3 mb-4 items-center">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                    <div className="flex gap-2 flex-wrap">
                        {[null, 5, 4, 3, 2, 1].map(r => (
                            <button
                                key={r ?? 'all'}
                                type="button"
                                onClick={() => setFilterRating(r)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterRating === r ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'}`}
                            >
                                {r === null ? 'All' : `${r} ★`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 animate-pulse bg-slate-100 rounded-xl" />)}
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                    <p className="text-slate-500 font-medium">No reviews yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleReviews.map((review, idx) => (
                        <div key={review.review_id} className="p-4 rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {(review.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{review.username}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Stars rating={review.rating} size="text-base" />
                                    {review.is_verified_purchase ? (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
                                    ) : null}
                                </div>
                            </div>

                            {review.title && <p className="mt-3 font-semibold text-slate-800">{review.title}</p>}
                            <p className="mt-1 text-slate-600 text-sm leading-relaxed">{review.comment}</p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                <span>Helpful?</span>
                                <button type="button" onClick={() => handleVote(review.review_id, 'helpful')} className="hover:text-green-600 transition">
                                    👍 {review.helpful_count}
                                </button>
                                <button type="button" onClick={() => handleVote(review.review_id, 'unhelpful')} className="hover:text-red-500 transition">
                                    👎 {review.unhelpful_count}
                                </button>
                                <div className="ml-auto flex items-center gap-3">
                                    {/* See More — only on last visible review when there are more */}
                                    {!showAll && idx === visibleReviews.length - 1 && reviews.length > INITIAL_SHOW && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAll(true)}
                                            className="text-green-600 font-semibold hover:underline"
                                        >
                                            See more ({reviews.length - INITIAL_SHOW} more)
                                        </button>
                                    )}
                                    {/* Show Less — only on last visible review when expanded */}
                                    {showAll && idx === visibleReviews.length - 1 && reviews.length > INITIAL_SHOW && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAll(false)}
                                            className="text-slate-500 font-semibold hover:underline"
                                        >
                                            Show Less
                                        </button>
                                    )}
                                    {isLoggedIn && (
                                        <button type="button" onClick={() => handleDelete(review.review_id)} className="text-red-400 hover:text-red-600 transition">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
