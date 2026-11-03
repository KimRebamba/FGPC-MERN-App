import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { reviewActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import { formatDate } from "../../utils/formatDate"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import api from "../../api/axiosClient"

const AvatarCircle = ({ user, size = 32, fallbackInitial = "U", isAdmin = false }) => {
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
                color: isAdmin ? "var(--accent)" : "#eee",
                border: isAdmin ? "1.5px solid var(--accent)" : "1.5px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: `${Math.max(11, Math.round(size * 0.42))}px`,
                flexShrink: 0,
                textTransform: "uppercase"
            }}
        >
            {initial}
        </div>
    )
}

const emptyFilters = { search: "", rating: "" }

const Stars = ({ rating }) => {
    return (
        <span style={{ color: "var(--accent)", fontSize: "16px", letterSpacing: "2px" }}>
            {"★".repeat(Math.round(rating)) + "☆".repeat(Math.max(0, 5 - Math.round(rating)))}
        </span>
    )
}

// [prof-requirements: MP2 - Review filter: search by product name & rating (5pts)]
// [prof-requirements: MP3 - Admin can delete a review (5pts)]
const Reviews = () => {
    const dispatch = useDispatch()
    const { items: reviews, count, loading, error, message } = useSelector((state) => state.reviews)
    const [filters, setFilters] = useState(emptyFilters)
    const [selectedReview, setSelectedReview] = useState(null)
    const [replyingReview, setReplyingReview] = useState(null)
    const [replyText, setReplyText] = useState("")
    const [replySaving, setReplySaving] = useState(false)
    const [replyError, setReplyError] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [deletingReplyId, setDeletingReplyId] = useState(null)

    useEffect(() => {
        dispatch(reviewActions.fetchAll(filters))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleFilterSubmit = (event) => {
        event.preventDefault()
        dispatch(reviewActions.fetchAll(filters))
    }

    const handleReset = () => {
        setFilters(emptyFilters)
        dispatch(reviewActions.fetchAll(emptyFilters))
    }

    const handleDeleteReview = async (id) => {
        setDeletingId(id)
        const success = await dispatch(reviewActions.remove(id))
        setDeletingId(null)
        if (success) {
            if (selectedReview && selectedReview._id === id) {
                setSelectedReview(null)
            }
            dispatch(reviewActions.fetchAll(filters))
        }
    }

    const handleDeleteReply = async (reviewId, replyId) => {
        setDeletingReplyId(replyId)
        try {
            await api.delete(`/reviews/${reviewId}/replies/${replyId}`)
            if (selectedReview && selectedReview._id === reviewId) {
                setSelectedReview((prev) => ({
                    ...prev,
                    replies: prev.replies.filter((r) => String(r._id) !== String(replyId))
                }))
            }
            dispatch(reviewActions.fetchAll(filters))
        } catch (err) {
            console.error("Failed to delete reply", err)
        } finally {
            setDeletingReplyId(null)
        }
    }

    const handleSendReply = async (e) => {
        e.preventDefault()
        if (!replyText.trim() || !replyingReview) return

        setReplySaving(true)
        setReplyError(null)
        try {
            await api.post(`/reviews/${replyingReview._id}/replies`, {
                content: replyText.trim(),
                comment: replyText.trim()
            })
            setReplyText("")
            setReplyingReview(null)
            dispatch(reviewActions.fetchAll(filters))
        } catch (err) {
            setReplyError(err.response?.data?.error || "Failed to submit reply")
        } finally {
            setReplySaving(false)
        }
    }

    const rows = reviews.map((review) => ({
        id: review._id,
        product: review.product?.name || "—",
        customer: review.user ? review.user.firstName + " " + review.user.lastName : "—",
        rating: review.rating + " / 5",
        title: review.title || "—",
        repliesCount: review.replies?.length || 0,
        created: formatDate(review.createdAt)
    }))

    const columns = [
        { key: "product", label: "Product", minWidth: 180, flex: 1 },
        { key: "customer", label: "Customer", minWidth: 140 },
        { key: "rating", label: "Rating", minWidth: 90 },
        { key: "title", label: "Title", minWidth: 160, flex: 1 },
        {
            key: "repliesCount",
            label: "Replies",
            minWidth: 90,
            render: (row) => <span>{row.repliesCount}</span>
        },
        { key: "created", label: "Written", minWidth: 110 },
        {
            key: "actions",
            label: "Actions",
            width: 260,
            minWidth: 250,
            render: (row) => {
                const fullItem = reviews.find((r) => r._id === row.id)
                const isDeleting = deletingId === row.id
                return (
                    <div className="table-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => setSelectedReview(fullItem)}
                        >
                            Details
                        </button>
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => {
                                setReplyingReview(fullItem)
                                setReplyText("")
                                setReplyError(null)
                            }}
                        >
                            Reply
                        </button>
                        <button
                            type="button"
                            className="danger-button"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => handleDeleteReview(row.id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Reviews" description={count + " review(s) on record (Admin moderation, replies & reply deletion)"} />

            <form className="filter-bar" onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search by review, product name, or rating..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    style={{ maxWidth: "340px", fontSize: "15px" }}
                />

                <select name="rating" className="form-select" value={filters.rating} onChange={handleFilterChange} style={{ maxWidth: "160px", fontSize: "15px" }}>
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>

                <button type="submit" className="primary-button" style={{ fontSize: "15px", padding: "10px 20px" }}>Apply</button>
                <button type="button" className="secondary-button" onClick={handleReset} style={{ fontSize: "15px", padding: "10px 20px" }}>Reset</button>
            </form>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No reviews found matching filter criteria" />
            )}

            
            {replyingReview && (
                <div className="modal-backdrop" onClick={() => setReplyingReview(null)}>
                    <div
                        className="modal-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "560px", width: "90%", background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}
                    >
                        <h2 className="section-title" style={{ marginBottom: "12px" }}>
                            Official Store Reply
                        </h2>
                        <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: "16px" }}>
                            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
                                {replyingReview.product?.name || "Product"} · {replyingReview.rating}/5 ★
                            </p>
                            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                By {replyingReview.user ? `${replyingReview.user.firstName} ${replyingReview.user.lastName}` : "Customer"}
                            </p>
                            <p style={{ fontSize: "15px", color: "var(--text)", marginTop: "8px" }}>
                                "{replyingReview.description || replyingReview.title || "No text"}"
                            </p>
                        </div>

                        <form onSubmit={handleSendReply} noValidate>
                            {replyError && <p style={{ color: "var(--danger)", fontSize: "14px", marginBottom: "8px" }}>{replyError}</p>}
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: "15px" }}>Write Official Response</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Enter store response to customer review..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    style={{ fontSize: "15px" }}
                                    required
                                />
                            </div>

                            <div className="form-actions" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                                <button type="submit" className="primary-button" disabled={replySaving} style={{ padding: "10px 22px", fontSize: "14px" }}>
                                    {replySaving ? "Sending..." : "Post Official Reply"}
                                </button>
                                <button type="button" className="secondary-button" onClick={() => setReplyingReview(null)} style={{ padding: "10px 22px", fontSize: "14px" }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            
            {selectedReview && (
                <div className="modal-backdrop" onClick={() => setSelectedReview(null)}>
                    <div
                        className="modal-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "680px", width: "92%", background: "var(--surface)", border: "1px solid var(--border)", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
                            <div>
                                <h2 className="section-title" style={{ fontSize: "22px", margin: "0 0 6px 0" }}>
                                    Review Details
                                </h2>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                                    Product: <strong style={{ color: "var(--text)" }}>{selectedReview.product?.name || "Gear Item"}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setSelectedReview(null)}
                                style={{ padding: "6px 14px", fontSize: "13px" }}
                            >
                                ✕ Close
                            </button>
                        </div>

                        
                        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)", padding: "20px", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Stars rating={selectedReview.rating} />
                                    <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                                        {selectedReview.title || "No Title"}
                                    </span>
                                </div>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                    {formatDate(selectedReview.createdAt)}
                                </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 12px 0" }}>
                                <AvatarCircle user={selectedReview.user} size={36} fallbackInitial="C" />
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                                    Author: <strong style={{ color: "var(--text)" }}>{selectedReview.user ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}` : "Customer"}</strong>
                                </p>
                            </div>

                            <p style={{ fontSize: "16px", color: "#EEEEEE", lineHeight: "1.6", margin: 0 }}>
                                {selectedReview.description || "(No written feedback provided)"}
                            </p>
                        </div>

                        
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
                                    Discussion Replies ({selectedReview.replies?.length || 0})
                                </h3>
                                <button
                                    type="button"
                                    className="primary-button"
                                    style={{ padding: "6px 14px", fontSize: "13px" }}
                                    onClick={() => {
                                        setReplyingReview(selectedReview)
                                        setSelectedReview(null)
                                    }}
                                >
                                    + Add Reply
                                </button>
                            </div>

                            {(!selectedReview.replies || selectedReview.replies.length === 0) ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", padding: "16px 0" }}>
                                    No replies have been submitted for this review yet.
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {selectedReview.replies.map((reply) => {
                                        const author = reply.authorId || reply.user
                                        const authorName = author ? `${author.firstName || ""} ${author.lastName || ""}`.trim() : "User"
                                        const authorRole = reply.authorRole || (reply.isAdminReply ? "admin" : author?.role || "customer")
                                        const isAdmin = authorRole === "admin"
                                        const isDeletingThis = deletingReplyId === reply._id

                                        return (
                                            <div
                                                key={reply._id}
                                                style={{
                                                    background: isAdmin ? "rgba(198, 255, 0, 0.04)" : "var(--bg)",
                                                    border: `1px solid ${isAdmin ? "rgba(198, 255, 0, 0.25)" : "var(--border)"}`,
                                                    padding: "16px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "8px"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <AvatarCircle user={author} size={28} fallbackInitial={isAdmin ? "A" : "U"} isAdmin={isAdmin} />
                                                        <span style={{ fontSize: "15px", fontWeight: 700, color: isAdmin ? "var(--accent)" : "var(--text)" }}>
                                                            {isAdmin ? "🛡️ Store Admin" : authorName}
                                                        </span>
                                                        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                                            {formatDate(reply.createdAt)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="danger-button"
                                                        style={{ padding: "4px 10px", fontSize: "12px" }}
                                                        onClick={() => handleDeleteReply(selectedReview._id, reply._id)}
                                                        disabled={isDeletingThis}
                                                    >
                                                        {isDeletingThis ? "Deleting..." : "Delete Reply"}
                                                    </button>
                                                </div>

                                                <p style={{ fontSize: "15px", color: "#DDDDDD", margin: 0, lineHeight: "1.5" }}>
                                                    {reply.content || reply.comment}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Reviews
