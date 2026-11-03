import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import { loadUser } from "./actions/authActions"
import AdminRoute from "./components/Route/AdminRoute"
import ProtectedRoute from "./components/Route/ProtectedRoute"
import AdminLayout from "./components/Layout/AdminLayout"
import StoreLayout from "./components/Layout/StoreLayout"

import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"

import Storefront from "./pages/store/Storefront"
import Categories from "./pages/store/Categories"
import Products from "./pages/store/Products"
import ProductDetails from "./pages/store/ProductDetails"
import Cart from "./pages/store/Cart"
import Checkout from "./pages/store/Checkout"
import MyActivity from "./pages/store/MyActivity"
import CustomerOrderDetails from "./pages/store/CustomerOrderDetails"
import Profile from "./pages/store/Profile"

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

const TitleAndFaviconManager = () => {
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        const isAdmin = user?.role === "admin"
        document.title = isAdmin ? "FGPC | Admin" : "FGPC"

        const setFavicon = () => {
            let link = document.querySelector("link[rel*='icon']")
            if (!link) {
                link = document.createElement("link")
                link.rel = "icon"
                document.head.appendChild(link)
            }
            link.type = "image/png"
            link.href = (process.env.PUBLIC_URL || "") + "/fgp-logo-icon.png"
        }
        setFavicon()
    }, [user])

    return null
}

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch])

    return (
        <Router>
            <TitleAndFaviconManager />
            <Routes>

                <Route element={<StoreLayout />}>
                    <Route index element={<Storefront />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetails />} />

                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
                    <Route path="orders" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
                    <Route path="orders/:id" element={<ProtectedRoute><CustomerOrderDetails /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Route>

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
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
