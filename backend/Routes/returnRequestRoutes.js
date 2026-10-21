const express = require("express")
const router = express.Router()

const {
    getReturnRequests,
    getReturnRequest,
    createReturnRequest,
    updateReturnRequest,
    deleteReturnRequest
} = require("../Controllers/returnRequestController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.post("/", protect, createReturnRequest)

router.get("/", protect, requireAdmin, getReturnRequests)

router.get("/:id", protect, requireAdmin, getReturnRequest)

router.patch("/:id", protect, requireAdmin, updateReturnRequest)

router.delete("/:id", protect, requireAdmin, deleteReturnRequest)

module.exports = router
