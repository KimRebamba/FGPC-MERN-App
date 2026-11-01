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
                <Link to="/admin" className="admin-navbar-logo">
                    <img src={fgpLogo} alt="FGP" />
                </Link>

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
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* Right side: go to store + profile + logout */}
                <div className="admin-navbar-right">
                    <Link to="/" className="secondary-button" style={{ padding: "6px 14px", fontSize: "12px" }}>
                        Store
                    </Link>

                    <NavLink
                        to="/admin/profile"
                        className={({ isActive }) =>
                            "admin-avatar-btn" + (isActive ? " active" : "")
                        }
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

                    <button type="button" className="logout-button" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </nav>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout
