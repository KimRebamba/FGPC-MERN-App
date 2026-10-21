const express = require("express")
const router = express.Router()

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require("../Controllers/reviewController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.get("/", getReviews)

router.get("/:id", getReview)

router.post("/", protect, createReview)

router.patch("/:id", protect, updateReview)

router.delete("/:id", protect, requireAdmin, deleteReview)

module.exports = router
