import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { categoryActions } from "../../actions/resourceActions"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

const Categories = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { items: categories, loading, error } = useSelector((state) => state.categories)

    const [search, setSearch] = useState("")

    useEffect(() => {
        dispatch(categoryActions.fetchAll({ isActive: true }))
    }, [dispatch])

    const handleViewProducts = (categoryId) => {
        navigate("/products?category=" + categoryId)
    }

    const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description || "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="categories-page">
            
            <div className="categories-page-header">
                <h1 className="products-page-title">Shop by Category</h1>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <input
                        type="search"
                        className="form-input"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: "300px" }}
                    />
                </div>
            </div>

            
            <div className="notification-slot">
                <ErrorMessage message={error} />
            </div>

            
            {loading ? (
                <Loader />
            ) : filtered.length === 0 ? (
                <p className="empty-state">No categories found.</p>
            ) : (
                <div className="category-grid">
                    {filtered.map((category) => {
                        const imageUrl = resolveImageUrl(category.imagePath)

                        return (
                            <div key={category._id} className="category-card">
                                
                                {imageUrl ? (
                                    <div className="category-card-image">
                                        <img src={imageUrl} alt={category.name} />
                                    </div>
                                ) : (
                                    <div className="category-card-placeholder">
                                        {category.name}
                                    </div>
                                )}

                                
                                <div className="category-card-body">
                                    <h2 className="category-card-name">{category.name}</h2>
                                    {category.description && (
                                        <p className="category-card-description">
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="category-card-action">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() => handleViewProducts(category._id)}
                                            style={{ width: "100%", justifyContent: "center" }}
                                        >
                                            View products →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Categories

