import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch } from "react-redux"

import { loadUser } from "./actions/authActions"
import AdminRoute from "./components/Route/AdminRoute"
import AdminLayout from "./components/Layout/AdminLayout"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products"
import ProductCreate from "./pages/admin/ProductCreate"
import ProductEdit from "./pages/admin/ProductEdit"
import Categories from "./pages/admin/Categories"
import Brands from "./pages/admin/Brands"
import Users from "./pages/admin/Users"
import Orders from "./pages/admin/Orders"
import OrderDetails from "./pages/admin/OrderDetails"
import ReturnRequests from "./pages/admin/ReturnRequests"
import ReturnRequestDetails from "./pages/admin/ReturnRequestDetails"
import Reviews from "./pages/admin/Reviews"
import Carts from "./pages/admin/Carts"
import AuthIdentities from "./pages/admin/AuthIdentities"

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch])

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductCreate />} />
                    <Route path="products/:id/edit" element={<ProductEdit />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="brands" element={<Brands />} />
                    <Route path="users" element={<Users />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="return-requests" element={<ReturnRequests />} />
                    <Route path="return-requests/:id" element={<ReturnRequestDetails />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="carts" element={<Carts />} />
                    <Route path="auth-identities" element={<AuthIdentities />} />
                </Route>

                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </Router>
    )
}

export default App
