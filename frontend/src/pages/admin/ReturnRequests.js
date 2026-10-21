import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { returnRequestActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const ReturnRequests = () => {
    const dispatch = useDispatch()
    const { items: returnRequests, count, loading, error } = useSelector((state) => state.returnRequests)

    useEffect(() => {
        dispatch(returnRequestActions.fetchAll())
    }, [dispatch])

    const rows = returnRequests.map((request) => ({
        id: request._id,
        requestNumber: request.requestNumber,
        customer: request.user ? request.user.firstName + " " + request.user.lastName : "—",
        orderStatus: request.order?.status || "—",
        items: request.items.length,
        status: request.status,
        created: formatDate(request.createdAt)
    }))

    const columns = [
        { key: "requestNumber", label: "Request" },
        { key: "customer", label: "Customer" },
        { key: "orderStatus", label: "Order status" },
        { key: "items", label: "Items" },
        { key: "status", label: "Return status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "created", label: "Filed" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <Link to={"/admin/return-requests/" + row.id} className="table-link">Review</Link>
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Return requests" description={count + " request(s) filed"} />

            <ErrorMessage message={error} />

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No return requests yet" />
            )}
        </div>
    )
}

export default ReturnRequests
