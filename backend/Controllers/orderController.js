const mongoose = require("mongoose")
const Order = require("../Models/Order")
const Product = require("../Models/Product")
const Cart = require("../Models/Cart")
const ReturnRequest = require("../Models/ReturnRequest")
const { isValidId, sendError } = require("../utils/http")
const { sendOrderTransactionEmail } = require("../utils/mailer")

const shouldUseTransactions = () => {
    return (
        String(process.env.DEPLOY_TO_RENDER).toLowerCase() === "true" ||
        Boolean(process.env.RENDER) ||
        String(process.env.USE_MONGO_TRANSACTIONS).toLowerCase() === "true"
    )
}

const withOptionalTransaction = async (workFn) => {
    if (shouldUseTransactions()) {
        let session = null
        try {
            session = await mongoose.startSession()
            session.startTransaction()
            const result = await workFn(session)
            await session.commitTransaction()
            return result
        } catch (error) {
            if (session) {
                try {
                    await session.abortTransaction()
                } catch (_) { }
            }

            const isNoReplicaSetError =
                error.message?.includes("replica set member") ||
                error.message?.includes("Transaction numbers are only allowed") ||
                error.codeName === "IllegalOperation"

            if (isNoReplicaSetError) {
                console.warn("[Database] Standalone MongoDB detected (no replica set). Falling back to standard execution.")
                return await workFn(null)
            }

            throw error
        } finally {
            if (session) {
                session.endSession()
            }
        }
    }

    return await workFn(null)
}

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

        const order = await withOptionalTransaction(async (session) => {
            const sessionOpt = session ? { session } : {}
            const orderItems = []

            for (const item of items) {
                if (!isValidId(item.product)) {
                    const err = new Error("Invalid product id")
                    err.statusCode = 400
                    throw err
                }

                const quantity = Number(item.quantity)

                if (!Number.isInteger(quantity) || quantity < 1) {
                    const err = new Error("Quantity must be a positive whole number")
                    err.statusCode = 400
                    throw err
                }

                const product = await Product.findOne({ _id: item.product, deletedAt: null }, null, sessionOpt)

                if (!product) {
                    const err = new Error("Product not found")
                    err.statusCode = 404
                    throw err
                }

                if (!product.isActive) {
                    const err = new Error(product.name + " is not available")
                    err.statusCode = 400
                    throw err
                }

                if (product.stock < quantity) {
                    const err = new Error("Only " + product.stock + " left for " + product.name)
                    err.statusCode = 400
                    throw err
                }

                orderItems.push({
                    product: product._id,
                    productNameSnapshot: product.name,
                    priceSnapshot: product.price,
                    quantity
                })
            }

            let createdOrder
            if (session) {
                const [newOrder] = await Order.create([{
                    user: targetUser,
                    items: orderItems,
                    paymentMethod,
                    shippingAddressSnapshot
                }], { session })
                createdOrder = newOrder
            } else {
                createdOrder = await Order.create({
                    user: targetUser,
                    items: orderItems,
                    paymentMethod,
                    shippingAddressSnapshot
                })
            }

            for (const item of orderItems) {
                await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: -item.quantity } },
                    sessionOpt
                )
            }

            await Cart.updateOne(
                { user: targetUser },
                { $set: { items: [] } },
                sessionOpt
            )

            return createdOrder
        })

        sendOrderTransactionEmail(order, "Your order has been placed successfully and is pending confirmation.").catch(console.error)

        res.status(201).json(order)
    } catch (error) {
        sendError(res, error)
    }
}

// [prof-requirements: Term Test Lab - Admin updates the status of the transaction (5pts)]
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

// [prof-requirements: Term Test Lab - Completed transaction (10pts)]
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

        const cancelledOrder = await withOptionalTransaction(async (session) => {
            const sessionOpt = session ? { session } : {}
            const order = await Order.findOne({ _id: id, deletedAt: null }, null, sessionOpt)

            if (!order) {
                const err = new Error("Order not found")
                err.statusCode = 404
                throw err
            }

            const isOwner = String(order.user) === String(req.user._id)
            const isAdmin = req.user.role === "admin"
            if (!isAdmin && !isOwner) {
                const err = new Error("This order belongs to another account")
                err.statusCode = 403
                throw err
            }

            if (order.status !== "pending") {
                const err = new Error("Orders can only be cancelled while in pending status.")
                err.statusCode = 400
                throw err
            }

            order.status = "cancelled"
            order.cancelledAt = new Date()
            await order.save(sessionOpt)

            for (const item of order.items) {
                if (item.product) {
                    await Product.updateOne(
                        { _id: item.product },
                        { $inc: { stock: item.quantity } },
                        sessionOpt
                    )
                }
            }

            return order
        })

        sendOrderTransactionEmail(cancelledOrder, "Your order transaction has been cancelled.").catch(console.error)

        res.status(200).json({ message: "Order cancelled successfully", order: cancelledOrder })
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
