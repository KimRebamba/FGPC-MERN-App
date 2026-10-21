import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const navigationItems = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/brands", label: "Brands" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/return-requests", label: "Return requests" },
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/carts", label: "Carts" },
    { to: "/admin/auth-identities", label: "Auth identities" }
]

const AdminLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <p className="admin-brand">FGP Admin</p>

                <nav className="admin-nav">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className="admin-nav-link"
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <p className="admin-user">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <p className="admin-email">{user?.email}</p>
                    <button type="button" className="logout-button" onClick={handleLogout}>
                        Log out
                    </button>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
