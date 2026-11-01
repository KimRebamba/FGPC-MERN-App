import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { reviewActions } from "../../actions/resourceActions"
import FormField from "../Form/FormField"
import ErrorMessage from "../Layout/ErrorMessage"

const ReviewForm = ({ productId, orderId, onReviewSubmitted }) => {
    const dispatch = useDispatch()
    const { saving, error, message } = useSelector((state) => state.reviews)

    const [form, setForm] = useState({ rating: "5", title: "", description: "" })
    const [saved, setSaved] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({ ...previous, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const review = await dispatch(reviewActions.create({
            product: productId,
            order: orderId,
            rating: Number(form.rating),
            title: form.title,
            description: form.description
        }))

        if (review) {
            setSaved(true)
            setForm({ rating: "5", title: "", description: "" })
            if (onReviewSubmitted) {
                onReviewSubmitted(review)
            }
        }
    }

    return (
        <details className="review-form-wrapper">
            <summary className="review-form-summary">
                {saved ? "Review submitted" : "Write a review"}
            </summary>

            <form className="review-form" onSubmit={handleSubmit}>
                <ErrorMessage message={error} />
                {message && saved && <p className="form-success">{message}</p>}

                <div className="form-field">
                    <label htmlFor={"rating-" + productId} className="form-label">Rating</label>
                    <select
                        id={"rating-" + productId}
                        name="rating"
                        className="form-select"
                        value={form.rating}
                        onChange={handleChange}
                    >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Okay</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Bad</option>
                    </select>
                </div>

                <FormField label="Title" name="title" value={form.title} onChange={handleChange} />
                <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />

                <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? "Submitting..." : "Submit review"}
                </button>
            </form>
        </details>
    )
}

export default ReviewForm
