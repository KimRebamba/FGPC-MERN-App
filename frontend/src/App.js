import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch } from "react-redux"

import { loadUser } from "./actions/authActions"
import AdminRoute from "./components/Route/AdminRoute"
import ProtectedRoute from "./components/Route/ProtectedRoute"
import AdminLayout from "./components/Layout/AdminLayout"
import StoreLayout from "./components/Layout/StoreLayout"

// Auth pages
import Login from "./pages/Login"
import Register from "./pages/Register"

// Store pages
import Storefront from "./pages/store/Storefront"
import Categories from "./pages/store/Categories"
import Products from "./pages/store/Products"
import ProductDetails from "./pages/store/ProductDetails"
import Cart from "./pages/store/Cart"
import Checkout from "./pages/store/Checkout"
import MyActivity from "./pages/store/MyActivity"
import CustomerOrderDetails from "./pages/store/CustomerOrderDetails"
import Profile from "./pages/store/Profile"

// Admin pages
import Dashboard from "./pages/admin/Dashboard"
import AdminProducts from "./pages/admin/Products"
import ProductCreate from "./pages/admin/ProductCreate"
import ProductEdit from "./pages/admin/ProductEdit"
import AdminCategories from "./pages/admin/Categories"
import Brands from "./pages/admin/Brands"
import Users from "./pages/admin/Users"
import Orders from "./pages/admin/Orders"
import OrderDetails from "./pages/admin/OrderDetails"
import ReturnRequests from "./pages/admin/ReturnRequests"
import ReturnRequestDetails from "./pages/admin/ReturnRequestDetails"
import Reviews from "./pages/admin/Reviews"
import Carts from "./pages/admin/Carts"
import AuthIdentities from "./pages/admin/AuthIdentities"
import AdminProfile from "./pages/admin/AdminProfile"

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch])

    return (
        <Router>
            <Routes>
                {/* ---- Store (public + protected) ---- */}
                <Route element={<StoreLayout />}>
                    <Route index element={<Storefront />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetails />} />

                    {/* Cart does NOT require auth — guest sees login redirect on add-to-cart */}
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
                    <Route path="orders" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
                    <Route path="orders/:id" element={<ProtectedRoute><CustomerOrderDetails /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Route>

                {/* ---- Auth pages ---- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ---- Admin (admin-only) ---- */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductCreate />} />
                    <Route path="products/:id/edit" element={<ProductEdit />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="brands" element={<Brands />} />
                    <Route path="users" element={<Users />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="return-requests" element={<ReturnRequests />} />
                    <Route path="return-requests/:id" element={<ReturnRequestDetails />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="carts" element={<Carts />} />
                    <Route path="auth-identities" element={<AuthIdentities />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

                {/* ---- Fallback ---- */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App
