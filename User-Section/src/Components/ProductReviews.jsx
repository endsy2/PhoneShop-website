import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiStar, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import { NETWORK_CONFIG } from '../network/Network_EndPoint';

const API = `${NETWORK_CONFIG.apiBaseUrl}/common`;

// Star display, or a selector when interactive
const Stars = ({ rating, interactive = false, onSelect, size = 14 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
            const icon = (
                <FiStar size={size} strokeWidth={1.5} className={star <= rating ? "fill-current text-ink" : "text-line-strong"} />
            );
            return interactive ? (
                <button key={star} type="button" onClick={() => onSelect(star)} className="rounded p-0.5 hover:bg-raised" aria-label={`${star} star${star > 1 ? "s" : ""}`}>
                    {icon}
                </button>
            ) : (
                <span key={star}>{icon}</span>
            );
        })}
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
            setFormMsg({ text: "Please write a comment", type: "error" });
            return;
        }
        setSubmitting(true);
        setFormMsg({ text: "", type: "" });
        try {
            await axios.post(`${API}/reviews`, { spec_id, ...form }, { withCredentials: true });
            setFormMsg({ text: "Thanks, your review is posted", type: "success" });
            setForm({ rating: 5, title: "", comment: "" });
            setShowForm(false);
            if (onFormClose) onFormClose();
            fetchReviews();
        } catch (err) {
            setFormMsg({
                text: err.response?.data?.message || "Couldn\u2019t post your review. Please log in first",
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
        if (!isLoggedIn) { alert("Please log in to vote"); return; }
        try {
            await axios.post(`${API}/reviews/vote`, { review_id, vote_type }, { withCredentials: true });
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || "Could not record vote.");
        }
    };

    const totalReviews = Number(stats?.total_reviews || 0);
    const avgRating = parseFloat(stats?.avg_rating || 0);

    const chip = (active) =>
        `h-8 rounded-lg border px-3 text-[13px] transition-colors duration-150 ease-out ${active ? "border-ink text-ink" : "border-line-strong text-ink-2 hover:text-ink"}`;

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">Reviews</h2>
                {isLoggedIn ? (
                    <button
                        type="button"
                        onClick={() => { setShowForm(!showForm); setFormMsg({ text: "", type: "" }); if (onFormClose && showForm) onFormClose(); }}
                        className="btn btn-secondary btn-sm"
                    >
                        {showForm ? "Cancel" : "Write a review"}
                    </button>
                ) : (
                    <p className="text-[13px] text-ink-3">
                        <a href="/auth/login" className="text-ink underline underline-offset-2">Log in</a> to write a review
                    </p>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
                    <div>
                        <p className="label">Rating</p>
                        <Stars rating={form.rating} interactive size={20} onSelect={(r) => setForm(f => ({ ...f, rating: r }))} />
                    </div>
                    <div>
                        <label className="label" htmlFor="review-title">Title <span className="font-normal text-ink-3">(optional)</span></label>
                        <input id="review-title" type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} maxLength={255} className="input" />
                    </div>
                    <div>
                        <label className="label" htmlFor="review-comment">Comment</label>
                        <textarea
                            id="review-comment"
                            value={form.comment}
                            onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="What did you like or dislike?"
                            rows={4}
                            required
                            className="input h-auto resize-none py-2"
                        />
                    </div>
                    {formMsg.text && formMsg.type === "error" && <p className="field-error">{formMsg.text}</p>}
                    <button type="submit" disabled={submitting} className="btn btn-primary">
                        {submitting ? "Posting" : "Post review"}
                    </button>
                </form>
            )}
            {formMsg.text && formMsg.type === "success" && <p className="mb-4 text-[13px] text-brand">{formMsg.text}</p>}

            {totalReviews > 0 && stats && (
                <div className="mb-6 flex gap-8">
                    <div className="shrink-0">
                        <p className="price text-[32px] leading-none text-ink">{avgRating.toFixed(1)}</p>
                        <div className="mt-2"><Stars rating={Math.round(avgRating)} /></div>
                        <p className="mt-1 text-xs text-ink-3">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                            const key = `${["five", "four", "three", "two", "one"][5 - star]}_star`;
                            const count = Number(stats[key] || 0);
                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-3 text-xs text-ink-3">
                                    <span className="price w-3">{star}</span>
                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-raised">
                                        <div className="h-full rounded-full bg-ink-2" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="price w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {totalReviews > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input h-8 w-auto pr-8 text-[13px]" aria-label="Sort reviews">
                        <option value="recent">Most recent</option>
                        <option value="helpful">Most helpful</option>
                        <option value="highest">Highest rating</option>
                        <option value="lowest">Lowest rating</option>
                    </select>
                    {[null, 5, 4, 3, 2, 1].map(r => (
                        <button key={r ?? "all"} type="button" onClick={() => setFilterRating(r)} className={chip(filterRating === r)}>
                            {r === null ? "All" : `${r} star`}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <p className="py-6 text-sm text-ink-3">Loading reviews</p>
            ) : reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
                    <p className="text-sm text-ink">No reviews yet</p>
                    <p className="mt-1 text-[13px] text-ink-3">Bought this? Tell other customers what you think</p>
                </div>
            ) : (
                <div className="divide-y divide-line border-y border-line">
                    {visibleReviews.map((review, idx) => (
                        <article key={review.review_id} className="py-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-[13px] text-ink-2">
                                        {(review.username || "U").charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <p className="text-sm text-ink">{review.username}</p>
                                        <p className="text-xs text-ink-3">
                                            {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                            {review.is_verified_purchase ? " · Verified purchase" : ""}
                                        </p>
                                    </div>
                                </div>
                                <Stars rating={review.rating} />
                            </div>

                            {review.title && <p className="mt-3 text-sm font-medium text-ink">{review.title}</p>}
                            <p className="mt-1 text-sm leading-6 text-ink-2">{review.comment}</p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-ink-3">
                                <button type="button" onClick={() => handleVote(review.review_id, "helpful")} className="inline-flex items-center gap-1.5 hover:text-ink">
                                    <FiThumbsUp size={13} strokeWidth={1.5} /> <span className="price">{review.helpful_count}</span>
                                </button>
                                <button type="button" onClick={() => handleVote(review.review_id, "unhelpful")} className="inline-flex items-center gap-1.5 hover:text-ink">
                                    <FiThumbsDown size={13} strokeWidth={1.5} /> <span className="price">{review.unhelpful_count}</span>
                                </button>
                                <div className="ml-auto flex items-center gap-4">
                                    {!showAll && idx === visibleReviews.length - 1 && reviews.length > INITIAL_SHOW && (
                                        <button type="button" onClick={() => setShowAll(true)} className="text-ink hover:underline">
                                            Show {reviews.length - INITIAL_SHOW} more
                                        </button>
                                    )}
                                    {showAll && idx === visibleReviews.length - 1 && reviews.length > INITIAL_SHOW && (
                                        <button type="button" onClick={() => setShowAll(false)} className="hover:text-ink">Show less</button>
                                    )}
                                    {isLoggedIn && (
                                        <button type="button" onClick={() => handleDelete(review.review_id)} className="hover:text-danger">Delete</button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
