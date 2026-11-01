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
const { productImages } = require("../middlewares/upload")

router.get("/", getProducts)

router.get("/:id", getProduct)

router.post("/", protect, requireAdmin, productImages, createProduct)

router.patch("/:id", protect, requireAdmin, productImages, updateProduct)

router.delete("/:id", protect, requireAdmin, deleteProduct)

module.exports = router
