import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../hooks/useAuth"
import { fetchCart } from "../../actions/cartActions"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import StoreFooter from "./StoreFooter"
import { fgpLogo } from "../../assets"

const StoreLayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const { cart } = useSelector((state) => state.cart)
    const [menuOpen, setMenuOpen] = useState(false)

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
                <Link to="/" className="store-brand" onClick={() => setMenuOpen(false)}>
                    <img src={fgpLogo} alt="FGP" />
                </Link>

                {/* Mobile Cart & Burger Toggle */}
                <div className="mobile-header-actions">
                    <Link to="/cart" className="cart-nav-btn cart-nav-btn--mobile" onClick={() => setMenuOpen(false)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {itemCount > 0 && (
                            <span className="cart-badge">{itemCount}</span>
                        )}
                    </Link>

                    <button
                        type="button"
                        className="burger-btn"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Nav & Header Right (Desktop contents / Mobile dropdown) */}
                <div className={`store-nav-wrapper ${menuOpen ? "store-nav-wrapper--open" : ""}`}>
                    {/* Nav */}
                    <nav className="store-nav">
                        <NavLink
                            to="/categories"
                            className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                            onClick={() => setMenuOpen(false)}
                        >
                            Categories
                        </NavLink>

                        <NavLink
                            to="/products"
                            className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                            onClick={() => setMenuOpen(false)}
                        >
                            Products
                        </NavLink>

                        {isAuthenticated && (
                            <NavLink
                                to="/activity"
                                className={({ isActive }) => "store-nav-link" + (isActive ? " active" : "")}
                                onClick={() => setMenuOpen(false)}
                            >
                                My Activity
                            </NavLink>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="store-header-right">
                        {/* Cart (Desktop) */}
                        <Link to="/cart" className="cart-nav-btn cart-nav-btn--desktop" onClick={() => setMenuOpen(false)}>
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
                            <Link
                                to="/admin"
                                className="secondary-button store-nav-admin-btn"
                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                onClick={() => setMenuOpen(false)}
                            >
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
                                onClick={() => setMenuOpen(false)}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={user?.firstName} className="store-avatar-img" />
                                ) : (
                                    <div className="store-avatar-placeholder">{initials}</div>
                                )}
                                {user?.firstName || user?.email?.split("@")[0]}
                            </NavLink>
                        ) : (
                            <Link
                                to="/login"
                                className="primary-button store-nav-login-btn"
                                style={{ padding: "8px 20px" }}
                                onClick={() => setMenuOpen(false)}
                            >
                                Sign in
                            </Link>
                        )}

                        {isAuthenticated && (
                            <button
                                type="button"
                                className="logout-button store-nav-logout-btn"
                                onClick={() => {
                                    setMenuOpen(false)
                                    handleLogout()
                                }}
                            >
                                Sign out
                            </button>
                        )}
                    </div>
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
