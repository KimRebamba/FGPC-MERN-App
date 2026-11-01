const express = require("express")
const router = express.Router()

const {
    getReturnRequests,
    getReturnRequest,
    createReturnRequest,
    updateReturnRequest,
    cancelReturnRequest,
    deleteReturnRequest
} = require("../Controllers/returnRequestController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.post("/", protect, createReturnRequest)

router.get("/", protect, getReturnRequests)

router.get("/:id", protect, getReturnRequest)

router.patch("/:id/cancel", protect, cancelReturnRequest)

router.patch("/:id", protect, requireAdmin, updateReturnRequest)

router.delete("/:id", protect, requireAdmin, deleteReturnRequest)

module.exports = router
