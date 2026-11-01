import { useEffect } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../hooks/useAuth"
import { fetchCart } from "../../actions/cartActions"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import StoreFooter from "./StoreFooter"

const StoreLayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const { cart } = useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchCart(isAuthenticated && user ? user._id : null))
    }, [dispatch, isAuthenticated, user])

    const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    const avatarUrl = user?.profilePath ? resolveImageUrl(user.profilePath) : null
    const initials = user ? (user.firstName?.[0] || user.email?.[0] || "U").toUpperCase() : "U"

    return (
        <div className="store-layout">
            <header className="store-header">
                {/* Logo */}
                <Link to="/" className="store-brand">
                    <img src="/fgp-logo.png" alt="FGP" />
                </Link>

                {/* Nav */}
                <nav className="store-nav">
                    <NavLink
                        to="/categories"
                        className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                    >
                        Categories
                    </NavLink>

                    <NavLink
                        to="/products"
                        className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                    >
                        Products
                    </NavLink>

                    {isAuthenticated && (
                        <NavLink
                            to="/activity"
                            className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                        >
                            My Activity
                        </NavLink>
                    )}
                </nav>

                {/* Right side */}
                <div className="store-header-right">
                    {/* Cart */}
                    <Link to="/cart" className="cart-nav-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Cart
                        {itemCount > 0 && (
                            <span className="cart-badge">{itemCount}</span>
                        )}
                    </Link>

                    {/* Admin button if user is admin */}
                    {user?.role === "admin" && (
                        <Link to="/admin" className="secondary-button" style={{ padding: "6px 14px", fontSize: "12px" }}>
                            Admin
                        </Link>
                    )}

                    {/* Profile / Login */}
                    {isAuthenticated ? (
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                "store-user-btn" + (isActive ? " active" : "")
                            }
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.firstName} className="store-avatar-img" />
                            ) : (
                                <div className="store-avatar-placeholder">{initials}</div>
                            )}
                            {user?.firstName || user?.email?.split("@")[0]}
                        </NavLink>
                    ) : (
                        <Link to="/login" className="primary-button" style={{ padding: "8px 20px" }}>
                            Sign in
                        </Link>
                    )}

                    {isAuthenticated && (
                        <button type="button" className="logout-button" onClick={handleLogout}>
                            Sign out
                        </button>
                    )}
                </div>
            </header>

            <main className="store-content">
                <Outlet />
            </main>

            <StoreFooter />
        </div>
    )
}

export default StoreLayout
