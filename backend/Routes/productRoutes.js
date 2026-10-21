const express = require("express")
const router = express.Router()

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../Controllers/productController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.get("/", getProducts)

router.get("/:id", getProduct)

router.post("/", protect, requireAdmin, createProduct)

router.patch("/:id", protect, requireAdmin, updateProduct)

router.delete("/:id", protect, requireAdmin, deleteProduct)

module.exports = router
