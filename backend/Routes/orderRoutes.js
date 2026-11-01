const express = require("express")
const router = express.Router()

const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    completeOrder,
    cancelOrder
} = require("../Controllers/orderController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.post("/", protect, createOrder)

router.get("/", protect, getOrders)

router.get("/:id", protect, getOrder)

router.patch("/:id/complete", protect, completeOrder)

router.patch("/:id/cancel", protect, cancelOrder)

router.patch("/:id/status", protect, requireAdmin, updateOrderStatus)

module.exports = router
