const Order = require("../Models/Order")
const Product = require("../Models/Product")
const Cart = require("../Models/Cart")
const { isValidId, sendError } = require("../utils/http")

const statusTimestamps = {
    shipped: "shippedAt",
    delivered: "deliveredAt",
    completed: "completedAt",
    cancelled: "cancelledAt"
}

const getOrders = async (req, res) => {
    try {
        const { user, status } = req.query
        const filter = { deletedAt: null }

        if (user) {
            filter.user = user
        }

        if (status) {
            filter.status = status
        }

        const orders = await Order.find(filter)
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 })

        res.status(200).json({ count: orders.length, orders })
    } catch (error) {
        sendError(res, error)
    }
}

const getOrder = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid order id" })
        }

        const order = await Order.findOne({ _id: id, deletedAt: null })
            .populate("user", "firstName lastName email")
            .populate("items.product", "name images")

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        res.status(200).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

const createOrder = async (req, res) => {
    try {
        const { user, items, paymentMethod, shippingAddressSnapshot } = req.body || {}

        if (!isValidId(user)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Order must have at least one item" })
        }

        const orderItems = []

        for (const item of items) {
            if (!isValidId(item.product)) {
                return res.status(400).json({ error: "Invalid product id" })
            }

            const quantity = Number(item.quantity)

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({ error: "Quantity must be a positive whole number" })
            }

            const product = await Product.findOne({ _id: item.product, deletedAt: null })

            if (!product) {
                return res.status(404).json({ error: "Product not found" })
            }

            if (!product.isActive) {
                return res.status(400).json({ error: product.name + " is not available" })
            }

            if (product.stock < quantity) {
                return res.status(400).json({ error: "Only " + product.stock + " left for " + product.name })
            }

            orderItems.push({
                product: product._id,
                productNameSnapshot: product.name,
                priceSnapshot: product.price,
                quantity
            })
        }

        const order = await Order.create({
            user,
            items: orderItems,
            paymentMethod,
            shippingAddressSnapshot
        })

        for (const item of orderItems) {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
        }

        await Cart.updateOne({ user }, { $set: { items: [] } })

        res.status(201).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body || {}

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid order id" })
        }

        const updates = { status }
        const timestampField = statusTimestamps[status]

        if (timestampField) {
            updates[timestampField] = new Date()
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, deletedAt: null },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        res.status(200).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid order id" })
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        res.status(200).json({ message: "Order deleted", order })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    deleteOrder
}
