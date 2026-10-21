import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import PageHeader from "../Layout/PageHeader"
import Loader from "../Layout/Loader"
import ErrorMessage from "../Layout/ErrorMessage"
import DataTable from "../Table/DataTable"
import FormField from "../Form/FormField"
import StatusBadge from "../Form/StatusBadge"

const buildEmptyForm = (imageField) => ({
    name: "",
    description: "",
    isActive: true,
    [imageField]: ""
})

const SimpleCatalogPage = ({ title, description, stateKey, actions, imageField, imageLabel, singularLabel }) => {
    const dispatch = useDispatch()
    const { items, count, loading, saving, error, message } = useSelector((state) => state[stateKey])

    const [form, setForm] = useState(buildEmptyForm(imageField))
    const [editingId, setEditingId] = useState(null)

    useEffect(() => {
        dispatch(actions.fetchAll())
    }, [dispatch, actions])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const payload = {
            name: form.name,
            description: form.description,
            isActive: form.isActive,
            [imageField]: form[imageField] || null
        }

        const saved = editingId
            ? await dispatch(actions.update(editingId, payload))
            : await dispatch(actions.create(payload))

        if (saved) {
            setForm(buildEmptyForm(imageField))
            setEditingId(null)
            dispatch(actions.fetchAll())
        }
    }

    const handleEdit = (item) => {
        setEditingId(item._id)
        setForm({
            name: item.name || "",
            description: item.description || "",
            isActive: item.isActive !== false,
            [imageField]: item[imageField] || ""
        })
    }

    const handleCancel = () => {
        setEditingId(null)
        setForm(buildEmptyForm(imageField))
    }

    const handleDelete = (id) => {
        if (window.confirm("Delete this " + singularLabel + "?")) {
            dispatch(actions.remove(id))
        }
    }

    const rows = items.map((item) => ({
        id: item._id,
        name: item.name,
        description: item.description || "—",
        isActive: <StatusBadge value={item.isActive ? "active" : "inactive"} />
    }))

    const columns = [
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "isActive", label: "Status" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <button type="button" className="table-link" onClick={() => handleEdit(items.find((item) => item._id === row.id))}>
                        Edit
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
            <PageHeader title={title} description={description + " (" + count + ")"} />

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage={"No " + title.toLowerCase() + " yet"} />
            )}

            <section className="admin-section">
                <h2 className="section-title">{editingId ? "Edit " + singularLabel : "New " + singularLabel}</h2>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
                    <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
                    <FormField label={imageLabel} name={imageField} value={form[imageField]} onChange={handleChange} />
                    <FormField label="Active" name="isActive" type="checkbox" value={form.isActive} onChange={handleChange} />

                    <div className="form-actions">
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
                        </button>
                        {editingId && (
                            <button type="button" className="secondary-button" onClick={handleCancel}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    )
}

export default SimpleCatalogPage
