const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const multer = require("multer")
const { uploadsRoot } = require("./middlewares/upload")

const authRoutes = require("./Routes/authRoutes")
const authIdentityRoutes = require("./Routes/authIdentityRoutes")
const productRoutes = require("./Routes/productRoutes")
const categoryRoutes = require("./Routes/categoryRoutes")
const brandRoutes = require("./Routes/brandRoutes")
const userRoutes = require("./Routes/userRoutes")
const cartRoutes = require("./Routes/cartRoutes")
const orderRoutes = require("./Routes/orderRoutes")
const returnRequestRoutes = require("./Routes/returnRequestRoutes")
const reviewRoutes = require("./Routes/reviewRoutes")

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

app.use("/uploads", express.static(uploadsRoot))

app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running" })
})

app.use("/api/auth", authRoutes)
app.use("/api/auth-identities", authIdentityRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/users", userRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/return-requests", returnRequestRoutes)
app.use("/api/reviews", reviewRoutes)

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: error.message })
    }

    res.status(error.statusCode || 500).json({ error: error.message })
})

module.exports = app
