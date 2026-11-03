import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions, reviewActions, returnRequestActions } from "../../actions/resourceActions"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import StatusBadge from "../../components/Form/StatusBadge"
import EditReviewModal from "../../components/Review/EditReviewModal"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"
import { orderTotal } from "../../utils/calculateTotal"

const Stars = ({ rating }) => {
    return (
        <span style={{ color: "var(--accent)", fontSize: "18px", letterSpacing: "2px" }}>
            {"★".repeat(Math.round(rating)) + "☆".repeat(Math.max(0, 5 - Math.round(rating)))}
        </span>
    )
}

const MyActivity = () => {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialTab = searchParams.get("tab") || "orders"
    const [activeTab, setActiveTab] = useState(initialTab)
    const [feedbackMessage, setFeedbackMessage] = useState(null)
    const [feedbackError, setFeedbackError] = useState(null)
    const [actionLoadingId, setActionLoadingId] = useState(null)
    const [editingReview, setEditingReview] = useState(null)

    const { items: orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders)
    const { items: reviews, loading: reviewsLoading, error: reviewsError } = useSelector((state) => state.reviews)
    const { items: returns, loading: returnsLoading, error: returnsError } = useSelector((state) => state.returnRequests)

    useEffect(() => {
        if (isAuthenticated && user?._id) {
            dispatch(orderActions.fetchAll())
            dispatch(reviewActions.fetchAll({ user: user._id }))
            dispatch(returnRequestActions.fetchAll({ user: user._id }))
        }
    }, [dispatch, isAuthenticated, user?._id])

    const handleTabSwitch = (tab) => {
        setActiveTab(tab)
        setSearchParams({ tab })
    }

    const handleCompleteOrder = async (orderId) => {
        setFeedbackMessage(null)
        setFeedbackError(null)
        setActionLoadingId(orderId)
        const result = await dispatch(orderActions.complete(orderId))
        setActionLoadingId(null)
        if (result) {
            setFeedbackMessage("Order completed! Thank you for confirming delivery.")
            dispatch(orderActions.fetchAll())
        } else {
            setFeedbackError("Failed to complete order. Please try again.")
        }
    }

    const handleCancelOrder = async (orderId) => {
        setFeedbackMessage(null)
        setFeedbackError(null)
        setActionLoadingId(orderId)
        const result = await dispatch(orderActions.cancel(orderId))
        setActionLoadingId(null)
        if (result) {
            setFeedbackMessage("Order has been cancelled.")
            dispatch(orderActions.fetchAll())
        } else {
            setFeedbackError("Failed to cancel order. Only pending orders can be cancelled.")
        }
    }

    const handleCancelReturn = async (returnId) => {
        setFeedbackMessage(null)
        setFeedbackError(null)
        setActionLoadingId(returnId)
        const result = await dispatch(returnRequestActions.cancel(returnId))
        setActionLoadingId(null)
        if (result) {
            setFeedbackMessage("Return request has been cancelled.")
            if (user?._id) {
                dispatch(returnRequestActions.fetchAll({ user: user._id }))
            }
        } else {
            setFeedbackError("Failed to cancel return request. Only pending requests can be cancelled.")
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="activity-page" style={{ padding: "80px 40px", textAlign: "center" }}>
                <h1 className="page-title" style={{ marginBottom: "20px" }}>My Activity</h1>
                <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "30px" }}>
                    Please sign in to view your orders, reviews, and returns.
                </p>
                <Link to="/login" state={{ from: "/activity" }} className="primary-button" style={{ display: "inline-flex", padding: "12px 32px" }}>
                    Sign in
                </Link>
            </div>
        )
    }

    return (
        <div className="activity-page" style={{ maxWidth: "1150px", margin: "0 auto", padding: "60px 40px" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 className="page-title" style={{ fontSize: "36px", marginBottom: "8px" }}>My Activity</h1>
                <p style={{ fontSize: "17px", color: "var(--text-muted)" }}>
                    Manage your gear orders, equipment reviews, and return requests.
                </p>
            </div>

            {feedbackMessage && (
                <p className="form-success" style={{ marginBottom: "24px", fontSize: "16px", padding: "14px 20px" }}>
                    {feedbackMessage}
                </p>
            )}
            {feedbackError && (
                <p className="form-error" style={{ marginBottom: "24px", fontSize: "16px", padding: "14px 20px" }}>
                    {feedbackError}
                </p>
            )}

            
            <div className="profile-tabs" style={{ marginBottom: "36px" }}>
                <button
                    type="button"
                    className={"profile-tab" + (activeTab === "orders" ? " active" : "")}
                    onClick={() => handleTabSwitch("orders")}
                    style={{ fontSize: "17px", padding: "14px 28px", fontWeight: 600 }}
                >
                    Orders ({orders.length})
                </button>
                <button
                    type="button"
                    className={"profile-tab" + (activeTab === "reviews" ? " active" : "")}
                    onClick={() => handleTabSwitch("reviews")}
                    style={{ fontSize: "17px", padding: "14px 28px", fontWeight: 600 }}
                >
                    My Reviews ({reviews.length})
                </button>
                <button
                    type="button"
                    className={"profile-tab" + (activeTab === "returns" ? " active" : "")}
                    onClick={() => handleTabSwitch("returns")}
                    style={{ fontSize: "17px", padding: "14px 28px", fontWeight: 600 }}
                >
                    My Returns ({returns.length})
                </button>
            </div>

            
            {activeTab === "orders" && (
                <div>
                    <ErrorMessage message={ordersError} />

                    {ordersLoading && orders.length === 0 ? (
                        <Loader />
                    ) : orders.length === 0 ? (
                        <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
                            <p style={{ fontSize: "20px", marginBottom: "20px" }}>You have not placed any orders yet.</p>
                            <Link to="/products" className="secondary-button" style={{ display: "inline-flex", padding: "14px 32px", fontSize: "16px" }}>
                                Explore Motorcycle Gear
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                            {orders.map((order) => {
                                const total = orderTotal(order.items)
                                const isDelivered = order.status === "delivered"
                                const isPending = order.status === "pending"
                                const isActionBusy = actionLoadingId === order._id

                                return (
                                    <div
                                        key={order._id}
                                        style={{
                                            background: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            padding: "32px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "20px"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "18px" }}>
                                            <div>
                                                <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", letterSpacing: "0.03em" }}>
                                                    Order #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                                <span style={{ fontSize: "15px", color: "var(--text-muted)", marginLeft: "16px" }}>
                                                    Placed on {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                            <StatusBadge value={order.status} />
                                        </div>

                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                            {order.items.map((it) => (
                                                <div key={it._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", fontSize: "17px" }}>
                                                    <span style={{ color: "var(--text)", fontWeight: 500 }}>
                                                        {it.productNameSnapshot} <span style={{ color: "var(--text-muted)", fontSize: "15px" }}>× {it.quantity}</span>
                                                    </span>
                                                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                                                        {formatPrice(Number(it.priceSnapshot) * it.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "10px" }}>
                                            <div>
                                                <span style={{ fontSize: "15px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                    Payment: {order.paymentMethod.toUpperCase()} · Total:
                                                </span>{" "}
                                                <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>
                                                    {formatPrice(total)}
                                                </span>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                                {isDelivered && (
                                                    <button
                                                        type="button"
                                                        className="primary-button"
                                                        onClick={() => handleCompleteOrder(order._id)}
                                                        disabled={isActionBusy}
                                                        style={{ padding: "10px 22px", fontSize: "15px", fontWeight: 700 }}
                                                    >
                                                        {isActionBusy ? "Completing..." : "Complete Order"}
                                                    </button>
                                                )}

                                                {isPending && (
                                                    <button
                                                        type="button"
                                                        className="danger-button"
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        disabled={isActionBusy}
                                                        style={{ padding: "10px 20px", fontSize: "15px" }}
                                                    >
                                                        {isActionBusy ? "Cancelling..." : "Cancel Order"}
                                                    </button>
                                                )}

                                                <Link
                                                    to={"/orders/" + order._id}
                                                    className="secondary-button"
                                                    style={{ padding: "10px 24px", fontSize: "15px" }}
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            
            {activeTab === "reviews" && (
                <div>
                    <ErrorMessage message={reviewsError} />

                    {reviewsLoading && reviews.length === 0 ? (
                        <Loader />
                    ) : reviews.length === 0 ? (
                        <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
                            <p style={{ fontSize: "20px", marginBottom: "16px" }}>You haven't written any reviews yet.</p>
                            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                                Once your orders are delivered, you can review your gear from your order details page.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {reviews.map((rev) => (
                                <div
                                    key={rev._id}
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        padding: "28px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                            <Stars rating={rev.rating} />
                                            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                                                {rev.title || rev.product?.name || "Product Review"}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <span style={{ fontSize: "15px", color: "var(--text-muted)" }}>
                                                {formatDate(rev.createdAt)}
                                            </span>
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                style={{ padding: "6px 14px", fontSize: "13px" }}
                                                onClick={() => setEditingReview(rev)}
                                            >
                                                Edit Review
                                            </button>
                                        </div>
                                    </div>

                                    {rev.product?.name && (
                                        <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>
                                            Product: <strong style={{ color: "var(--text)" }}>{rev.product.name}</strong>
                                        </p>
                                    )}

                                    {rev.description && (
                                        <p style={{ fontSize: "17px", color: "#ddd", lineHeight: "1.6", margin: "4px 0 0 0" }}>
                                            {rev.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            
            {activeTab === "returns" && (
                <div>
                    <ErrorMessage message={returnsError} />

                    {returnsLoading && returns.length === 0 ? (
                        <Loader />
                    ) : returns.length === 0 ? (
                        <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
                            <p style={{ fontSize: "20px", marginBottom: "16px" }}>No return requests on file.</p>
                            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                                If you need to return gear from an order that has been delivered, open the order from the Orders tab to submit a return request.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {returns.map((ret) => {
                                const isActionBusy = actionLoadingId === ret._id
                                return (
                                    <div
                                        key={ret._id}
                                        style={{
                                            background: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            padding: "28px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "16px"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                                            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                                                Return Request: {ret.requestNumber}
                                            </span>
                                            <StatusBadge value={ret.status} />
                                        </div>

                                        <div style={{ fontSize: "16px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <p style={{ margin: 0 }}>
                                                Order Reference: #{ret.order?._id ? ret.order._id.slice(-6).toUpperCase() : (typeof ret.order === "string" ? ret.order.slice(-6).toUpperCase() : "—")}
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                Items for return: {ret.items?.length || 1}
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                Date filed: {formatDate(ret.createdAt)}
                                            </p>
                                            {ret.resolution && (
                                                <p style={{ color: "var(--accent)", margin: 0, fontWeight: 600 }}>
                                                    Resolution: {ret.resolution}
                                                </p>
                                            )}
                                            {ret.adminNotes && (
                                                <p style={{ color: "#eee", margin: 0 }}>
                                                    Note from Admin: {ret.adminNotes}
                                                </p>
                                            )}
                                        </div>

                                        {ret.status === "pending" && (
                                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                                                <button
                                                    type="button"
                                                    className="danger-button"
                                                    onClick={() => handleCancelReturn(ret._id)}
                                                    disabled={isActionBusy}
                                                    style={{ padding: "10px 22px", fontSize: "14px" }}
                                                >
                                                    {isActionBusy ? "Cancelling..." : "Cancel Return Request"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            <EditReviewModal
                review={editingReview}
                isOpen={Boolean(editingReview)}
                onClose={() => setEditingReview(null)}
                onUpdated={() => {
                    if (user?._id) {
                        dispatch(reviewActions.fetchAll({ user: user._id }))
                    }
                }}
            />
        </div>
    )
}

export default MyActivity
