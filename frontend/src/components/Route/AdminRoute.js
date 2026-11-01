import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../Layout/Loader"

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return (
            <div className="access-denied-page">
                <div className="access-denied-card">
                    <span className="access-denied-badge">401 · Authentication Required</span>
                    <h1 className="access-denied-title">Admin Access Needed</h1>
                    <p className="access-denied-text">
                        You are not logged in. Please log in as an admin to access admin pages.
                    </p>
                    <div className="access-denied-actions">
                        <Link to="/login" state={{ from: location.pathname }} className="primary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                            Sign in as Admin
                        </Link>
                        <Link to="/" className="secondary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                            Return to Store
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (user?.role !== "admin") {
        return (
            <div className="access-denied-page">
                <div className="access-denied-card">
                    <span className="access-denied-badge access-denied-badge--danger">403 · Access Forbidden</span>
                    <h1 className="access-denied-title">Administrator Privileges Required</h1>
                    <p className="access-denied-text">
                        You are currently signed in as <strong>{user?.email || "Customer"}</strong> (<span style={{ color: "var(--accent)" }}>{user?.role}</span>). This page require administrator privileges to access.
                    </p>
                    <div className="access-denied-actions">
                        <Link to="/" className="primary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                            Return to Store
                        </Link>
                        <Link to="/login" state={{ from: location.pathname }} className="secondary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                            Switch / Login as Admin
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return children
}

export default AdminRoute
