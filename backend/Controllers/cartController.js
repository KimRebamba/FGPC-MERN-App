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

const getCart = async (req, res) => {
    try {
        const { userId } = req.params

        if (!isValidId(userId)) {
            return res.status(400).json({ error: "Invalid user id" })
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

        let cart = await Cart.findOne({ user: userId, deletedAt: null })

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] })
        }

        const cartItem = cart.items.find((item) => item.product && item.product.equals(product))

        if (cartItem) {
            cartItem.quantity += quantity
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
    getCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
}
