import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { reviewActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import { formatDate } from "../../utils/formatDate"

const Reviews = () => {
    const dispatch = useDispatch()
    const { items: reviews, count, loading, error, message } = useSelector((state) => state.reviews)

    useEffect(() => {
        dispatch(reviewActions.fetchAll())
    }, [dispatch])

    const handleDelete = (id) => {
        if (window.confirm("Delete this review?")) {
            dispatch(reviewActions.remove(id))
        }
    }

    const rows = reviews.map((review) => ({
        id: review._id,
        product: review.product?.name || "—",
        customer: review.user ? review.user.firstName + " " + review.user.lastName : "—",
        rating: review.rating + " / 5",
        title: review.title || "—",
        verified: review.isVerifiedPurchase ? "yes" : "no",
        created: formatDate(review.createdAt)
    }))

    const columns = [
        { key: "product", label: "Product" },
        { key: "customer", label: "Customer" },
        { key: "rating", label: "Rating" },
        { key: "title", label: "Title" },
        { key: "verified", label: "Verified" },
        { key: "created", label: "Written" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <button type="button" className="table-button" onClick={() => handleDelete(row.id)}>
                        Delete
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Reviews" description={count + " review(s) on record"} />

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No reviews yet" />
            )}
        </div>
    )
}

export default Reviews
