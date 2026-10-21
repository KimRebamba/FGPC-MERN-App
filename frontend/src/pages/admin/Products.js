import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, categoryActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import StatusBadge from "../../components/Form/StatusBadge"
import { formatPrice } from "../../utils/formatPrice"

const emptyFilters = { search: "", category: "", isActive: "" }

const Products = () => {
    const dispatch = useDispatch()
    const { items: products, count, loading, error, message } = useSelector((state) => state.products)
    const { items: categories } = useSelector((state) => state.categories)

    const [filters, setFilters] = useState(emptyFilters)

    useEffect(() => {
        dispatch(productActions.fetchAll())
        dispatch(categoryActions.fetchAll())
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
        dispatch(productActions.fetchAll())
    }

    const handleDelete = (id) => {
        if (window.confirm("Delete this product?")) {
            dispatch(productActions.remove(id))
        }
    }

    const rows = products.map((product) => ({
        id: product._id,
        name: product.name,
        price: formatPrice(product.price),
        stock: product.stock,
        category: product.category?.name || "—",
        brand: product.brand?.name || "—",
        isActive: <StatusBadge value={product.isActive ? "active" : "inactive"} />
    }))

    const columns = [
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "category", label: "Category" },
        { key: "brand", label: "Brand" },
        { key: "isActive", label: "Status" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="table-actions">
                    <Link to={"/admin/products/" + row.id + "/edit"} className="table-link">Edit</Link>
                    <button type="button" className="table-button" onClick={() => handleDelete(row.id)}>Delete</button>
                </div>
            )
        }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Products" description={count + " product(s) in the catalog"}>
                <Link to="/admin/products/new" className="primary-button">New product</Link>
            </PageHeader>

            <form className="filter-bar" onSubmit={handleFilterSubmit}>
                <input
                    type="search"
                    name="search"
                    className="form-input"
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={handleFilterChange}
                />

                <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                </select>

                <select name="isActive" className="form-select" value={filters.isActive} onChange={handleFilterChange}>
                    <option value="">Any status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <button type="submit" className="secondary-button">Apply filters</button>
                <button type="button" className="secondary-button" onClick={handleReset}>Reset</button>
            </form>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No products match this view" />
            )}
        </div>
    )
}

export default Products
