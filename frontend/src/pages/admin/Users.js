import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { userActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatDate } from "../../utils/formatDate"

const Users = () => {
    const dispatch = useDispatch()
    const { items: users, count, loading, error, message } = useSelector((state) => state.users)

    useEffect(() => {
        dispatch(userActions.fetchAll())
    }, [dispatch])

    const handleRoleChange = (id, role) => {
        dispatch(userActions.update(id, { role }))
    }

    const handleToggleActive = (user) => {
        dispatch(userActions.update(user.id, { isDeactivated: !user.isDeactivated }))
    }

    const handleDelete = (id) => {
        if (window.confirm("Delete this user?")) {
            dispatch(userActions.remove(id))
        }
    }

    const rows = users.map((user) => ({
        id: user._id,
        name: (user.firstName + " " + user.lastName).trim() || "—",
        email: user.email,
        role: user.role,
        isDeactivated: user.isDeactivated,
        status: <StatusBadge value={user.isDeactivated ? "deactivated" : "active"} />,
        joined: formatDate(user.createdAt)
    }))

    const columns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
            key: "role",
            label: "Role",
            render: (row) => (
                <select
                    className="form-select"
                    value={row.role}
                    onChange={(event) => handleRoleChange(row.id, event.target.value)}
                >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                </select>
            )
        },
        { key: "status", label: "Status" },
        { key: "joined", label: "Joined" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <button type="button" className="table-link" onClick={() => handleToggleActive(row)}>
                        {row.isDeactivated ? "Reactivate" : "Deactivate"}
                    </button>
                    <button type="button" className="table-button" onClick={() => handleDelete(row.id)}>
                        Delete
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Users" description={count + " account(s) registered"} />

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No users yet" />
            )}
        </div>
    )
}

export default Users
