import { useState } from "react"
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import { fgpLogo } from "../../assets"

const navigationItems = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/brands", label: "Brands" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/return-requests", label: "Returns" },
    { to: "/admin/users", label: "Users" }
]

const AdminLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [adminMenuOpen, setAdminMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    const avatarUrl = user?.profilePath ? resolveImageUrl(user.profilePath) : null
    const initials = user ? (user.firstName?.[0] || user.email?.[0] || "A").toUpperCase() : "A"

    return (
        <div className="admin-layout">
            <nav className="admin-navbar">
                {/* Logo */}
                <Link to="/admin" className="admin-navbar-logo" onClick={() => setAdminMenuOpen(false)}>
                    <img src={fgpLogo} alt="FGP" />
                </Link>

                {/* Mobile Admin Actions (Store link & Burger Toggle) */}
                <div className="admin-mobile-header-actions">
                    <Link to="/" className="secondary-button" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Store
                    </Link>

                    <button
                        type="button"
                        className="burger-btn"
                        onClick={() => setAdminMenuOpen((prev) => !prev)}
                        aria-label="Toggle admin menu"
                    >
                        {adminMenuOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Nav & Right wrapper (Desktop normal / Mobile drawer) */}
                <div className={`admin-nav-wrapper ${adminMenuOpen ? "admin-nav-wrapper--open" : ""}`}>
                    {/* Nav links */}
                    <div className="admin-navbar-nav">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    "admin-nav-link" + (isActive ? " active" : "")
                                }
                                onClick={() => setAdminMenuOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side: go to store + profile + logout */}
                    <div className="admin-navbar-right">
                        <Link to="/" className="secondary-button admin-desktop-store-btn" style={{ padding: "6px 14px", fontSize: "12px" }}>
                            Store
                        </Link>

                        <NavLink
                            to="/admin/profile"
                            className={({ isActive }) =>
                                "admin-avatar-btn" + (isActive ? " active" : "")
                            }
                            onClick={() => setAdminMenuOpen(false)}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.firstName} className="admin-avatar-img" />
                            ) : (
                                <div className="admin-avatar-placeholder">{initials}</div>
                            )}
                            <span className="admin-user-name">
                                {user?.firstName || "Admin"}
                            </span>
                        </NavLink>

                        <button
                            type="button"
                            className="logout-button admin-logout-btn"
                            onClick={() => {
                                setAdminMenuOpen(false)
                                handleLogout()
                            }}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout
