const Review = require("../Models/Review")
const Order = require("../Models/Order")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["rating", "title", "description", "images"]

const getReviews = async (req, res) => {
    try {
        const { product, user, rating } = req.query
        const filter = { deletedAt: null }

        if (product) {
            filter.product = product
        }

        if (user) {
            filter.user = user
        }

        if (rating) {
            filter.rating = Number(rating)
        }

        const reviews = await Review.find(filter)
            .populate("user", "firstName lastName")
            .populate("product", "name")
            .sort({ createdAt: -1 })

        res.status(200).json({ count: reviews.length, reviews })
    } catch (error) {
        sendError(res, error)
    }
}

const getReview = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid review id" })
        }

        const review = await Review.findOne({ _id: id, deletedAt: null })
            .populate("user", "firstName lastName")
            .populate("product", "name")

        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        res.status(200).json(review)
    } catch (error) {
        sendError(res, error)
    }
}

const createReview = async (req, res) => {
    try {
        const { user, product, order, rating, title, description, images } = req.body || {}

        if (!isValidId(user) || !isValidId(product) || !isValidId(order)) {
            return res.status(400).json({ error: "Valid user, product and order ids are required" })
        }

        const placedOrder = await Order.findOne({ _id: order, user, deletedAt: null })

        if (!placedOrder) {
            return res.status(404).json({ error: "Order not found for this user" })
        }

        const isVerifiedPurchase = placedOrder.items.some((item) => item.product.equals(product))

        const review = await Review.create({
            user,
            product,
            order,
            rating,
            title,
            description,
            images,
            isVerifiedPurchase
        })

        res.status(201).json(review)
    } catch (error) {
        sendError(res, error)
    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid review id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const review = await Review.findOneAndUpdate(
            { _id: id, deletedAt: null },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        res.status(200).json(review)
    } catch (error) {
        sendError(res, error)
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid review id" })
        }

        const review = await Review.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        res.status(200).json({ message: "Review deleted", review })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
}
