import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, orderActions, userActions, returnRequestActions, reviewActions } from "../../actions/resourceActions"
import { useAuth } from "../../hooks/useAuth"
import PageHeader from "../../components/Layout/PageHeader"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const Dashboard = () => {
    const dispatch = useDispatch()
    const { user } = useAuth()

    const products = useSelector((state) => state.products)
    const orders = useSelector((state) => state.orders)
    const users = useSelector((state) => state.users)
    const returnRequests = useSelector((state) => state.returnRequests)
    const reviews = useSelector((state) => state.reviews)

    useEffect(() => {
        dispatch(productActions.fetchAll())
        dispatch(orderActions.fetchAll())
        dispatch(userActions.fetchAll())
        dispatch(returnRequestActions.fetchAll())
        dispatch(reviewActions.fetchAll())
    }, [dispatch])

    const stats = [
        { label: "Products", value: products.count, to: "/admin/products" },
        { label: "Orders", value: orders.count, to: "/admin/orders" },
        { label: "Users", value: users.count, to: "/admin/users" },
        { label: "Return requests", value: returnRequests.count, to: "/admin/return-requests" },
        { label: "Reviews", value: reviews.count, to: "/admin/reviews" }
    ]

    const recentOrders = orders.items.slice(0, 5).map((order) => ({
        id: order._id,
        customer: order.user ? order.user.firstName + " " + order.user.lastName : "—",
        items: order.items.length,
        status: order.status,
        placedAt: formatDate(order.createdAt)
    }))

    const columns = [
        { key: "customer", label: "Customer" },
        { key: "items", label: "Items" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "placedAt", label: "Placed" }
    ]

    return (
        <div className="admin-page">
            <PageHeader
                title={"Welcome, " + (user?.firstName || "admin")}
                description="Here is how the store is doing today"
            />

            <div className="stat-grid">
                {stats.map((stat) => (
                    <Link key={stat.label} to={stat.to} className="stat-card">
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-value">{stat.value}</p>
                    </Link>
                ))}
            </div>

            <section className="admin-section">
                <h2 className="section-title">Latest orders</h2>
                <DataTable columns={columns} rows={recentOrders} emptyMessage="No orders yet" />
            </section>
        </div>
    )
}

export default Dashboard
