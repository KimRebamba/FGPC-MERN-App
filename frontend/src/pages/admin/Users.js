import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { userActions } from "../../actions/resourceActions"
import { useAuth } from "../../hooks/useAuth"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import FormField from "../../components/Form/FormField"
import DetailModal from "../../components/Table/DetailModal"
import { formatDate } from "../../utils/formatDate"

const emptyUserForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
    role: "customer"
}

const emptyFilters = { search: "", role: "", status: "" }

const Users = () => {
    const dispatch = useDispatch()
    const { user: currentUser } = useAuth()
    const { items: users, count, loading, error, message } = useSelector((state) => state.users)

    const [filters, setFilters] = useState(emptyFilters)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyUserForm)
    const [formError, setFormError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        dispatch(userActions.fetchAll(filters))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleFilterSubmit = (event) => {
        event.preventDefault()
        dispatch(userActions.fetchAll(filters))
    }

    const handleReset = () => {
        setFilters(emptyFilters)
        dispatch(userActions.fetchAll(emptyFilters))
    }

    const handleRoleChange = async (id, role) => {
        if (id === currentUser?._id) return
        const res = await dispatch(userActions.update(id, { role }))
        if (res) {
            dispatch(userActions.fetchAll(filters))
        }
    }

    const handleToggleActive = async (user) => {
        if (user.id === currentUser?._id) return
        const res = await dispatch(userActions.update(user.id, { isDeactivated: !user.isDeactivated }))
        if (res) {
            dispatch(userActions.fetchAll(filters))
        }
    }

    const handleDelete = async (id) => {
        if (id === currentUser?._id) return
        const res = await dispatch(userActions.remove(id))
        if (res) {
            dispatch(userActions.fetchAll(filters))
        }
    }

    const handleRestore = async (id) => {
        const res = await dispatch(userActions.update(id, { restore: true }))
        if (res) {
            dispatch(userActions.fetchAll(filters))
        }
    }

    const handleFormChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreateUser = async (event) => {
        event.preventDefault()
        setFormError(null)

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setFormError("First name and last name are required")
            return
        }

        if (!form.email.trim()) {
            setFormError("Email is required")
            return
        }

        if (!form.password || form.password.length < 6) {
            setFormError("Password must be at least 6 characters")
            return
        }

        setSubmitting(true)
        const created = await dispatch(userActions.create(form))
        setSubmitting(false)

        if (created) {
            setForm(emptyUserForm)
            setShowForm(false)
            dispatch(userActions.fetchAll(filters))
        }
    }

    const rows = users.map((user) => {
        const isDeleted = Boolean(user.deletedAt)
        return {
            id: user._id,
            name: (user.firstName + " " + user.lastName).trim() || "—",
            email: user.email,
            role: user.role,
            isGoogleUser: Boolean(user.isGoogleUser),
            isDeactivated: user.isDeactivated,
            isDeleted,
            isSelf: user._id === currentUser?._id,
            status: <StatusBadge value={isDeleted ? "deleted" : user.isDeactivated ? "deactivated" : "active"} />,
            joined: formatDate(user.createdAt)
        }
    })

    const columns = [
        { key: "name", label: "Name", minWidth: 160, flex: 1 },
        { key: "email", label: "Email", minWidth: 200, flex: 1.2 },
        {
            key: "role",
            label: "Role",
            minWidth: 130,
            render: (row) => {
                if (row.isSelf) {
                    return (
                        <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
                            {row.role} (you)
                        </span>
                    )
                }

                if (row.isDeleted) {
                    return (
                        <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                            {row.role}
                        </span>
                    )
                }

                return (
                    <select
                        className="form-select"
                        value={row.role}
                        onChange={(event) => handleRoleChange(row.id, event.target.value)}
                        style={{ maxWidth: "120px", padding: "4px 28px 4px 8px", fontSize: "13px" }}
                    >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                    </select>
                )
            }
        },
        { key: "status", label: "Status", minWidth: 120 },
        { key: "joined", label: "Joined", minWidth: 120 },
        {
            key: "actions",
            label: "Actions",
            width: 250,
            minWidth: 240,
            render: (row) => {
                const fullItem = users.find((u) => u._id === row.id)

                if (row.isSelf) {
                    return (
                        <div className="table-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                style={{ padding: "5px 12px", fontSize: "13px" }}
                                onClick={() => setSelectedUser(fullItem)}
                            >
                                Details
                            </button>
                            <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                Current account
                            </span>
                        </div>
                    )
                }

                if (row.isDeleted) {
                    return (
                        <div className="table-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                style={{ padding: "5px 12px", fontSize: "13px" }}
                                onClick={() => setSelectedUser(fullItem)}
                            >
                                Details
                            </button>
                            <button
                                type="button"
                                className="primary-button"
                                style={{ padding: "5px 12px", fontSize: "13px" }}
                                onClick={() => handleRestore(row.id)}
                            >
                                Restore
                            </button>
                        </div>
                    )
                }

                return (
                    <div className="table-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => setSelectedUser(fullItem)}
                        >
                            Details
                        </button>
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => handleToggleActive(row)}
                        >
                            {row.isDeactivated ? "Reactivate" : "Deactivate"}
                        </button>
                        <button
                            type="button"
                            className="danger-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => handleDelete(row.id)}
                        >
                            Delete
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Users" description={count + " account(s) registered"}>
                <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                        setFormError(null)
                        setShowForm(!showForm)
                    }}
                >
                    {showForm ? "Close Form" : "New user"}
                </button>
            </PageHeader>

            <form className="filter-bar" onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search name or email..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    style={{ maxWidth: "240px" }}
                />

                <select name="role" className="form-select" value={filters.role} onChange={handleFilterChange} style={{ maxWidth: "160px" }}>
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                </select>

                <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: "210px" }}>
                    <option value="">All Active / Inactive</option>
                    <option value="active">Active only</option>
                    <option value="deactivated">Deactivated only</option>
                    <option value="deleted">Soft-Deleted (Trash)</option>
                    <option value="all">All (including deleted)</option>
                </select>

                <button type="submit" className="primary-button">Apply</button>
                <button type="button" className="secondary-button" onClick={handleReset}>Reset</button>
            </form>

            <ErrorMessage message={formError || error} />
            {message && <p className="form-success">{message}</p>}

            {/* Create User Form */}
            {showForm && (
                <section className="admin-section" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
                    <h2 className="section-title">Create New User</h2>

                    <form className="admin-form" onSubmit={handleCreateUser} noValidate>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <FormField
                                label="First name"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleFormChange}
                            />
                            <FormField
                                label="Last name"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleFormChange}
                            />
                        </div>

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleFormChange}
                        />

                        <FormField
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleFormChange}
                            placeholder="At least 6 characters"
                        />

                        <FormField
                            label="Contact number (optional)"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleFormChange}
                            placeholder="+63 912 345 6789"
                        />

                        <div className="form-field">
                            <label htmlFor="role" className="form-label">Role</label>
                            <select
                                id="role"
                                name="role"
                                className="form-select"
                                value={form.role}
                                onChange={handleFormChange}
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="primary-button" disabled={submitting}>
                                {submitting ? "Creating..." : "Create user"}
                            </button>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                    setShowForm(false)
                                    setForm(emptyUserForm)
                                    setFormError(null)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No users match this view" />
            )}

            {/* User Details Modal */}
            <DetailModal
                title="User Details"
                data={selectedUser ? {
                    ID: selectedUser._id,
                    Name: (selectedUser.firstName + " " + selectedUser.lastName).trim() || "—",
                    Email: selectedUser.email,
                    Role: selectedUser.role,
                    "Google Sign-In": selectedUser.isGoogleUser ? "Yes (Logged in via Google)" : "No (Email & Password)",
                    ContactNumber: selectedUser.contactNumber || "—",
                    Status: selectedUser.deletedAt ? "Soft-Deleted" : selectedUser.isDeactivated ? "Deactivated" : "Active",
                    Deleted: selectedUser.deletedAt ? new Date(selectedUser.deletedAt).toLocaleString() : "No",
                    AddressesCount: selectedUser.addresses?.length || 0,
                    Created: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—",
                    Updated: selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : "—"
                } : null}
                isOpen={Boolean(selectedUser)}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    )
}

export default Users
