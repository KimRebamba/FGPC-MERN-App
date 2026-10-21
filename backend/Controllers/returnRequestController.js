const ReturnRequest = require("../Models/ReturnRequest")
const Order = require("../Models/Order")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["status", "resolution", "adminNotes"]

const buildRequestNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.floor(1000 + Math.random() * 9000)

    return "RR-" + year + month + day + "-" + random
}

const getReturnRequests = async (req, res) => {
    try {
        const { user, order, status } = req.query
        const filter = { deletedAt: null }

        if (user) {
            filter.user = user
        }

        if (order) {
            filter.order = order
        }

        if (status) {
            filter.status = status
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
            .populate("order", "status paymentMethod")

        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" })
        }

        res.status(200).json(returnRequest)
    } catch (error) {
        sendError(res, error)
    }
}

const createReturnRequest = async (req, res) => {
    try {
        const { user, order, items } = req.body || {}

        if (!isValidId(user) || !isValidId(order)) {
            return res.status(400).json({ error: "Valid user and order ids are required" })
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Return request must have at least one item" })
        }

        const placedOrder = await Order.findOne({ _id: order, user, deletedAt: null })

        if (!placedOrder) {
            return res.status(404).json({ error: "Order not found for this user" })
        }

        const returnItems = []

        for (const item of items) {
            const orderItem = placedOrder.items.id(item.orderItemId)

            if (!orderItem) {
                return res.status(400).json({ error: "Order item not found in this order" })
            }

            const quantity = Number(item.quantity)

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > orderItem.quantity) {
                return res.status(400).json({ error: "Return quantity must be between 1 and " + orderItem.quantity })
            }

            returnItems.push({
                orderItemId: orderItem._id,
                quantity,
                reason: item.reason
            })
        }

        const returnRequest = await ReturnRequest.create({
            requestNumber: buildRequestNumber(),
            user,
            order,
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

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        if (updates.status === "completed") {
            updates.completedAt = new Date()
        }

        const returnRequest = await ReturnRequest.findOneAndUpdate(
            { _id: id, deletedAt: null },
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

const deleteReturnRequest = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid return request id" })
        }

        const returnRequest = await ReturnRequest.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
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
    deleteReturnRequest
}
