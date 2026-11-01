import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, reviewActions } from "../../actions/resourceActions"
import { addCartItem } from "../../actions/cartActions"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import ReviewList from "../../components/Review/ReviewList"
import { formatPrice } from "../../utils/formatPrice"
import { resolveImageUrl } from "../../utils/resolveImageUrl"

// Stars display
const Stars = ({ rating, max = 5 }) => {
    const stars = []

    for (let i = 1; i <= max; i++) {
        stars.push(
            <span key={i} className={"star" + (i <= Math.round(rating) ? " filled" : "")}>★</span>
        )
    }

    return <span className="stars-display">{stars}</span>
}

// Image carousel component
const Carousel = ({ images }) => {
    const [activeIndex, setActiveIndex] = useState(0)

    if (!images || images.length === 0) {
        return <div className="carousel-placeholder">No image</div>
    }

    const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
    const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    const active = resolveImageUrl(images[activeIndex]?.imagePath)

    return (
        <div className="carousel">
            {/* Main image */}
            <div className="carousel-main">
                {active ? (
                    <img src={active} alt={"Product image " + (activeIndex + 1)} />
                ) : (
                    <div className="carousel-placeholder">No image</div>
                )}

                {images.length > 1 && (
                    <>
                        <button type="button" className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Previous image">
                            ←
                        </button>
                        <button type="button" className="carousel-btn carousel-btn--next" onClick={next} aria-label="Next image">
                            →
                        </button>
                    </>
                )}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="carousel-dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={"carousel-dot" + (index === activeIndex ? " active" : "")}
                            onClick={() => setActiveIndex(index)}
                            aria-label={"Go to image " + (index + 1)}
                        />
                    ))}
                </div>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="carousel-thumbs">
                    {images.map((img, index) => {
                        const thumbUrl = resolveImageUrl(img.imagePath)

                        return (
                            <button
                                key={index}
                                type="button"
                                className={"carousel-thumb" + (index === activeIndex ? " active" : "")}
                                onClick={() => setActiveIndex(index)}
                                aria-label={"Select image " + (index + 1)}
                            >
                                {thumbUrl ? (
                                    <img src={thumbUrl} alt={"Thumb " + (index + 1)} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const ProductDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { user } = useAuth()

    const { item: product, loading, error } = useSelector((state) => state.products)
    const { items: reviews, loading: reviewsLoading } = useSelector((state) => state.reviews)
    const { cart, saving: cartSaving, error: cartReduxError } = useSelector((state) => state.cart)

    const [quantity, setQuantity] = useState(1)
    const [message, setMessage] = useState(null)
    const [cartError, setCartError] = useState(null)

    useEffect(() => {
        dispatch(productActions.fetchOne(id))
        dispatch(reviewActions.fetchAll({ product: id }))
    }, [dispatch, id])

    const isLoading = loading || !product || product._id !== id

    const existingInCart = cart?.items?.find((it) => (it.product?._id || it.product) === id)
    const inCartQty = existingInCart ? Number(existingInCart.quantity) : 0
    const maxCanAdd = Math.max(0, (product?.stock || 0) - inCartQty)

    const handleAddToCart = async () => {
        setCartError(null)
        setMessage(null)

        if (maxCanAdd <= 0) {
            setCartError(`You already have all ${product.stock} available units in your cart.`)
            return
        }

        if (quantity > maxCanAdd) {
            setCartError(`Only ${maxCanAdd} more can be added (you have ${inCartQty} in cart, stock is ${product.stock}).`)
            return
        }

        const resultCart = await dispatch(addCartItem(user?._id || null, id, Number(quantity), product))

        if (resultCart) {
            setMessage(`Added ${quantity} unit${quantity > 1 ? "s" : ""} to cart successfully!`)
            setQuantity(1)
        } else {
            setCartError(cartReduxError || "Could not add to cart. Please check available stock.")
        }
    }

    const incrementQuantity = () => {
        if (quantity < maxCanAdd) {
            setQuantity((prev) => prev + 1)
        }
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1)
        }
    }

    if (isLoading) return <Loader />

    const avgRating = product.averageRating || 0
    const reviewCount = product.reviewCount || reviews.length

    // Sort images: primary first
    const sortedImages = [...(product.images || [])].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1
        if (!a.isPrimary && b.isPrimary) return 1
        return a.sortOrder - b.sortOrder
    })

    return (
        <div className="product-details-page">
            <div>
                <Link
                    to="/products"
                    className="secondary-button"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "14px" }}
                >
                    ← Back to shop
                </Link>
            </div>

            {/* Main layout */}
            <div className="product-details-main">
                {/* Left: Carousel */}
                <Carousel images={sortedImages} />

                {/* Right: Info */}
                <div className="product-details-info">
                    {/* Eyebrow */}
                    <div className="product-details-eyebrow">
                        <span>{product.category?.name || "Gear"}</span>
                        <span style={{ color: "var(--text-dim)" }}>·</span>
                        <span>{product.brand?.name || "No Brand"}</span>
                    </div>

                    {/* Name */}
                    <h1 className="product-details-name">{product.name}</h1>

                    {/* Rating */}
                    {avgRating > 0 && (
                        <div className="product-details-rating">
                            <Stars rating={avgRating} />
                            <span className="rating-count">
                                {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="product-details-price">{formatPrice(product.price)}</div>

                    <div className="product-details-divider" />

                    {/* Meta */}
                    <div className="product-details-meta">
                        <div className="detail-row">
                            <span className="detail-label">Category</span>
                            <span className="detail-value">{product.category?.name || "—"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Brand</span>
                            <span className="detail-value">{product.brand?.name || "—"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Stock</span>
                            <span className={"detail-value product-details-stock " + (product.stock > 0 ? "in-stock" : "out-of-stock")}>
                                {product.stock > 0 ? product.stock + " available" : "Out of stock"}
                                {inCartQty > 0 && (
                                    <span style={{ fontSize: "14px", color: "var(--accent)", marginLeft: "8px" }}>
                                        ({inCartQty} in cart)
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="notification-slot">
                        <ErrorMessage message={error || cartError} />
                        {message && <p className="form-success">{message}</p>}
                    </div>

                    {/* Actions */}
                    {product.stock > 0 && (
                        <div className="product-details-actions">
                            {/* Quantity */}
                            <div className="quantity-control">
                                <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1 || maxCanAdd <= 0}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={incrementQuantity}
                                    disabled={quantity >= maxCanAdd || maxCanAdd <= 0}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to cart */}
                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleAddToCart}
                                disabled={cartSaving || maxCanAdd <= 0}
                                style={{ flex: 1 }}
                            >
                                {cartSaving ? "Adding..." : maxCanAdd <= 0 ? "All in cart" : "Add to cart"}
                            </button>
                        </div>
                    )}

                    {product.stock < 1 && (
                        <p className="product-details-stock out-of-stock">
                            This item is currently out of stock.
                        </p>
                    )}

                    {/* Description */}
                    {product.description && (
                        <p className="product-details-description">{product.description}</p>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <section className="product-reviews">
                <h2 className="section-title">
                    Reviews {reviewCount > 0 ? "(" + reviewCount + ")" : ""}
                </h2>
                <ReviewList
                    reviews={reviews}
                    loading={reviewsLoading}
                    onReplyAdded={() => dispatch(reviewActions.fetchAll({ product: id }))}
                />
            </section>
        </div>
    )
}

export default ProductDetails
