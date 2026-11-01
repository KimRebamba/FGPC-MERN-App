const express = require("express")
const router = express.Router()

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    addReviewReply,
    deleteReviewReply
} = require("../Controllers/reviewController")
const { protect } = require("../middlewares/auth")

router.get("/", getReviews)

router.get("/:id", getReview)

router.post("/", protect, createReview)

router.post("/:id/replies", protect, addReviewReply)

router.delete("/:id/replies/:replyId", protect, deleteReviewReply)

router.patch("/:id", protect, updateReview)

router.delete("/:id", protect, deleteReview)

module.exports = router
