import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const emptyFilters = { search: "", status: "", paymentMethod: "" }

const Orders = () => {
    const dispatch = useDispatch()
    const { items: orders, count, loading, error, message } = useSelector((state) => state.orders)
    const [filters, setFilters] = useState(emptyFilters)

    useEffect(() => {
        dispatch(orderActions.fetchAll(filters))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleFilterSubmit = (event) => {
        event.preventDefault()
        dispatch(orderActions.fetchAll(filters))
    }

    const handleReset = () => {
        setFilters(emptyFilters)
        dispatch(orderActions.fetchAll(emptyFilters))
    }

    const handleRestore = async (id) => {
        const res = await dispatch(orderActions.updateStatus(id, null, { restore: true }))
        if (res) {
            dispatch(orderActions.fetchAll(filters))
        }
    }

    const rows = orders.map((order) => {
        const isDeleted = Boolean(order.deletedAt)
        return {
            id: order._id,
            customer: order.recipientName || (order.user ? order.user.firstName + " " + order.user.lastName : "—"),
            email: order.user?.email || "—",
            items: order.items?.length || 0,
            status: isDeleted ? "deleted" : order.status,
            payment: order.paymentMethod?.toUpperCase() || "—",
            placedAt: formatDate(order.createdAt),
            isDeleted
        }
    })

    const columns = [
        { key: "id", label: "Order ID", minWidth: 140, render: (row) => <span style={{ fontFamily: "monospace" }}>#{row.id.slice(-6).toUpperCase()}</span> },
        { key: "customer", label: "Customer", minWidth: 160, flex: 1 },
        { key: "email", label: "Email", minWidth: 190, flex: 1.2 },
        { key: "items", label: "Items", minWidth: 80 },
        { key: "payment", label: "Payment", minWidth: 100 },
        { key: "status", label: "Status", minWidth: 120, render: (row) => <StatusBadge value={row.status} /> },
        { key: "placedAt", label: "Placed", minWidth: 130 },
        {
            key: "actions",
            label: "Actions",
            width: 150,
            minWidth: 140,
            render: (row) => (
                <div className="table-actions">
                    <Link
                        to={"/admin/orders/" + row.id}
                        className="secondary-button"
                        style={{ padding: "5px 12px", fontSize: "13px" }}
                    >
                        Details
                    </Link>
                    {row.isDeleted && (
                        <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => handleRestore(row.id)}
                        >
                            Restore
                        </button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Orders" description={count + " order(s) recorded"} />

            <form className="filter-bar" onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search order #, customer, phone..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    style={{ maxWidth: "260px" }}
                />

                <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: "190px" }}>
                    <option value="">All Active Orders</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                    <option value="deleted">Soft-Deleted (Trash)</option>
                    <option value="all">All (including deleted)</option>
                </select>

                <select name="paymentMethod" className="form-select" value={filters.paymentMethod} onChange={handleFilterChange} style={{ maxWidth: "160px" }}>
                    <option value="">All Payments</option>
                    <option value="cod">COD</option>
                    <option value="card">Card</option>
                    <option value="gcash">GCash</option>
                    <option value="maya">Maya</option>
                </select>

                <button type="submit" className="primary-button">Apply</button>
                <button type="button" className="secondary-button" onClick={handleReset}>Reset</button>
            </form>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No orders match this view" />
            )}
        </div>
    )
}

export default Orders
