import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, categoryActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import DetailModal from "../../components/Table/DetailModal"
import { formatPrice } from "../../utils/formatPrice"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

const emptyFilters = { search: "", category: "", status: "" }

const Products = () => {
    const dispatch = useDispatch()
    const { items: products, count, loading, error, message } = useSelector((state) => state.products)
    const { items: categories } = useSelector((state) => state.categories)

    const [filters, setFilters] = useState(emptyFilters)
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        dispatch(productActions.fetchAll(filters))
        dispatch(categoryActions.fetchAll({ status: "all" }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleFilterChange = (event) => {
        const { name, value } = event.target

        setFilters((previous) => ({ ...previous, [name]: value }))
    }

    const handleFilterSubmit = (event) => {
        event.preventDefault()

        dispatch(productActions.fetchAll(filters))
    }

    const handleReset = () => {
        setFilters(emptyFilters)
        dispatch(productActions.fetchAll(emptyFilters))
    }

    const handleDelete = async (id) => {
        const res = await dispatch(productActions.remove(id))
        if (res) {
            dispatch(productActions.fetchAll(filters))
        }
    }

    const handleRestore = async (id) => {
        const res = await dispatch(productActions.update(id, { restore: true }))
        if (res) {
            dispatch(productActions.fetchAll(filters))
        }
    }

    const rows = products.map((product) => {
        const isDeleted = Boolean(product.deletedAt)
        const isOutOfStock = (product.stock || 0) <= 0

        let statusBadgeValue = "inactive"
        if (isDeleted) {
            statusBadgeValue = "deleted"
        } else if (isOutOfStock) {
            statusBadgeValue = "out-of-stock"
        } else if (product.isActive) {
            statusBadgeValue = "active"
        }

        return {
            id: product._id,
            image: product.images?.find((img) => img.isPrimary)?.imagePath || product.images?.[0]?.imagePath || null,
            name: product.name,
            price: formatPrice(product.price),
            stock: product.stock,
            category: product.category?.name || "Uncategorized",
            brand: product.brand?.name || "No Brand",
            isDeleted,
            isActive: <StatusBadge value={statusBadgeValue} />
        }
    })

    const columns = [
        {
            key: "image",
            label: "Photo",
            width: 80,
            minWidth: 70,
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
        { key: "name", label: "Name", minWidth: 200, flex: 1.5 },
        { key: "price", label: "Price", minWidth: 120 },
        { key: "stock", label: "Stock", minWidth: 90 },
        { key: "category", label: "Category", minWidth: 140 },
        { key: "brand", label: "Brand", minWidth: 140 },
        { key: "isActive", label: "Status", minWidth: 110 },
        {
            key: "actions",
            label: "Actions",
            width: 240,
            minWidth: 230,
            render: (row) => {
                const fullItem = products.find((p) => p._id === row.id)
                return (
                    <div className="table-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "13px" }}
                            onClick={() => setSelectedProduct(fullItem)}
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
                                <Link
                                    to={"/admin/products/" + row.id + "/edit"}
                                    className="secondary-button"
                                    style={{ padding: "5px 12px", fontSize: "13px" }}
                                >
                                    Edit
                                </Link>
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
            <PageHeader title="Products" description={count + " product(s) in the catalog"}>
                <Link to="/admin/products/new" className="primary-button">New product</Link>
            </PageHeader>

            <form className="filter-bar" onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={handleFilterChange}
                    style={{ maxWidth: "240px" }}
                />

                <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange} style={{ maxWidth: "200px" }}>
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                </select>

                <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: "210px" }}>
                    <option value="">Status: Active & Inactive</option>
                    <option value="active">Active only</option>
                    <option value="inactive">Inactive only</option>
                    <option value="out_of_stock">Out of Stock</option>
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
                <DataTable columns={columns} rows={rows} emptyMessage="No products match this view" />
            )}

            {/* Document Details Modal */}
            <DetailModal
                title="Product Details"
                data={selectedProduct ? {
                    ID: selectedProduct._id,
                    Name: selectedProduct.name,
                    Description: selectedProduct.description || "—",
                    Price: formatPrice(selectedProduct.price),
                    Stock: selectedProduct.stock,
                    Category: selectedProduct.category?.name || "Uncategorized",
                    Brand: selectedProduct.brand?.name || "—",
                    Status: selectedProduct.deletedAt ? "Soft-Deleted" : selectedProduct.stock <= 0 ? "Out of Stock" : selectedProduct.isActive ? "Active" : "Inactive",
                    Deleted: selectedProduct.deletedAt ? new Date(selectedProduct.deletedAt).toLocaleString() : "No",
                    ImagesCount: selectedProduct.images?.length || 0,
                    Created: selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : "—",
                    Updated: selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleString() : "—"
                } : null}
                isOpen={Boolean(selectedProduct)}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    )
}

export default Products
