import { Navigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Loader from "../Layout/Loader"

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />
    }

    return children
}

export default ProtectedRoute
