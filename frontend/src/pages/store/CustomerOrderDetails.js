import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions, returnRequestActions, reviewActions } from "../../actions/resourceActions"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import StatusBadge from "../../components/Form/StatusBadge"
import ReviewForm from "../../components/Review/ReviewForm"
import EditReviewModal from "../../components/Review/EditReviewModal"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"
import { orderTotal } from "../../utils/calculateTotal"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

const statusSteps = ["pending", "paid", "shipped", "delivered"]

const Stars = ({ rating }) => {
    return (
        <span style={{ color: "var(--accent)", fontSize: "18px", letterSpacing: "2px" }}>
            {"★".repeat(Math.round(rating)) + "☆".repeat(Math.max(0, 5 - Math.round(rating)))}
        </span>
    )
}

const CustomerOrderDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { user } = useAuth()

    const { item: order, loading, error } = useSelector((state) => state.orders)
    const { items: reviews } = useSelector((state) => state.reviews)
    const { items: returns, saving: returnSaving } = useSelector((state) => state.returnRequests)

    const [returnItemId, setReturnItemId] = useState(null)
    const [returnReason, setReturnReason] = useState("Wrong size / fit")
    const [returnQuantity, setReturnQuantity] = useState(1)
    const [editingReview, setEditingReview] = useState(null)
    const [actionSuccess, setActionSuccess] = useState(null)
    const [actionError, setActionError] = useState(null)
    const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

    useEffect(() => {
        dispatch(orderActions.fetchOne(id))
        if (user?._id) {
            dispatch(reviewActions.fetchAll({ user: user._id }))
            dispatch(returnRequestActions.fetchAll({ user: user._id }))
        }
    }, [dispatch, id, user?._id])

    const handleCompleteOrder = async () => {
        setActionError(null)
        setActionSuccess(null)
        setIsUpdatingOrder(true)
        const result = await dispatch(orderActions.complete(order._id))
        setIsUpdatingOrder(false)
        if (result) {
            setActionSuccess("Order completed! Thank you for confirming receipt of your gear.")
            dispatch(orderActions.fetchOne(id))
        } else {
            setActionError("Unable to complete order. Please try again.")
        }
    }

    const handleCancelOrder = async () => {
        setActionError(null)
        setActionSuccess(null)
        setIsUpdatingOrder(true)
        const result = await dispatch(orderActions.cancel(order._id))
        setIsUpdatingOrder(false)
        if (result) {
            setActionSuccess("Your order has been cancelled successfully.")
            dispatch(orderActions.fetchOne(id))
        } else {
            setActionError("Unable to cancel order. Orders can only be cancelled while pending.")
        }
    }

    const handleCancelReturn = async (returnId) => {
        setActionError(null)
        setActionSuccess(null)
        const result = await dispatch(returnRequestActions.cancel(returnId))
        if (result) {
            setActionSuccess("Return request has been cancelled.")
            if (user?._id) {
                dispatch(returnRequestActions.fetchAll({ user: user._id }))
            }
        } else {
            setActionError("Unable to cancel return request. Only pending requests can be cancelled.")
        }
    }

    const handleReturnSubmit = async (event, orderItem) => {
        event.preventDefault()
        setActionError(null)
        setActionSuccess(null)

        const result = await dispatch(returnRequestActions.create({
            order: order._id,
            items: [
                {
                    orderItemId: orderItem._id,
                    productId: orderItem.product?._id || orderItem.product,
                    quantity: Number(returnQuantity),
                    reason: returnReason
                }
            ]
        }))

        if (result) {
            setActionSuccess("Return request filed successfully! Our team will review it shortly.")
            setReturnItemId(null)
            if (user?._id) {
                dispatch(returnRequestActions.fetchAll({ user: user._id }))
            }
        } else {
            setActionError("Failed to submit return request. Please try again.")
        }
    }

    if (loading && !order) {
        return <Loader />
    }

    if (!order) {
        return (
            <div className="order-details-page" style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px" }}>
                <Link to="/activity" className="secondary-button" style={{ display: "inline-flex", padding: "12px 24px", fontSize: "16px", marginBottom: "24px" }}>
                    ← Back to My Activity
                </Link>
                <h1 className="page-title" style={{ fontSize: "36px" }}>Order Details</h1>
                <ErrorMessage message={error || "Order not found"} />
            </div>
        )
    }

    const address = order.shippingAddressSnapshot || {}
    const isDelivered = order.status === "delivered" || order.status === "completed"
    const isCompleted = order.status === "completed"
    const isPending = order.status === "pending"
    const currentStepIndex = statusSteps.indexOf(order.status)
    const totalAmount = orderTotal(order.items)

    return (
        <div className="order-details-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px" }}>
            {/* Back button */}
            <div style={{ marginBottom: "28px" }}>
                <Link
                    to="/activity"
                    className="secondary-button"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "16px" }}
                >
                    ← Back to My Activity
                </Link>
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "24px", marginBottom: "32px" }}>
                <div>
                    <span style={{ fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", display: "block", marginBottom: "8px", fontWeight: 600 }}>
                        Official FGP Order
                    </span>
                    <h1 className="page-title" style={{ fontSize: "36px", margin: 0 }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                    </h1>
                    <p style={{ fontSize: "16px", color: "var(--text-muted)", marginTop: "8px" }}>
                        Placed on {formatDate(order.createdAt)} · Order ID: <code style={{ color: "var(--text)", fontSize: "15px" }}>{order._id}</code>
                    </p>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                    <StatusBadge value={order.status} />
                    {order.deliveredAt && (
                        <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>
                            Delivered on {formatDate(order.deliveredAt)}
                        </p>
                    )}
                </div>
            </div>

            <ErrorMessage message={error} />
            {actionSuccess && <p className="form-success" style={{ marginBottom: "24px", fontSize: "16px", padding: "14px 20px" }}>{actionSuccess}</p>}
            {actionError && <p className="form-error" style={{ marginBottom: "24px", fontSize: "16px", padding: "14px 20px" }}>{actionError}</p>}

            {/* Order Action Banner for Customer */}
            {order.status === "delivered" && (
                <div style={{ background: "rgba(198, 255, 0, 0.08)", border: "1px solid var(--accent)", padding: "24px 30px", marginBottom: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                    <div>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent)", margin: "0 0 6px 0" }}>
                            Has your gear arrived safely?
                        </h3>
                        <p style={{ fontSize: "16px", color: "var(--text)", margin: 0 }}>
                            Click below to complete your order. Once completed, your order is final and returns are closed.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleCompleteOrder}
                        disabled={isUpdatingOrder}
                        style={{ padding: "14px 32px", fontSize: "16px", fontWeight: 700 }}
                    >
                        {isUpdatingOrder ? "Completing..." : "Complete Order"}
                    </button>
                </div>
            )}

            {isPending && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px 30px", marginBottom: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                    <div>
                        <h3 style={{ fontSize: "19px", fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>
                            Need to make changes?
                        </h3>
                        <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>
                            You can cancel this order while it is still pending confirmation.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="danger-button"
                        onClick={handleCancelOrder}
                        disabled={isUpdatingOrder}
                        style={{ padding: "12px 28px", fontSize: "15px" }}
                    >
                        {isUpdatingOrder ? "Cancelling..." : "Cancel Order"}
                    </button>
                </div>
            )}

            {isCompleted && (
                <div style={{ background: "rgba(198, 255, 0, 0.05)", border: "1px solid rgba(198, 255, 0, 0.3)", padding: "20px 28px", marginBottom: "36px" }}>
                    <p style={{ fontSize: "16px", color: "var(--accent)", margin: 0, fontWeight: 600 }}>
                        ✓ Order Completed — Thank you for riding with FGP!
                    </p>
                </div>
            )}

            {/* Visual Step Tracker (for active orders) */}
            {order.status !== "cancelled" && order.status !== "refunded" && (
                <div className="order-progress-tracker" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px 36px", marginBottom: "36px" }}>
                    <p style={{ fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px", fontWeight: 600 }}>
                        Order Progress
                    </p>
                    <div className="order-progress-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", position: "relative" }}>
                        {statusSteps.map((step, idx) => {
                            const isReached = currentStepIndex >= idx
                            const isCurrent = order.status === step
                            return (
                                <div key={step} style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            height: "5px",
                                            background: isReached ? "var(--accent)" : "var(--border)",
                                            marginBottom: "14px",
                                            transition: "background 0.3s ease"
                                        }}
                                    />
                                    <p style={{
                                        fontSize: "15px",
                                        fontWeight: isCurrent ? 700 : 500,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        color: isCurrent ? "var(--accent)" : isReached ? "var(--text)" : "var(--text-dim)"
                                    }}>
                                        {step}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Main content grid */}
            <div className="customer-order-details-layout" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "40px", alignItems: "start" }}>
                {/* Left: Items list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "32px" }}>
                        <h2 className="section-title" style={{ fontSize: "22px", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                            Items in this Order ({order.items.length})
                        </h2>

                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "32px" }}>
                            {order.items.map((item) => {
                                const productId = item.product?._id || item.product
                                const image = resolveImageUrl(item.product?.images?.[0]?.imagePath)
                                const subtotal = Number(item.priceSnapshot) * item.quantity
                                const isReturningThis = returnItemId === item._id

                                // Check if user already reviewed this item
                                const existingReview = (reviews || []).find((rev) => {
                                    const matchOrder = String(rev.order?._id || rev.order) === String(order._id)
                                    const matchProduct = String(rev.product?._id || rev.product) === String(productId)
                                    return matchOrder && matchProduct
                                })

                                // Check if user already filed a return request for this item
                                const existingReturn = (returns || []).find((ret) => {
                                    const matchOrder = String(ret.order?._id || ret.order) === String(order._id)
                                    if (!matchOrder) return false
                                    return (ret.items || []).some((retItem) => {
                                        const matchItemId = String(retItem.orderItemId) === String(item._id)
                                        const matchProdId = String(retItem.productId?._id || retItem.productId) === String(productId)
                                        return matchItemId || matchProdId
                                    })
                                })

                                const returnItemDetails = existingReturn?.items?.find((retItem) => {
                                    return String(retItem.orderItemId) === String(item._id) || String(retItem.productId?._id || retItem.productId) === String(productId)
                                })

                                return (
                                    <li
                                        key={item._id}
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            paddingBottom: "32px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "20px"
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={item.productNameSnapshot}
                                                    style={{ width: "96px", height: "96px", objectFit: "cover", border: "1px solid var(--border)", background: "#0A0A0A" }}
                                                />
                                            ) : (
                                                <div style={{ width: "96px", height: "96px", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                                                    No image
                                                </div>
                                            )}

                                            <div style={{ flex: 1 }}>
                                                <Link
                                                    to={"/products/" + productId}
                                                    style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
                                                >
                                                    {item.productNameSnapshot}
                                                </Link>
                                                <p style={{ fontSize: "16px", color: "var(--text-muted)", marginTop: "6px" }}>
                                                    {formatPrice(item.priceSnapshot)} × {item.quantity}
                                                </p>
                                                <p style={{ fontSize: "20px", color: "var(--accent)", fontWeight: 700, marginTop: "8px" }}>
                                                    Subtotal: {formatPrice(subtotal)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Activity state container (Reviews & Returns) */}
                                        <div style={{ background: "var(--surface-2)", padding: "20px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {/* Review Section */}
                                            {existingReview ? (
                                                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "18px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <Stars rating={existingReview.rating} />
                                                            <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>
                                                                {existingReview.title || "Your Review"}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <span style={{ fontSize: "13px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                                                                ✓ Review Submitted
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                style={{ padding: "4px 12px", fontSize: "12px" }}
                                                                onClick={() => setEditingReview(existingReview)}
                                                            >
                                                                Edit Review
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {existingReview.description && (
                                                        <p style={{ fontSize: "15px", color: "var(--text)", margin: "8px 0 0 0", lineHeight: "1.6" }}>
                                                            {existingReview.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : isDelivered ? (
                                                <ReviewForm
                                                    productId={productId}
                                                    orderId={order._id}
                                                    onReviewSubmitted={() => {
                                                        if (user?._id) {
                                                            dispatch(reviewActions.fetchAll({ user: user._id }))
                                                        }
                                                    }}
                                                />
                                            ) : null}

                                            {/* Return Section */}
                                            {existingReturn ? (
                                                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "18px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                                                        <div>
                                                            <span style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>
                                                                Return Request #{existingReturn.requestNumber}
                                                            </span>
                                                            <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>
                                                                Reason: {returnItemDetails?.reason || "Item Return"} ({returnItemDetails?.quantity || 1} unit)
                                                            </span>
                                                        </div>
                                                        <StatusBadge value={existingReturn.status} />
                                                    </div>
                                                    {existingReturn.adminNotes && (
                                                        <p style={{ fontSize: "14px", color: "var(--accent)", margin: "6px 0 0 0" }}>
                                                            Admin Note: {existingReturn.adminNotes}
                                                        </p>
                                                    )}
                                                    {existingReturn.status === "pending" && (
                                                        <div style={{ marginTop: "12px" }}>
                                                            <button
                                                                type="button"
                                                                className="danger-button"
                                                                style={{ padding: "8px 18px", fontSize: "13px" }}
                                                                onClick={() => handleCancelReturn(existingReturn._id)}
                                                            >
                                                                Cancel Return Request
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : isCompleted ? (
                                                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                                                    Order completed. Returns are no longer accepted for this item.
                                                </p>
                                            ) : order.status === "delivered" ? (
                                                <div>
                                                    {!isReturningThis ? (
                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            style={{ padding: "8px 20px", fontSize: "14px" }}
                                                            onClick={() => {
                                                                setReturnItemId(item._id)
                                                                setReturnQuantity(item.quantity)
                                                            }}
                                                        >
                                                            Request return for this item
                                                        </button>
                                                    ) : (
                                                        <form onSubmit={(e) => handleReturnSubmit(e, item)} style={{ display: "flex", flexDirection: "column", gap: "14px", background: "var(--bg)", padding: "20px", border: "1px solid var(--border)" }}>
                                                            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
                                                                File Return for: {item.productNameSnapshot}
                                                            </p>

                                                            <div className="form-field">
                                                                <label className="form-label" style={{ fontSize: "15px" }}>Return Reason</label>
                                                                <select
                                                                    className="form-select"
                                                                    value={returnReason}
                                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                                    style={{ fontSize: "15px" }}
                                                                >
                                                                    <option value="Wrong size / fit">Wrong size / fit</option>
                                                                    <option value="Defective / damaged item">Defective / damaged item</option>
                                                                    <option value="Item not as described">Item not as described</option>
                                                                    <option value="Changed mind">Changed mind</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-field">
                                                                <label className="form-label" style={{ fontSize: "15px" }}>Return Quantity (Max: {item.quantity})</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-input"
                                                                    min="1"
                                                                    max={item.quantity}
                                                                    value={returnQuantity}
                                                                    onChange={(e) => setReturnQuantity(e.target.value)}
                                                                    style={{ fontSize: "15px" }}
                                                                />
                                                            </div>

                                                            <div style={{ display: "flex", gap: "12px" }}>
                                                                <button type="submit" className="primary-button" disabled={returnSaving} style={{ padding: "10px 22px", fontSize: "14px" }}>
                                                                    {returnSaving ? "Submitting..." : "Confirm return"}
                                                                </button>
                                                                <button type="button" className="secondary-button" onClick={() => setReturnItemId(null)} style={{ padding: "10px 22px", fontSize: "14px" }}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                                                    Reviews and return requests will unlock once your items are delivered.
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                {/* Right: Order Summary, Shipping & Payment */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    {/* Financial Summary */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
                        <h2 className="section-title" style={{ fontSize: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                            Payment Summary
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)" }}>Items Subtotal</span>
                                <span style={{ color: "var(--text)", fontWeight: 500 }}>{formatPrice(totalAmount)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)" }}>Shipping Fee</span>
                                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Free Shipping</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)" }}>Tax</span>
                                <span style={{ color: "var(--text)" }}>Included</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
                                <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>Total Paid</span>
                                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent)" }}>{formatPrice(totalAmount)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)", fontSize: "15px", color: "var(--text-muted)" }}>
                            <p style={{ margin: 0 }}>Payment Method: <strong style={{ color: "var(--text)", textTransform: "uppercase" }}>{order.paymentMethod}</strong></p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
                        <h2 className="section-title" style={{ fontSize: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                            Shipping Destination
                        </h2>

                        <div style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--text)" }}>
                            <p style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
                                {address.recipientName || "Valued Customer"}
                            </p>
                            <p style={{ color: "var(--text-muted)", marginBottom: "6px" }}>
                                Phone: {address.contactNumber || "—"}
                            </p>
                            <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
                                {address.street}{address.barangay ? ", " + address.barangay : ""}
                            </p>
                            <p style={{ color: "var(--text-muted)", margin: 0 }}>
                                {address.city}, {address.province} {address.postalCode}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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

export default CustomerOrderDetails
