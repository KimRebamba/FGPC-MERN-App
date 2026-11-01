import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { returnRequestActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const emptyFilters = { search: "", status: "" }

const ReturnRequests = () => {
    const dispatch = useDispatch()
    const { items: returnRequests, count, loading, error, message } = useSelector((state) => state.returnRequests)
    const [filters, setFilters] = useState(emptyFilters)

    useEffect(() => {
        dispatch(returnRequestActions.fetchAll(filters))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleFilterSubmit = (event) => {
        event.preventDefault()
        dispatch(returnRequestActions.fetchAll(filters))
    }

    const handleReset = () => {
        setFilters(emptyFilters)
        dispatch(returnRequestActions.fetchAll(emptyFilters))
    }

    const handleDelete = async (id) => {
        const res = await dispatch(returnRequestActions.remove(id))
        if (res) {
            dispatch(returnRequestActions.fetchAll(filters))
        }
    }

    const handleRestore = async (id) => {
        const res = await dispatch(returnRequestActions.update(id, { restore: true }))
        if (res) {
            dispatch(returnRequestActions.fetchAll(filters))
        }
    }

    const rows = returnRequests.map((request) => {
        const isDeleted = Boolean(request.deletedAt)
        return {
            id: request._id,
            requestNumber: request.requestNumber,
            customer: request.user ? request.user.firstName + " " + request.user.lastName : "—",
            orderStatus: request.order?.status || "—",
            items: request.items?.length || 0,
            status: isDeleted ? "deleted" : request.status,
            isDeleted,
            created: formatDate(request.createdAt)
        }
    })

    const columns = [
        { key: "requestNumber", label: "Request", minWidth: 150 },
        { key: "customer", label: "Customer", minWidth: 160, flex: 1 },
        { key: "orderStatus", label: "Order status", minWidth: 130 },
        { key: "items", label: "Items", minWidth: 80 },
        { key: "status", label: "Return status", minWidth: 140, render: (row) => <StatusBadge value={row.status} /> },
        { key: "created", label: "Filed", minWidth: 130 },
        {
            key: "actions",
            label: "Actions",
            width: 200,
            minWidth: 190,
            render: (row) => (
                <div className="table-actions">
                    <Link
                        to={"/admin/return-requests/" + row.id}
                        className="secondary-button"
                        style={{ padding: "5px 12px", fontSize: "13px" }}
                    >
                        Review
                    </Link>
                    {row.isDeleted ? (
                        <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => handleRestore(row.id)}
                        >
                            Restore
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="danger-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => handleDelete(row.id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Return requests" description={count + " request(s) filed"} />

            <form className="filter-bar" onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search request #, customer..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    style={{ maxWidth: "260px" }}
                />

                <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: "210px" }}>
                    <option value="">All Active Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                    <option value="deleted">Soft-Deleted (Trash)</option>
                    <option value="all">All (including deleted)</option>
                </select>

                <button type="submit" className="primary-button">Apply</button>
                <button type="button" className="secondary-button" onClick={handleReset}>Reset</button>
            </form>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No return requests match this view" />
            )}
        </div>
    )
}

export default ReturnRequests
