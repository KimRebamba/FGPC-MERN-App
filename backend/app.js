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

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173"
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        const cleanOrigin = origin.replace(/\/+$/, "")
        const isAllowed = allowedOrigins.some((url) => url.replace(/\/+$/, "") === cleanOrigin) ||
            cleanOrigin.includes("localhost") ||
            cleanOrigin.includes("127.0.0.1") ||
            cleanOrigin.endsWith(".onrender.com")

        if (isAllowed) {
            callback(null, true)
        } else {
            callback(null, true) // permissive fallback to avoid breaking deployed frontend
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
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
