const express = require("express")
const router = express.Router()

const {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
} = require("../Controllers/brandController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.get("/", getBrands)

router.get("/:id", getBrand)

router.post("/", protect, requireAdmin, createBrand)

router.patch("/:id", protect, requireAdmin, updateBrand)

router.delete("/:id", protect, requireAdmin, deleteBrand)

module.exports = router
