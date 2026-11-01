import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "../../actions/cartActions"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import { formatPrice } from "../../utils/formatPrice"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import { cartTotal } from "../../utils/calculateTotal"

const Cart = () => {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useAuth()
    const { cart, loading, saving, error, message } = useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchCart(user?._id || null))
    }, [dispatch, user?._id])

    const items = cart ? cart.items : []
    const total = cartTotal(items)

    const handleQuantityChange = (itemId, quantity) => {
        if (quantity < 1) return
        dispatch(updateCartItem(user?._id || null, itemId, quantity))
    }

    const handleRemove = (itemId) => {
        dispatch(removeCartItem(user?._id || null, itemId))
    }

    const handleClear = () => {
        dispatch(clearCart(user?._id || null))
    }

    if (loading && !cart) {
        return <Loader />
    }

    return (
        <div className="cart-page">
            <h1 className="page-title">Your Cart</h1>

            <ErrorMessage message={error} />
            {message && <p className="form-success">{message}</p>}

            {items.length === 0 ? (
                <div className="empty-state" style={{ padding: "80px 20px" }}>
                    <p style={{ fontSize: "20px", marginBottom: "20px" }}>Your cart is currently empty.</p>
                    <Link to="/products" className="secondary-button" style={{ display: "inline-flex", padding: "12px 28px", fontSize: "15px" }}>
                        Browse products
                    </Link>
                </div>
            ) : (
                <>
                    <ul className="cart-list">
                        {items.map((item) => {
                            const product = item.product
                            const image = resolveImageUrl(product?.images?.[0]?.imagePath)
                            const subtotal = Number(product?.price || 0) * item.quantity
                            const stockLimit = product?.stock !== undefined ? product.stock : 9999

                            return (
                                <li key={item._id} className="cart-item">
                                    {image ? (
                                        <img src={image} alt={product?.name} className="cart-item-image" />
                                    ) : (
                                        <div className="cart-item-image product-card-placeholder">No image</div>
                                    )}

                                    <div className="cart-item-info">
                                        <Link to={"/products/" + product?._id} className="cart-item-name">
                                            {product?.name || "Product unavailable"}
                                        </Link>
                                        <p className="cart-item-price">
                                            {formatPrice(product?.price)} each
                                            {product?.stock !== undefined && (
                                                <span style={{ marginLeft: "10px", color: product.stock <= 5 ? "var(--accent)" : "var(--text-dim)", fontSize: "13px" }}>
                                                    ({product.stock} in stock)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="cart-quantity-control">
                                        <button
                                            type="button"
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || saving}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            type="button"
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                            disabled={item.quantity >= stockLimit || saving}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="cart-item-subtotal">{formatPrice(subtotal)}</p>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        style={{ padding: "8px 16px", fontSize: "13px" }}
                                        onClick={() => handleRemove(item._id)}
                                        disabled={saving}
                                    >
                                        Remove
                                    </button>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="cart-summary">
                        <p className="cart-total">Total: <span>{formatPrice(total)}</span></p>
                        <div className="cart-actions">
                            <button type="button" className="secondary-button" onClick={handleClear} disabled={saving} style={{ padding: "12px 24px", fontSize: "15px" }}>
                                Clear cart
                            </button>
                            {isAuthenticated ? (
                                <Link to="/checkout" className="primary-button" style={{ padding: "12px 32px", fontSize: "15px" }}>
                                    Proceed to checkout
                                </Link>
                            ) : (
                                <Link to="/login" state={{ from: "/checkout" }} className="primary-button" style={{ padding: "12px 32px", fontSize: "15px" }}>
                                    Sign in to checkout
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Cart
