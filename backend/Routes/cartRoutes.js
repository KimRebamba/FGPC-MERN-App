const express = require("express")
const router = express.Router()

const {
    getCarts,
    getCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
} = require("../Controllers/cartController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.get("/", protect, requireAdmin, getCarts)

router.get("/:userId", protect, getCart)

router.post("/:userId/items", protect, addCartItem)

router.patch("/:userId/items/:itemId", protect, updateCartItemQuantity)

router.delete("/:userId/items/:itemId", protect, removeCartItem)

router.delete("/:userId/items", protect, clearCart)

module.exports = router
