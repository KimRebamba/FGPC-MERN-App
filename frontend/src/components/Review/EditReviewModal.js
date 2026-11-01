import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { reviewActions } from "../../actions/resourceActions"

const EditReviewModal = ({ review, isOpen, onClose, onUpdated }) => {
    const dispatch = useDispatch()
    const { saving } = useSelector((state) => state.reviews)

    const [form, setForm] = useState({
        rating: 5,
        title: "",
        description: ""
    })
    const [error, setError] = useState(null)

    useEffect(() => {
        if (review) {
            setForm({
                rating: review.rating || 5,
                title: review.title || "",
                description: review.description || ""
            })
            setError(null)
        }
    }, [review])

    if (!isOpen || !review) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const result = await dispatch(reviewActions.update(review._id, {
            rating: Number(form.rating),
            title: form.title,
            description: form.description
        }))

        if (result) {
            if (onUpdated) onUpdated(result)
            onClose()
        } else {
            setError("Failed to update review. Please check your inputs.")
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
            <div
                className="modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: "540px",
                    width: "90%",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "32px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
                }}
            >
                <h2 className="section-title" style={{ fontSize: "22px", marginBottom: "8px" }}>
                    Update Your Review
                </h2>
                <p style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "20px" }}>
                    {review.product?.name ? `Editing review for ${review.product.name}` : "Update your rating and feedback below."}
                </p>

                {error && <p className="form-error" style={{ marginBottom: "16px", fontSize: "14px" }}>{error}</p>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field" style={{ marginBottom: "16px" }}>
                        <label className="form-label" style={{ fontSize: "15px" }}>Rating</label>
                        <select
                            name="rating"
                            className="form-select"
                            value={form.rating}
                            onChange={handleChange}
                            style={{ fontSize: "15px", padding: "10px 14px" }}
                        >
                            <option value="5">★★★★★ (5 - Excellent)</option>
                            <option value="4">★★★★☆ (4 - Good)</option>
                            <option value="3">★★★☆☆ (3 - Average)</option>
                            <option value="2">★★☆☆☆ (2 - Below Average)</option>
                            <option value="1">★☆☆☆☆ (1 - Poor)</option>
                        </select>
                    </div>

                    <div className="form-field" style={{ marginBottom: "16px" }}>
                        <label className="form-label" style={{ fontSize: "15px" }}>Review Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Great fit, solid protection"
                            style={{ fontSize: "15px", padding: "10px 14px" }}
                            required
                        />
                    </div>

                    <div className="form-field" style={{ marginBottom: "22px" }}>
                        <label className="form-label" style={{ fontSize: "15px" }}>Feedback & Experience</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Share your detailed experience with this gear..."
                            style={{ fontSize: "15px", padding: "12px 14px" }}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            style={{ padding: "10px 22px", fontSize: "15px" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                            style={{ padding: "10px 24px", fontSize: "15px", fontWeight: 700 }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditReviewModal

