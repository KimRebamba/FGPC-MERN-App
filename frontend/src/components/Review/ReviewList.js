import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Loader from "../Layout/Loader"
import { formatDate } from "../../utils/formatDate"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import api from "../../api/axiosClient"

const AvatarCircle = ({ user, size = 42, fallbackInitial = "U", isAdmin = false }) => {
    const avatarUrl = user?.profilePath ? resolveImageUrl(user.profilePath) : null
    const initial = (user?.firstName?.[0] || user?.lastName?.[0] || fallbackInitial || "U").toUpperCase()

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={user?.firstName || "Avatar"}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: isAdmin ? "2px solid var(--accent)" : "1.5px solid #333",
                    flexShrink: 0,
                    display: "block"
                }}
            />
        )
    }

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                background: isAdmin ? "rgba(198, 255, 0, 0.15)" : "#222",
                color: isAdmin ? "var(--accent)" : "#fff",
                border: isAdmin ? "1.5px solid var(--accent)" : "1.5px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: `${Math.max(12, Math.round(size * 0.42))}px`,
                flexShrink: 0,
                textTransform: "uppercase"
            }}
        >
            {initial}
        </div>
    )
}

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
            <div className="review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <AvatarCircle user={review.user} size={44} fallbackInitial="C" />
                    <div className="review-author-info">
                        <span className="review-author">
                            {review.user
                                ? (review.user.firstName + " " + review.user.lastName).trim()
                                : "Customer"}
                        </span>
                        <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
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
                                <div className="review-reply-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <AvatarCircle user={author} size={30} fallbackInitial={isAdmin ? "A" : "U"} isAdmin={isAdmin} />
                                        <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "16px" }}>
                                            {authorName}
                                        </span>
                                        {isAdmin ? (
                                            <span className="review-reply-badge review-reply-badge--admin">
                                                🛡️ Admin
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
