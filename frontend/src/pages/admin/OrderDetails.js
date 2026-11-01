import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"

const orderStatuses = ["pending", "paid", "shipped", "delivered", "completed", "cancelled", "refunded"]

const OrderDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()

    const { item: order, loading, saving, error, message } = useSelector((state) => state.orders)
    const [status, setStatus] = useState("")

    useEffect(() => {
        dispatch(orderActions.fetchOne(id))
    }, [dispatch, id])

    useEffect(() => {
        if (order) {
            setStatus(order.status)
        }
    }, [order])

    const handleSubmit = (event) => {
        event.preventDefault()
        dispatch(orderActions.updateStatus(id, status))
    }

    if (loading && !order) {
        return <Loader />
    }

    if (!order) {
        return (
            <div className="admin-page">
                <PageHeader title="Order details" />
                <ErrorMessage message={error || "Order not found"} />
            </div>
        )
    }

    const itemsTotal = order.items.reduce((total, item) => {
        return total + Number(item.priceSnapshot) * item.quantity
    }, 0)

    const address = order.shippingAddressSnapshot

    return (
        <div className="admin-page">
            <PageHeader title="Order details" description={"Placed " + formatDate(order.createdAt)}>
                <Link to="/admin/orders" className="secondary-button">Back to orders</Link>
            </PageHeader>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            <section className="admin-section">
                <h2 className="section-title">Status</h2>
                <p className="detail-row">Current: <StatusBadge value={order.status} /></p>

                {order.status === "completed" ? (
                    <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(198, 255, 0, 0.05)", border: "1px solid rgba(198, 255, 0, 0.2)" }}>
                        <p style={{ color: "var(--accent)", fontSize: "15px", fontWeight: 600, margin: 0 }}>
                            ✓ Order Completed on {formatDate(order.completedAt)}
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
                            Completed orders are finalized and cannot be modified.
                        </p>
                    </div>
                ) : order.status === "cancelled" ? (
                    <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(255, 68, 68, 0.08)", border: "1px solid rgba(255, 68, 68, 0.3)" }}>
                        <p style={{ color: "#ff5555", fontSize: "15px", fontWeight: 600, margin: 0 }}>
                            ✕ Order Cancelled on {formatDate(order.cancelledAt)}
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
                            Cancelled orders cannot be modified.
                        </p>
                    </div>
                ) : (
                    <form className="inline-form" onSubmit={handleSubmit}>
                        <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                            {orderStatuses.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving ? "Updating..." : "Update status"}
                        </button>
                    </form>
                )}

                <ul className="timeline">
                    <li>Shipped: {formatDate(order.shippedAt)}</li>
                    <li>Delivered: {formatDate(order.deliveredAt)}</li>
                    <li>Completed: {formatDate(order.completedAt)}</li>
                    <li>Cancelled: {formatDate(order.cancelledAt)}</li>
                </ul>
            </section>

            <section className="admin-section">
                <h2 className="section-title">Items</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="table-heading">Product</th>
                            <th className="table-heading">Price</th>
                            <th className="table-heading">Quantity</th>
                            <th className="table-heading">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item._id} className="table-row">
                                <td className="table-cell">{item.productNameSnapshot}</td>
                                <td className="table-cell">{formatPrice(item.priceSnapshot)}</td>
                                <td className="table-cell">{item.quantity}</td>
                                <td className="table-cell">{formatPrice(Number(item.priceSnapshot) * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="detail-total">Total: {formatPrice(itemsTotal)}</p>
            </section>

            <section className="admin-section">
                <h2 className="section-title">Shipping address</h2>
                <p className="detail-row">{address.recipientName} · {address.contactNumber}</p>
                <p className="detail-row">{address.street}, {address.barangay}</p>
                <p className="detail-row">{address.city}, {address.province} {address.postalCode}</p>
            </section>

            <section className="admin-section">
                <h2 className="section-title">Payment</h2>
                <p className="detail-row">{order.paymentMethod}</p>
            </section>
        </div>
    )
}

export default OrderDetails
