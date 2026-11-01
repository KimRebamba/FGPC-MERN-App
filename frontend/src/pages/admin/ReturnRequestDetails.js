import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { returnRequestActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"

const returnStatuses = ["pending", "approved", "rejected", "completed", "cancelled"]
const resolutions = ["refund", "replacement", "store_credit"]

const ReturnRequestDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()

    const { item: returnRequest, loading, saving, error, message } = useSelector((state) => state.returnRequests)
    const [status, setStatus] = useState("pending")
    const [resolution, setResolution] = useState("")
    const [adminNotes, setAdminNotes] = useState("")

    useEffect(() => {
        dispatch(returnRequestActions.fetchOne(id))
    }, [dispatch, id])

    useEffect(() => {
        if (returnRequest) {
            setStatus(returnRequest.status)
            setResolution(returnRequest.resolution || "")
            setAdminNotes(returnRequest.adminNotes || "")
        }
    }, [returnRequest])

    const handleSubmit = (event) => {
        event.preventDefault()

        dispatch(returnRequestActions.update(id, {
            status,
            resolution: resolution || null,
            adminNotes: adminNotes || null
        }))
    }

    if (loading && !returnRequest) {
        return <Loader />
    }

    if (!returnRequest) {
        return (
            <div className="admin-page">
                <PageHeader title="Return request" />
                <ErrorMessage message={error || "Return request not found"} />
            </div>
        )
    }

    return (
        <div className="admin-page">
            <PageHeader
                title={"Return request " + returnRequest.requestNumber}
                description={"Filed " + formatDate(returnRequest.createdAt)}
            >
                <Link to="/admin/return-requests" className="secondary-button">Back to requests</Link>
            </PageHeader>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            <section className="admin-section">
                <h2 className="section-title">Customer</h2>
                <p className="detail-row">{returnRequest.user?.firstName} {returnRequest.user?.lastName}</p>
                <p className="detail-row">{returnRequest.user?.email}</p>
                <p className="detail-row">Order status: <StatusBadge value={returnRequest.order?.status} /></p>
            </section>

            <section className="admin-section">
                <h2 className="section-title">Items to return</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="table-heading">Order item</th>
                            <th className="table-heading">Quantity</th>
                            <th className="table-heading">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnRequest.items.map((item) => (
                            <tr key={item._id} className="table-row">
                                <td className="table-cell">
                                    <span style={{ fontWeight: 600, display: "block" }}>
                                        {item.productNameSnapshot || ("Item #" + String(item.orderItemId).slice(-6).toUpperCase())}
                                    </span>
                                    {item.priceSnapshot && (
                                        <span style={{ fontSize: "12px", color: "var(--accent)" }}>
                                            {formatPrice(item.priceSnapshot)}
                                        </span>
                                    )}
                                </td>
                                <td className="table-cell">{item.quantity}</td>
                                <td className="table-cell">{item.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="admin-section">
                <h2 className="section-title">Decision</h2>
                <p className="detail-row">Current status: <StatusBadge value={returnRequest.status} /></p>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select id="status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                            {returnStatuses.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="resolution" className="form-label">Resolution</label>
                        <select id="resolution" className="form-select" value={resolution} onChange={(event) => setResolution(event.target.value)}>
                            <option value="">No resolution yet</option>
                            {resolutions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="adminNotes" className="form-label">Admin notes</label>
                        <textarea
                            id="adminNotes"
                            className="form-textarea"
                            value={adminNotes}
                            onChange={(event) => setAdminNotes(event.target.value)}
                            rows={4}
                        />
                    </div>

                    <button type="submit" className="primary-button" disabled={saving}>
                        {saving ? "Saving..." : "Save decision"}
                    </button>
                </form>
            </section>
        </div>
    )
}

export default ReturnRequestDetails
