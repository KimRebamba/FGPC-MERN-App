import { Link } from "react-router-dom"
import { formatPrice } from "../../utils/formatPrice"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

// Star rating display helper
const Stars = ({ rating, max = 5 }) => {
    const stars = []

    for (let i = 1; i <= max; i++) {
        stars.push(
            <span key={i} className={"star" + (i <= Math.round(rating) ? " filled" : "")}>
                ★
            </span>
        )
    }

    return <span className="stars-display">{stars}</span>
}

const ProductCard = ({ product }) => {
    const image = resolveImageUrl(product.images?.find((img) => img.isPrimary)?.imagePath || product.images?.[0]?.imagePath)
    const avgRating = product.averageRating || 0
    const reviewCount = product.reviewCount || 0
    const isOutOfStock = (product.stock || 0) <= 0

    return (
        <div className={"product-card" + (isOutOfStock ? " product-card--out-of-stock" : "")}>
            {/* Image */}
            <div style={{ position: "relative" }}>
                <Link to={"/products/" + product._id} style={{ display: "block", textDecoration: "none" }}>
                    {image ? (
                        <div className="product-card-image">
                            <img src={image} alt={product.name} />
                        </div>
                    ) : (
                        <div className="product-card-placeholder">No image</div>
                    )}
                </Link>
                {isOutOfStock && (
                    <span className="out-of-stock-pill">
                        Out of stock
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="product-card-body">
                <div className="product-card-meta">
                    <span className="product-card-category">
                        {product.category?.name || "Uncategorized"}
                    </span>
                    {avgRating > 0 && (
                        <span className="product-card-rating">
                            <Stars rating={avgRating} />
                            <span>({reviewCount})</span>
                        </span>
                    )}
                </div>

                <Link to={"/products/" + product._id} style={{ textDecoration: "none", color: "inherit" }}>
                    <h2 className="product-card-name">{product.name}</h2>
                </Link>

                <p className="product-card-brand">{product.brand?.name || "No Brand"}</p>

                <div className="product-card-footer">
                    <span className="product-card-price">{formatPrice(product.price)}</span>
                    {isOutOfStock && (
                        <span style={{ fontSize: "12px", color: "#ff5555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Sold out
                        </span>
                    )}
                </div>

                <div className="product-card-action" style={{ marginTop: "8px" }}>
                    <Link
                        to={"/products/" + product._id}
                        className="secondary-button"
                        style={{ width: "100%", justifyContent: "center" }}
                    >
                        View details →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
