const express = require("express")
const router = express.Router()

const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../Controllers/categoryController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.get("/", getCategories)

router.get("/:id", getCategory)

router.post("/", protect, requireAdmin, createCategory)

router.patch("/:id", protect, requireAdmin, updateCategory)

router.delete("/:id", protect, requireAdmin, deleteCategory)

module.exports = router
