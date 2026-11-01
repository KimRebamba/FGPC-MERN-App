import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Loader from "../Layout/Loader"
import { formatDate } from "../../utils/formatDate"
import api from "../../api/axiosClient"

const Stars = ({ rating, max = 5 }) => {
    const stars = []

    for (let i = 1; i <= max; i++) {
        stars.push(
            <span key={i} className={"star" + (i <= Math.round(rating) ? " filled" : "")}>★</span>
        )
    }

    return <span className="stars-display" style={{ fontSize: "18px" }}>{stars}</span>
}

const ReviewItem = ({ review, currentUser, onReplySubmitted }) => {
    const [replyOpen, setReplyOpen] = useState(false)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const handleReplySubmit = async (e) => {
        e.preventDefault()
        if (!comment.trim()) return

        setSubmitting(true)
        setError(null)
        try {
            await api.post(`/reviews/${review._id}/replies`, {
                content: comment.trim(),
                comment: comment.trim()
            })
            setComment("")
            setReplyOpen(false)
            if (onReplySubmitted) {
                onReplySubmitted()
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to post reply")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <li className="review-item">
            <div className="review-header">
                <div className="review-author-info">
                    <span className="review-author">
                        {review.user
                            ? (review.user.firstName + " " + review.user.lastName).trim()
                            : "Customer"}
                    </span>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>

                <div className="review-rating">
                    <Stars rating={review.rating} />
                    <span style={{ fontSize: "16px", color: "var(--text-muted)", marginLeft: "4px" }}>
                        {review.rating}/5
                    </span>
                </div>
            </div>

            {review.title && (
                <p className="review-title">{review.title}</p>
            )}

            {review.description && (
                <p className="review-description">{review.description}</p>
            )}

            {/* Replies thread */}
            {Array.isArray(review.replies) && review.replies.length > 0 && (
                <div className="review-replies-list">
                    {review.replies.map((reply, idx) => {
                        const author = reply.authorId || reply.user
                        const authorName = author ? (author.firstName + " " + author.lastName).trim() : "User"
                        const authorRole = reply.authorRole || (reply.isAdminReply ? "admin" : author?.role || "customer")
                        const isAdmin = authorRole === "admin"
                        const replyText = reply.content || reply.comment

                        return (
                            <div
                                key={reply._id || idx}
                                className={`review-reply-item ${isAdmin ? "review-reply-item--admin" : ""}`}
                            >
                                <div className="review-reply-header">
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "16px" }}>
                                            {authorName}
                                        </span>
                                        {isAdmin ? (
                                            <span className="review-reply-badge review-reply-badge--admin">
                                                🛡️ Official Admin Response
                                            </span>
                                        ) : (
                                            <span className="review-reply-badge review-reply-badge--customer">
                                                👤 Customer
                                            </span>
                                        )}
                                    </div>
                                    <span className="review-date">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="review-reply-text">{replyText}</p>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Reply toggle & form */}
            <div style={{ marginTop: "14px" }}>
                {!replyOpen ? (
                    currentUser ? (
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "6px 16px", fontSize: "14px" }}
                            onClick={() => setReplyOpen(true)}
                        >
                            Reply
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "underline" }}
                        >
                            Sign in to reply
                        </Link>
                    )
                ) : (
                    <form className="review-reply-form" onSubmit={handleReplySubmit}>
                        {error && <p style={{ color: "var(--danger)", fontSize: "14px" }}>{error}</p>}
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="Write your reply..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ fontSize: "15px", padding: "12px" }}
                            required
                        />
                        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                            <button
                                type="submit"
                                className="primary-button"
                                style={{ padding: "6px 18px", fontSize: "14px" }}
                                disabled={submitting}
                            >
                                {submitting ? "Posting..." : "Post Reply"}
                            </button>
                            <button
                                type="button"
                                className="secondary-button"
                                style={{ padding: "6px 16px", fontSize: "14px" }}
                                onClick={() => {
                                    setReplyOpen(false)
                                    setComment("")
                                    setError(null)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </li>
    )
}

const ReviewList = ({ reviews, loading, onReplyAdded }) => {
    const { user: currentUser } = useSelector((state) => state.auth)

    if (loading) {
        return <Loader />
    }

    if (!reviews || reviews.length === 0) {
        return <p className="empty-state" style={{ fontSize: "16px" }}>No reviews yet. Be the first to review this product.</p>
    }

    return (
        <ul className="review-list">
            {reviews.map((review) => (
                <ReviewItem
                    key={review._id}
                    review={review}
                    currentUser={currentUser}
                    onReplySubmitted={onReplyAdded}
                />
            ))}
        </ul>
    )
}

export default ReviewList
