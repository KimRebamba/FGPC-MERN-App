const Cart = require("../Models/Cart")
const Product = require("../Models/Product")
const { isValidId, sendError } = require("../utils/http")

const populatedProduct = {
    path: "items.product",
    select: "name price images stock isActive"
}

const readQuantity = (value, fallback) => {
    const quantity = value === undefined || value === null ? fallback : Number(value)

    return Number.isInteger(quantity) && quantity >= 1 ? quantity : null
}

const canUseCart = (req, userId) => req.user.role === "admin" || String(req.user._id) === String(userId)

const getCarts = async (req, res) => {
    try {
        const carts = await Cart.find({ deletedAt: null })
            .populate("user", "firstName lastName email")
            .populate(populatedProduct)
            .sort({ updatedAt: -1 })

        res.status(200).json({ count: carts.length, carts })
    } catch (error) {
        sendError(res, error)
    }
}

const getCart = async (req, res) => {
    try {
        const { userId } = req.params

        if (!isValidId(userId)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        if (!canUseCart(req, userId)) {
            return res.status(403).json({ error: "You can only open your own cart" })
        }

        let cart = await Cart.findOne({ user: userId, deletedAt: null }).populate(populatedProduct)

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] })
        }

        res.status(200).json(cart)
    } catch (error) {
        sendError(res, error)
    }
}

const addCartItem = async (req, res) => {
    try {
        const { userId } = req.params
        const { product } = req.body || {}

        if (!isValidId(userId)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        if (!canUseCart(req, userId)) {
            return res.status(403).json({ error: "You can only change your own cart" })
        }

        if (!isValidId(product)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const quantity = readQuantity(req.body?.quantity, 1)

        if (!quantity) {
            return res.status(400).json({ error: "Quantity must be a positive whole number" })
        }

        const existingProduct = await Product.findOne({ _id: product, deletedAt: null })

        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" })
        }

        if (!existingProduct.isActive) {
            return res.status(400).json({ error: "Product is not available" })
        }

        if (existingProduct.stock < 1) {
            return res.status(400).json({ error: "Product is out of stock" })
        }

        let cart = await Cart.findOne({ user: userId, deletedAt: null })

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] })
        }

        const cartItem = cart.items.find((item) => item.product && item.product.equals(product))
        const currentQuantity = cartItem ? cartItem.quantity : 0
        const targetQuantity = currentQuantity + quantity

        if (targetQuantity > existingProduct.stock) {
            return res.status(400).json({
                error: `Only ${existingProduct.stock} item${existingProduct.stock !== 1 ? "s" : ""} in stock. You already have ${currentQuantity} in your cart.`
            })
        }

        if (cartItem) {
            cartItem.quantity = targetQuantity
        } else {
            cart.items.push({ product, quantity })
        }

        await cart.save()
        await cart.populate(populatedProduct)

        res.status(200).json(cart)
    } catch (error) {
        sendError(res, error)
    }
}

const updateCartItemQuantity = async (req, res) => {
    try {
        const { userId, itemId } = req.params

        if (!isValidId(userId) || !isValidId(itemId)) {
            return res.status(400).json({ error: "Invalid cart or item id" })
        }

        if (!canUseCart(req, userId)) {
            return res.status(403).json({ error: "You can only change your own cart" })
        }

        const quantity = readQuantity(req.body?.quantity, null)

        if (!quantity) {
            return res.status(400).json({ error: "Quantity must be a positive whole number" })
        }

        const cart = await Cart.findOne({ user: userId, deletedAt: null })

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        const cartItem = cart.items.id(itemId)

        if (!cartItem) {
            return res.status(404).json({ error: "Cart item not found" })
        }

        const product = await Product.findOne({ _id: cartItem.product, deletedAt: null })
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                error: `Only ${product.stock} item${product.stock !== 1 ? "s" : ""} available in stock`
            })
        }

        cartItem.quantity = quantity

        await cart.save()
        await cart.populate(populatedProduct)

        res.status(200).json(cart)
    } catch (error) {
        sendError(res, error)
    }
}

const removeCartItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params

        if (!isValidId(userId) || !isValidId(itemId)) {
            return res.status(400).json({ error: "Invalid cart or item id" })
        }

        if (!canUseCart(req, userId)) {
            return res.status(403).json({ error: "You can only change your own cart" })
        }

        const cart = await Cart.findOne({ user: userId, deletedAt: null })

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        const cartItem = cart.items.id(itemId)

        if (!cartItem) {
            return res.status(404).json({ error: "Cart item not found" })
        }

        cartItem.deleteOne()

        await cart.save()
        await cart.populate(populatedProduct)

        res.status(200).json(cart)
    } catch (error) {
        sendError(res, error)
    }
}

const clearCart = async (req, res) => {
    try {
        const { userId } = req.params

        if (!isValidId(userId)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        if (!canUseCart(req, userId)) {
            return res.status(403).json({ error: "You can only change your own cart" })
        }

        const cart = await Cart.findOne({ user: userId, deletedAt: null })

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        cart.items = []

        await cart.save()

        res.status(200).json(cart)
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getCarts,
    getCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
}
