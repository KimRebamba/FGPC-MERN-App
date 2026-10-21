import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const Orders = () => {
    const dispatch = useDispatch()
    const { items: orders, count, loading, error } = useSelector((state) => state.orders)

    useEffect(() => {
        dispatch(orderActions.fetchAll())
    }, [dispatch])

    const rows = orders.map((order) => ({
        id: order._id,
        customer: order.user ? order.user.firstName + " " + order.user.lastName : "—",
        email: order.user?.email || "—",
        items: order.items.length,
        status: order.status,
        payment: order.paymentMethod,
        placedAt: formatDate(order.createdAt)
    }))

    const columns = [
        { key: "customer", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "items", label: "Items" },
        { key: "payment", label: "Payment" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "placedAt", label: "Placed" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <Link to={"/admin/orders/" + row.id} className="table-link">View</Link>
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Orders" description={count + " order(s) recorded"} />

            <ErrorMessage message={error} />

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No orders yet" />
            )}
        </div>
    )
}

export default Orders
