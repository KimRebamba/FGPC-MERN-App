import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { productActions, categoryActions, brandActions } from "../../actions/resourceActions"
import ProductCard from "../../components/Product/ProductCard"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"

const Products = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const { items: products, count, loading, error } = useSelector((state) => state.products)
    const { items: categories } = useSelector((state) => state.categories)
    const { items: brands } = useSelector((state) => state.brands)

    const [visibleCount, setVisibleCount] = useState(6)

    // [prof-requirements: MP2 - Filter functions: price filter (5pts), category filter (5pts), ratings filter (5pts)]
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        brand: "",
        minPrice: "",
        maxPrice: "",
        minRating: ""
    })

    const fetchFiltered = useCallback((currentFilters) => {
        const query = { isActive: true }

        if (currentFilters.search) query.search = currentFilters.search.trim()
        if (currentFilters.category) query.category = currentFilters.category
        if (currentFilters.brand) query.brand = currentFilters.brand
        if (currentFilters.minPrice) query.minPrice = currentFilters.minPrice
        if (currentFilters.maxPrice) query.maxPrice = currentFilters.maxPrice
        if (currentFilters.minRating) query.minRating = currentFilters.minRating

        dispatch(productActions.fetchAll(query))
    }, [dispatch])

    // Load URL params (category or search)
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const cat = params.get("category") || ""
        const s = params.get("search") || ""

        const initialFilters = {
            search: s,
            category: cat,
            brand: "",
            minPrice: "",
            maxPrice: "",
            minRating: ""
        }

        setFilters(initialFilters)
        fetchFiltered(initialFilters)

        dispatch(categoryActions.fetchAll({ isActive: true }))
        dispatch(brandActions.fetchAll({ isActive: true }))
    }, [dispatch, location.search, fetchFiltered])

    // Sort products with in-stock first
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            const aIn = (a.stock || 0) > 0 ? 1 : 0
            const bIn = (b.stock || 0) > 0 ? 1 : 0
            if (aIn !== bIn) return bIn - aIn
            return 0
        })
    }, [products])

    // Reset visible count when products change
    useEffect(() => {
        setVisibleCount(6)
    }, [products])

    // [prof-requirements: Quiz 3 - Infinite scroll on products list (15pts)]
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 250) {
                setVisibleCount((prev) => {
                    if (prev < sortedProducts.length) {
                        return Math.min(sortedProducts.length, prev + 4)
                    }
                    return prev
                })
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [sortedProducts.length])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        fetchFiltered(filters)
    }

    const handleReset = () => {
        const empty = { search: "", category: "", brand: "", minPrice: "", maxPrice: "", minRating: "" }
        setFilters(empty)
        navigate("/products", { replace: true })
        dispatch(productActions.fetchAll({ isActive: true }))
    }

    const displayedProducts = sortedProducts.slice(0, visibleCount)

    return (
        <div className="products-page">
            {/* Header */}
            <div className="products-page-header">
                <h1 className="products-page-title">Catalog</h1>

                {/* Filter bar */}
                <form className="products-filter-bar" onSubmit={handleSubmit} noValidate>
                    <input
                        type="search"
                        name="search"
                        className="form-input"
                        placeholder="Search gear..."
                        value={filters.search}
                        onChange={handleChange}
                        style={{ minWidth: "180px" }}
                    />

                    <select name="category" className="form-select" value={filters.category} onChange={handleChange}>
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    <select name="brand" className="form-select" value={filters.brand} onChange={handleChange}>
                        <option value="">All brands</option>
                        {brands.map((brand) => (
                            <option key={brand._id} value={brand._id}>{brand.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="minPrice"
                        className="form-input"
                        placeholder="Min ₱"
                        value={filters.minPrice}
                        onChange={handleChange}
                        style={{ maxWidth: "120px" }}
                    />

                    <input
                        type="number"
                        name="maxPrice"
                        className="form-input"
                        placeholder="Max ₱"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        style={{ maxWidth: "120px" }}
                    />

                    <select name="minRating" className="form-select" value={filters.minRating} onChange={handleChange} style={{ maxWidth: "150px" }}>
                        <option value="">Any rating</option>
                        <option value="4">★ 4 & up</option>
                        <option value="3">★ 3 & up</option>
                        <option value="2">★ 2 & up</option>
                        <option value="1">★ 1 & up</option>
                    </select>

                    <button type="submit" className="primary-button">Filter</button>
                    <button type="button" className="secondary-button" onClick={handleReset}>Reset</button>
                </form>
            </div>

            {/* Messages */}
            <div className="notification-slot">
                <ErrorMessage message={error} />
            </div>

            {/* Grid */}
            {loading ? (
                <Loader />
            ) : products.length === 0 ? (
                <p className="empty-state">No products found matching your filters.</p>
            ) : (
                <>
                    <p className="product-grid-count">
                        Showing {displayedProducts.length} of {count} gear item(s) found
                    </p>
                    <div className="product-grid">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Infinite Scroll Footer indicator */}
                    {visibleCount < sortedProducts.length ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "12px" }}>
                                Scroll down to load more gear automatically...
                            </p>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setVisibleCount((prev) => Math.min(sortedProducts.length, prev + 4))}
                                style={{ padding: "8px 24px", fontSize: "14px" }}
                            >
                                Load more ({sortedProducts.length - visibleCount} remaining)
                            </button>
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "14px", padding: "40px 0" }}>
                            ✓ You have reached the end of the catalog ({sortedProducts.length} items loaded).
                        </p>
                    ) : null}
                </>
            )}
        </div>
    )
}

export default Products
