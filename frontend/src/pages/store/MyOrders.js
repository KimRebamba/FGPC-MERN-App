import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions } from "../../actions/resourceActions"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"
import { orderTotal } from "../../utils/calculateTotal"

const MyOrders = () => {
    const dispatch = useDispatch()
    const { items: orders, count, loading, error } = useSelector((state) => state.orders)

    useEffect(() => {
        dispatch(orderActions.fetchAll())
    }, [dispatch])

    if (loading && orders.length === 0) {
        return <Loader />
    }

    return (
        <div className="my-orders">
            <h1 className="page-title">Your orders ({count})</h1>

            <ErrorMessage message={error} />

            {orders.length === 0 ? (
                <p className="empty-state">
                    No orders yet. <Link to="/" className="table-link">Start shopping</Link>
                </p>
            ) : (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order._id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-number">Order {order._id.slice(-6)}</span>
                                <StatusBadge value={order.status} />
                            </div>

                            <p className="order-meta">Placed {formatDate(order.createdAt)}</p>
                            <p className="order-meta">{order.items.length} item(s) · {order.paymentMethod}</p>
                            <p className="order-total">{formatPrice(orderTotal(order.items))}</p>

                            <Link
                                to={"/orders/" + order._id}
                                className="secondary-button"
                                style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: "12px" }}
                            >
                                View order
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default MyOrders
