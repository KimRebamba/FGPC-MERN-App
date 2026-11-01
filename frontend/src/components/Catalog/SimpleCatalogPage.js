import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import PageHeader from "../Layout/PageHeader"
import Loader from "../Layout/Loader"
import ErrorMessage from "../Layout/ErrorMessage"
import DataTable from "../Table/DataTable"
import FormField from "../Form/FormField"
import StatusBadge from "../Form/StatusBadge"
import DetailModal from "../Table/DetailModal"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

const buildEmptyForm = () => ({
    name: "",
    description: "",
    isActive: true
})

const SimpleCatalogPage = ({ title, description, stateKey, actions, imageField, uploadField, imageLabel, singularLabel }) => {
    const dispatch = useDispatch()
    const { items, count, loading, saving, error, message } = useSelector((state) => state[stateKey])

    const [form, setForm] = useState(buildEmptyForm())
    const [file, setFile] = useState(null)
    const [existingImage, setExistingImage] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(actions.fetchAll({
                search: search.trim() || undefined,
                status: statusFilter || undefined
            }))
        }, 200)

        return () => clearTimeout(timer)
    }, [dispatch, actions, search, statusFilter])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleFile = (event) => {
        setFile(event.target.files[0] || null)
    }

    const resetForm = () => {
        setForm(buildEmptyForm())
        setFile(null)
        setExistingImage(null)
        setEditingId(null)
        setShowForm(false)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData()

        formData.append("name", form.name)
        formData.append("description", form.description)
        formData.append("isActive", form.isActive ? "true" : "false")

        if (file) {
            formData.append(uploadField, file)
        }

        const saved = editingId
            ? await dispatch(actions.update(editingId, formData))
            : await dispatch(actions.create(formData))

        if (saved) {
            resetForm()
            dispatch(actions.fetchAll({
                search: search.trim() || undefined,
                status: statusFilter || undefined
            }))
        }
    }

    const handleEdit = (item) => {
        setEditingId(item._id)
        setForm({
            name: item.name || "",
            description: item.description || "",
            isActive: item.isActive !== false
        })
        setFile(null)
        setExistingImage(item[imageField] || null)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        const res = await dispatch(actions.remove(id))
        if (res) {
            dispatch(actions.fetchAll({
                search: search.trim() || undefined,
                status: statusFilter || undefined
            }))
        }
    }

    const handleRestore = async (id) => {
        const res = await dispatch(actions.update(id, { restore: true }))
        if (res) {
            dispatch(actions.fetchAll({
                search: search.trim() || undefined,
                status: statusFilter || undefined
            }))
        }
    }

    const rows = items.map((item) => ({
        id: item._id,
        name: item.name,
        description: item.description || "—",
        image: item[imageField] || null,
        isDeleted: Boolean(item.deletedAt),
        isActive: <StatusBadge value={item.deletedAt ? "deleted" : item.isActive ? "active" : "inactive"} />
    }))

    const columns = [
        {
            key: "image",
            label: "Photo",
            width: 90,
            minWidth: 80,
            render: (row) => {
                const url = resolveImageUrl(row.image)
                return url ? (
                    <img
                        src={url}
                        alt={row.name}
                        style={{ width: "44px", height: "44px", objectFit: "cover", border: "1px solid var(--border)" }}
                    />
                ) : (
                    <span style={{ color: "var(--text-dim)" }}>—</span>
                )
            }
        },
        { key: "name", label: "Name", minWidth: 180, flex: 1 },
        {
            key: "description",
            label: "Description",
            minWidth: 260,
            flex: 2,
            render: (row) => (
                <span title={row.description} style={{ maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
                    {row.description}
                </span>
            )
        },
        { key: "isActive", label: "Status", width: 120, minWidth: 110 },
        {
            key: "actions",
            label: "Actions",
            width: 240,
            minWidth: 230,
            render: (row) => {
                const fullItem = items.find((item) => item._id === row.id)
                return (
                    <div className="table-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => setSelectedItem(fullItem)}
                        >
                            Details
                        </button>
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
                            <>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    style={{ padding: "5px 12px", fontSize: "13px" }}
                                    onClick={() => handleEdit(fullItem)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="danger-button"
                                    style={{ padding: "5px 12px", fontSize: "13px" }}
                                    onClick={() => handleDelete(row.id)}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title={title} description={description + " (" + count + ")"}>
                <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                        resetForm()
                        setShowForm(!showForm)
                    }}
                >
                    {showForm ? "Close Form" : "New " + singularLabel}
                </button>
            </PageHeader>

            {/* Filter and Search Bar */}
            <div className="filter-bar" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder={"Search " + title.toLowerCase() + "..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: "280px" }}
                />
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ maxWidth: "220px" }}
                >
                    <option value="">Status: Active & Inactive</option>
                    <option value="active">Active only</option>
                    <option value="inactive">Inactive only</option>
                    <option value="deleted">Soft-Deleted (Trash)</option>
                    <option value="all">All (including deleted)</option>
                </select>
            </div>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {/* Form collapsible */}
            {showForm && (
                <section className="admin-section" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
                    <h2 className="section-title">{editingId ? "Edit " + singularLabel : "New " + singularLabel}</h2>

                    <form className="admin-form" onSubmit={handleSubmit} noValidate>
                        <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
                        <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />

                        {existingImage && (
                            <div className="form-field">
                                <p className="form-label">Current image</p>
                                <img
                                    src={resolveImageUrl(existingImage)}
                                    alt="Current"
                                    style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid var(--border)" }}
                                />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor={uploadField} className="form-label">{imageLabel}</label>
                            <input
                                id={uploadField}
                                name={uploadField}
                                type="file"
                                className="form-input"
                                accept="image/*"
                                onChange={handleFile}
                            />
                            {file && <p className="form-hint">{file.name}</p>}
                        </div>

                        <FormField label="Active" name="isActive" type="checkbox" value={form.isActive} onChange={handleChange} />

                        <div className="form-actions">
                            <button type="submit" className="primary-button" disabled={saving}>
                                {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
                            </button>
                            <button type="button" className="secondary-button" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage={"No " + title.toLowerCase() + " yet"} />
            )}

            {/* Document Details Modal */}
            <DetailModal
                title={title + " Details"}
                data={selectedItem ? {
                    ID: selectedItem._id,
                    Name: selectedItem.name,
                    Description: selectedItem.description || "—",
                    Image: selectedItem[imageField] || "—",
                    Active: selectedItem.isActive ? "Yes" : "No",
                    Deleted: selectedItem.deletedAt ? new Date(selectedItem.deletedAt).toLocaleString() : "No",
                    Created: selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : "—",
                    Updated: selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : "—"
                } : null}
                isOpen={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    )
}

export default SimpleCatalogPage
