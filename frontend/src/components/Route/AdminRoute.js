import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../Layout/Loader"

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth()

    if (loading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== "admin") {
        return (
            <div className="not-authorized">
                <h1 className="not-authorized-title">Admin access required</h1>
                <p className="not-authorized-text">This account is signed in as a customer.</p>
                <Link to="/login" className="not-authorized-link">Back to login</Link>
            </div>
        )
    }

    return children
}

export default AdminRoute
