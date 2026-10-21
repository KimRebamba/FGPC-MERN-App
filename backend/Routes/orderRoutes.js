const express = require("express")
const router = express.Router()

const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    deleteOrder
} = require("../Controllers/orderController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.post("/", protect, createOrder)

router.get("/", protect, requireAdmin, getOrders)

router.get("/:id", protect, requireAdmin, getOrder)

router.patch("/:id/status", protect, requireAdmin, updateOrderStatus)

router.delete("/:id", protect, requireAdmin, deleteOrder)

module.exports = router
