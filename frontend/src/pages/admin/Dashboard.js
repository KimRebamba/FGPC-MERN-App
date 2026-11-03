import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    productActions,
    orderActions,
    userActions,
    returnRequestActions,
    reviewActions
} from "../../actions/resourceActions"
import { useAuth } from "../../hooks/useAuth"
import PageHeader from "../../components/Layout/PageHeader"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

const buildReturnMap = (returnRequests = []) => {
    const map = {}
    returnRequests.forEach((rr) => {
        if (rr.status === "approved" || rr.status === "completed") {
            const ordId = rr.order?._id || rr.order
            if (ordId) {
                rr.items?.forEach((it) => {
                    const key = String(ordId) + "_" + String(it.orderItemId)
                    map[key] = (map[key] || 0) + (it.quantity || 1)
                })
            }
        }
    })
    return map
}

const buildFilteredSales = (orders, returnMap, startDate, endDate) => {
    const map = {}
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : null

    orders.forEach((order) => {
        if (!order.createdAt) return
        if (order.status !== "delivered" && order.status !== "completed") return

        const orderDate = new Date(order.createdAt)
        if (start && orderDate < start) return
        if (end && orderDate > end) return

        const key = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })

        const netTotal = order.items.reduce((sum, item) => {
            const returnedQty = returnMap[String(order._id) + "_" + String(item._id)] || 0
            const netQty = Math.max(0, item.quantity - returnedQty)
            return sum + Number(item.priceSnapshot || 0) * netQty
        }, 0)

        map[key] = (map[key] || 0) + netTotal
    })

    const entries = Object.entries(map).map(([label, total]) => ({
        label,
        total: Number(total.toFixed(2))
    }))

    return entries
}

const buildProductSales = (orders, returnMap, startDate, endDate) => {
    const map = {}
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : null

    orders.forEach((order) => {
        if (order.status !== "delivered" && order.status !== "completed") return
        const orderDate = new Date(order.createdAt)
        if (start && orderDate < start) return
        if (end && orderDate > end) return

        order.items.forEach((item) => {
            const returnedQty = returnMap[String(order._id) + "_" + String(item._id)] || 0
            const netQty = Math.max(0, item.quantity - returnedQty)
            if (netQty > 0) {
                const name = item.productNameSnapshot || "Gear Item"
                map[name] = (map[name] || 0) + netQty
            }
        })
    })

    return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, units]) => ({ name, units }))
}

const buildCustomerSales = (orders, returnMap, startDate, endDate) => {
    const map = {}
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : null

    orders.forEach((order) => {
        if (order.status !== "delivered" && order.status !== "completed") return
        const orderDate = new Date(order.createdAt)
        if (start && orderDate < start) return
        if (end && orderDate > end) return

        const customerName = order.user ? (order.user.firstName + " " + order.user.lastName).trim() : "Guest Rider"

        const netTotal = order.items.reduce((sum, item) => {
            const returnedQty = returnMap[String(order._id) + "_" + String(item._id)] || 0
            const netQty = Math.max(0, item.quantity - returnedQty)
            return sum + Number(item.priceSnapshot || 0) * netQty
        }, 0)

        map[customerName] = (map[customerName] || 0) + netTotal
    })

    return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }))
}

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "12px 16px",
            fontSize: "14px",
            color: "var(--text)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.6)"
        }}>
            <p style={{ marginBottom: "6px", color: "var(--text-muted)", fontSize: "13px" }}>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color, margin: 0, fontWeight: 600 }}>
                    {entry.name === "total" ? "Delivered Revenue: " + formatPrice(entry.value) : `${entry.name}: ${entry.value}`}
                </p>
            ))}
        </div>
    )
}

// [prof-requirements: Quiz 2 - Sales charts with date range filter: line or bar chart (15pts)]
const Dashboard = () => {
    const dispatch = useDispatch()
    const { user } = useAuth()

    const products = useSelector((state) => state.products)
    const orders = useSelector((state) => state.orders)
    const users = useSelector((state) => state.users)
    const returnRequests = useSelector((state) => state.returnRequests)
    const reviews = useSelector((state) => state.reviews)

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [chartType, setChartType] = useState("line")

    useEffect(() => {
        dispatch(productActions.fetchAll())
        dispatch(orderActions.fetchAll())
        dispatch(userActions.fetchAll())
        dispatch(returnRequestActions.fetchAll())
        dispatch(reviewActions.fetchAll())
    }, [dispatch])

    const returnMap = useMemo(() => buildReturnMap(returnRequests.items), [returnRequests.items])
    const deliveredOrders = useMemo(() => {
        return orders.items.filter((o) => o.status === "delivered" || o.status === "completed")
    }, [orders.items])

    const totalNetSales = useMemo(() => {
        return deliveredOrders.reduce((total, order) => {
            const netOrderTotal = order.items.reduce((sum, item) => {
                const returnedQty = returnMap[String(order._id) + "_" + String(item._id)] || 0
                const netQty = Math.max(0, item.quantity - returnedQty)
                return sum + Number(item.priceSnapshot || 0) * netQty
            }, 0)
            return total + netOrderTotal
        }, 0)
    }, [deliveredOrders, returnMap])

    const outOfStockCount = products.items.filter((p) => (p.stock || 0) <= 0).length

    const stats = [
        { label: "Net Sales (Delivered)", value: formatPrice(totalNetSales), to: "/admin/orders" },
        { label: "Total Orders", value: orders.count, to: "/admin/orders" },
        { label: "Products", value: products.count + (outOfStockCount > 0 ? ` (${outOfStockCount} sold out)` : ""), to: "/admin/products" },
        { label: "Users", value: users.count, to: "/admin/users" },
        { label: "Returns", value: returnRequests.count, to: "/admin/return-requests" },
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
        { key: "customer", label: "Customer", minWidth: 160, flex: 1 },
        { key: "items", label: "Items", minWidth: 80 },
        { key: "status", label: "Status", minWidth: 120, render: (row) => <StatusBadge value={row.status} /> },
        { key: "placedAt", label: "Placed", minWidth: 130 }
    ]

    const timelineSales = useMemo(() => {
        return buildFilteredSales(orders.items, returnMap, startDate, endDate)
    }, [orders.items, returnMap, startDate, endDate])

    const productSales = useMemo(() => {
        return buildProductSales(orders.items, returnMap, startDate, endDate)
    }, [orders.items, returnMap, startDate, endDate])

    const customerSales = useMemo(() => {
        return buildCustomerSales(orders.items, returnMap, startDate, endDate)
    }, [orders.items, returnMap, startDate, endDate])

    const handlePreset = (preset) => {
        const now = new Date()
        const todayStr = now.toISOString().split("T")[0]
        if (preset === "all") {
            setStartDate("")
            setEndDate("")
        } else if (preset === "7days") {
            const past = new Date(now)
            past.setDate(past.getDate() - 7)
            setStartDate(past.toISOString().split("T")[0])
            setEndDate(todayStr)
        } else if (preset === "30days") {
            const past = new Date(now)
            past.setDate(past.getDate() - 30)
            setStartDate(past.toISOString().split("T")[0])
            setEndDate(todayStr)
        } else if (preset === "year") {
            const startYear = new Date(now.getFullYear(), 0, 1)
            setStartDate(startYear.toISOString().split("T")[0])
            setEndDate(todayStr)
        }
    }

    return (
        <div className="admin-page">
            <PageHeader
                title={"Welcome back, " + (user?.firstName || "Admin")}
                description="Motorcycle Gear Shop Summary & Overview"
            >
                <Link to="/" className="secondary-button" style={{ padding: "8px 16px" }}>
                    Go to store
                </Link>
            </PageHeader>

            
            <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                {stats.map((stat) => (
                    <Link key={stat.label} to={stat.to} className="stat-card">
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-value">{stat.value ?? "—"}</p>
                    </Link>
                ))}
            </div>

            
            <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
                marginBottom: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
                    <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text)" }}>
                            Sales Chart Date Range Filter
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                            Filter sales revenue, product volume, and customer data by date range.
                        </p>
                    </div>

                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Chart Type:</span>
                        <button
                            type="button"
                            className={chartType === "line" ? "primary-button" : "secondary-button"}
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => setChartType("line")}
                        >
                            📈 Line Chart
                        </button>
                        <button
                            type="button"
                            className={chartType === "bar" ? "primary-button" : "secondary-button"}
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => setChartType("bar")}
                        >
                            📊 Bar Chart
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Start Date:</label>
                        <input
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: "6px 12px", fontSize: "14px", width: "auto" }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>End Date:</label>
                        <input
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: "6px 12px", fontSize: "14px", width: "auto" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginLeft: "auto" }}>
                        <button type="button" className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handlePreset("7days")}>
                            Last 7 Days
                        </button>
                        <button type="button" className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handlePreset("30days")}>
                            Last 30 Days
                        </button>
                        <button type="button" className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handlePreset("year")}>
                            This Year
                        </button>
                        <button type="button" className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handlePreset("all")}>
                            All Time
                        </button>
                    </div>
                </div>
            </div>

            
            <div className="dashboard-charts">
                
                <div className="chart-card chart-full">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p className="chart-card-title" style={{ margin: 0 }}>
                            Delivered Net Sales Revenue ({chartType === "line" ? "Line Chart" : "Bar Chart"})
                        </p>
                        <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 600 }}>
                            {startDate || endDate ? `Filtered: ${startDate || "Earliest"} → ${endDate || "Latest"}` : "Showing All Delivered Revenue"}
                        </span>
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                        Only completed & delivered orders (excluding returned items) are counted towards revenue.
                    </p>

                    {timelineSales.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>
                            No delivered sales recorded for the selected date range.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={290}>
                            {chartType === "line" ? (
                                <LineChart data={timelineSales} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                    <XAxis dataKey="label" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => "₱" + v.toLocaleString()} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#C6FF00"
                                        strokeWidth={3}
                                        dot={{ fill: "#C6FF00", r: 4 }}
                                        activeDot={{ r: 7 }}
                                        name="total"
                                    />
                                </LineChart>
                            ) : (
                                <BarChart data={timelineSales} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                    <XAxis dataKey="label" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => "₱" + v.toLocaleString()} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="total" fill="#C6FF00" radius={[3, 3, 0, 0]} name="total" />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>

                
                <div className="chart-card">
                    <p className="chart-card-title">Top Products by Delivered Units</p>
                    {productSales.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>
                            No delivered products in this date range.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={productSales} margin={{ top: 8, right: 16, bottom: 40, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#888", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="units" fill="#C6FF00" radius={[2, 2, 0, 0]} name="units" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                
                <div className="chart-card">
                    <p className="chart-card-title">Top Customers by Delivered Spending</p>
                    {customerSales.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>
                            No customer spending in this date range.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={customerSales} margin={{ top: 8, right: 16, bottom: 40, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#888", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => "₱" + v.toLocaleString()} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="total" fill="#60BFFF" radius={[2, 2, 0, 0]} name="total" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            
            <section className="admin-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 className="section-title">Latest orders</h2>
                    <Link to="/admin/orders" className="secondary-button" style={{ padding: "6px 14px", fontSize: "12px" }}>
                        View all
                    </Link>
                </div>

                <div className="notification-slot">
                    <ErrorMessage message={orders.error} />
                </div>

                <DataTable columns={columns} rows={recentOrders} emptyMessage="No orders yet" />
            </section>
        </div>
    )
}

export default Dashboard
