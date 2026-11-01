const Order = require("../Models/Order")
const Product = require("../Models/Product")
const Cart = require("../Models/Cart")
const ReturnRequest = require("../Models/ReturnRequest")
const { isValidId, sendError } = require("../utils/http")
const { sendOrderTransactionEmail } = require("../utils/mailer")

const statusTimestamps = {
    shipped: "shippedAt",
    delivered: "deliveredAt",
    completed: "completedAt",
    cancelled: "cancelledAt"
}

const isAdminUser = (req) => req.user.role === "admin"

const getOrders = async (req, res) => {
    try {
        const { user, status, paymentMethod, search, deleted } = req.query
        let filter = {}

        if (deleted === "true" || status === "deleted") {
            filter.deletedAt = { $ne: null }
        } else if (status === "all") {
            // all
        } else {
            filter.deletedAt = null
        }

        if (isAdminUser(req)) {
            if (user) {
                filter.user = user
            }
        } else {
            filter.user = req.user._id
        }

        if (status && status !== "all" && status !== "deleted") {
            filter.status = status
        }

        if (paymentMethod && paymentMethod !== "all") {
            filter.paymentMethod = paymentMethod
        }

        if (search) {
            if (isValidId(search)) {
                filter._id = search
            } else {
                filter.$or = [
                    { "shippingAddressSnapshot.recipientName": { $regex: search, $options: "i" } },
                    { "shippingAddressSnapshot.contactNumber": { $regex: search, $options: "i" } },
                    { "items.productNameSnapshot": { $regex: search, $options: "i" } }
                ]
            }
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

        if (!isAdminUser(req) && String(order.user._id) !== String(req.user._id)) {
            return res.status(403).json({ error: "This order belongs to another account" })
        }

        res.status(200).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

const createOrder = async (req, res) => {
    try {
        const { user, items, paymentMethod, shippingAddressSnapshot } = req.body || {}
        const targetUser = isAdminUser(req) && user ? user : req.user._id

        if (!isValidId(targetUser)) {
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
            user: targetUser,
            items: orderItems,
            paymentMethod,
            shippingAddressSnapshot
        })

        for (const item of orderItems) {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
        }

        await Cart.updateOne({ user: targetUser }, { $set: { items: [] } })

        sendOrderTransactionEmail(order, "Your order has been placed successfully and is pending confirmation.").catch(console.error)

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

        const existingOrder = await Order.findById(id)
        if (!existingOrder) {
            return res.status(404).json({ error: "Order not found" })
        }

        if (existingOrder.status === "completed") {
            return res.status(400).json({ error: "Order has already been completed and cannot be modified." })
        }

        if (existingOrder.status === "cancelled") {
            return res.status(400).json({ error: "Cancelled orders cannot be modified." })
        }

        const updates = {}
        if (status) {
            updates.status = status
            const timestampField = statusTimestamps[status]
            if (timestampField) {
                updates[timestampField] = new Date()
            }
        }

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
        }

        const order = await Order.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (status && status !== existingOrder.status) {
            sendOrderTransactionEmail(order, `Transaction status updated to ${status.toUpperCase()} by admin.`).catch(console.error)
        }

        res.status(200).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

const completeOrder = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid order id" })
        }

        const order = await Order.findOne({ _id: id, deletedAt: null })
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        const isOwner = String(order.user) === String(req.user._id)
        const isAdmin = req.user.role === "admin"
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "This order belongs to another account" })
        }

        if (order.status !== "delivered") {
            return res.status(400).json({ error: "Orders can only be marked as completed after delivery." })
        }

        order.status = "completed"
        order.completedAt = new Date()
        await order.save()

        sendOrderTransactionEmail(order, "Your order transaction has been completed. Thank you for shopping with FGP!").catch(console.error)

        res.status(200).json({ message: "Order marked as completed", order })
    } catch (error) {
        sendError(res, error)
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid order id" })
        }

        const order = await Order.findOne({ _id: id, deletedAt: null })
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        const isOwner = String(order.user) === String(req.user._id)
        const isAdmin = req.user.role === "admin"
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "This order belongs to another account" })
        }

        if (order.status !== "pending") {
            return res.status(400).json({ error: "Orders can only be cancelled while in pending status." })
        }

        order.status = "cancelled"
        order.cancelledAt = new Date()
        await order.save()

        // Restore product inventory
        for (const item of order.items) {
            if (item.product) {
                await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
            }
        }

        sendOrderTransactionEmail(order, "Your order transaction has been cancelled.").catch(console.error)

        res.status(200).json({ message: "Order cancelled successfully", order })
    } catch (error) {
        sendError(res, error)
    }
}

const deleteOrder = async (req, res) => {
    return res.status(403).json({ error: "Orders cannot be deleted once placed." })
}

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
    deleteOrder
}
