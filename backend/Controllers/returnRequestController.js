const ReturnRequest = require("../Models/ReturnRequest")
const Order = require("../Models/Order")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["status", "resolution", "adminNotes"]

const isAdminUser = (req) => req.user.role === "admin"

const buildRequestNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.floor(1000 + Math.random() * 9000)
    const suffix = Math.floor(100 + Math.random() * 900)

    return "RR-" + year + month + day + "-" + random + "-" + suffix
}

const getReturnRequests = async (req, res) => {
    try {
        const { user, order, status, search, deleted } = req.query
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

        if (order) {
            filter.order = order
        }

        if (status && status !== "all" && status !== "deleted") {
            filter.status = status
        }

        if (search) {
            filter.$or = [
                { requestNumber: { $regex: search, $options: "i" } },
                { "items.reason": { $regex: search, $options: "i" } }
            ]
        }

        const returnRequests = await ReturnRequest.find(filter)
            .populate("user", "firstName lastName email")
            .populate("order", "status paymentMethod")
            .sort({ createdAt: -1 })

        res.status(200).json({ count: returnRequests.length, returnRequests })
    } catch (error) {
        sendError(res, error)
    }
}

const getReturnRequest = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid return request id" })
        }

        const returnRequest = await ReturnRequest.findOne({ _id: id, deletedAt: null })
            .populate("user", "firstName lastName email")
            .populate("order", "status paymentMethod items")

        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" })
        }

        if (!isAdminUser(req) && String(returnRequest.user._id) !== String(req.user._id)) {
            return res.status(403).json({ error: "This return request belongs to another account" })
        }

        res.status(200).json(returnRequest)
    } catch (error) {
        sendError(res, error)
    }
}

const createReturnRequest = async (req, res) => {
    try {
        const { user, order, items } = req.body || {}

        if (!isValidId(order)) {
            return res.status(400).json({ error: "Valid order id is required" })
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Return request must have at least one item" })
        }

        const placedOrder = await Order.findOne({ _id: order, deletedAt: null })

        if (!placedOrder) {
            return res.status(404).json({ error: "Order not found" })
        }

        const isAdmin = isAdminUser(req)
        const isOwner = String(placedOrder.user?._id || placedOrder.user) === String(req.user._id)

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "This order belongs to another account" })
        }

        const st = String(placedOrder.status).toLowerCase()
        if (st === "completed") {
            return res.status(400).json({ error: "Return requests cannot be filed once an order is marked as completed." })
        }
        if (!isAdmin && st !== "delivered") {
            return res.status(400).json({ error: "Return requests can only be filed while your order is delivered." })
        }

        const returnItems = []

        for (const item of items) {
            const orderItem = placedOrder.items.find(
                (oi) => String(oi._id) === String(item.orderItemId) ||
                        String(oi.product?._id || oi.product) === String(item.orderItemId) ||
                        String(oi.product?._id || oi.product) === String(item.productId)
            )

            if (!orderItem) {
                return res.status(400).json({ error: "Order item not found in this order" })
            }

            const quantity = Number(item.quantity)

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > orderItem.quantity) {
                return res.status(400).json({ error: "Return quantity must be between 1 and " + orderItem.quantity })
            }

            returnItems.push({
                orderItemId: orderItem._id,
                productNameSnapshot: orderItem.productNameSnapshot,
                priceSnapshot: orderItem.priceSnapshot,
                quantity,
                reason: item.reason || "Customer return request"
            })
        }

        const targetUser = isAdmin && user && isValidId(user) ? user : placedOrder.user

        const returnRequest = await ReturnRequest.create({
            requestNumber: buildRequestNumber(),
            user: targetUser,
            order: placedOrder._id,
            items: returnItems
        })

        res.status(201).json(returnRequest)
    } catch (error) {
        sendError(res, error)
    }
}

const updateReturnRequest = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid return request id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        if (updates.status === "completed") {
            updates.completedAt = new Date()
        }

        const returnRequest = await ReturnRequest.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" })
        }

        res.status(200).json(returnRequest)
    } catch (error) {
        sendError(res, error)
    }
}

const cancelReturnRequest = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid return request id" })
        }

        const returnRequest = await ReturnRequest.findOne({ _id: id, deletedAt: null })
        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" })
        }

        const isOwner = String(returnRequest.user) === String(req.user._id)
        const isAdmin = isAdminUser(req)
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "This return request belongs to another account" })
        }

        if (returnRequest.status !== "pending") {
            return res.status(400).json({ error: "Return requests can only be cancelled while in pending status." })
        }

        returnRequest.status = "cancelled"
        await returnRequest.save()

        res.status(200).json({ message: "Return request cancelled successfully", returnRequest })
    } catch (error) {
        sendError(res, error)
    }
}

const deleteReturnRequest = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid return request id" })
        }

        const returnRequest = await ReturnRequest.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" })
        }

        res.status(200).json({ message: "Return request deleted", returnRequest })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getReturnRequests,
    getReturnRequest,
    createReturnRequest,
    updateReturnRequest,
    cancelReturnRequest,
    deleteReturnRequest
}
