const BadWords = require("bad-words")
const Review = require("../Models/Review")
const Order = require("../Models/Order")
const Product = require("../Models/Product")
const { isValidId, pickFields, sendError } = require("../utils/http")

const FilterClass = BadWords.Filter || BadWords
const badWords = new FilterClass()

const maskBadWords = (text) => {
    if (!text || typeof text !== "string") return ""
    try {
        return badWords.clean(text)
    } catch (e) {
        return text
    }
}

const editableFields = ["rating", "title", "description"]

const getReviews = async (req, res) => {
    try {
        const { product, user, rating, search } = req.query
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

        if (search && search.trim()) {
            const queryText = search.trim()
            // Find products matching product name search
            const matchingProducts = await Product.find({
                name: { $regex: queryText, $options: "i" }
            }).select("_id")

            const productIds = matchingProducts.map((p) => p._id)

            const orConditions = [
                { title: { $regex: queryText, $options: "i" } },
                { description: { $regex: queryText, $options: "i" } }
            ]

            if (productIds.length > 0) {
                orConditions.push({ product: { $in: productIds } })
            }

            const numSearch = Number(queryText)
            if (!isNaN(numSearch) && numSearch >= 1 && numSearch <= 5) {
                orConditions.push({ rating: numSearch })
            }

            filter.$or = orConditions
        }

        const reviews = await Review.find(filter)
            .populate("user", "firstName lastName profilePath")
            .populate("product", "name")
            .populate("replies.authorId", "firstName lastName role")
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
            .populate("user", "firstName lastName profilePath")
            .populate("product", "name")
            .populate("replies.authorId", "firstName lastName role")

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
        const { user, product, order, rating, title, description } = req.body || {}

        if (!isValidId(product) || !isValidId(order)) {
            return res.status(400).json({ error: "Valid product and order ids are required" })
        }

        const placedOrder = await Order.findOne({ _id: order, deletedAt: null })
        if (!placedOrder) {
            return res.status(404).json({ error: "Order not found" })
        }

        const isAdmin = req.user.role === "admin"
        const isOwner = String(placedOrder.user?._id || placedOrder.user) === String(req.user._id)

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "This order belongs to another account" })
        }

        const st = String(placedOrder.status).toLowerCase()
        if (!isAdmin && st !== "delivered" && st !== "completed") {
            return res.status(400).json({ error: "Reviews can only be submitted after your order is delivered." })
        }

        const productInOrder = placedOrder.items.some((item) =>
            String(item.product?._id || item.product) === String(product)
        )

        if (!productInOrder && !isAdmin) {
            return res.status(400).json({ error: "Product was not found in this order." })
        }

        const targetUser = isAdmin && user && isValidId(user) ? user : req.user._id

        // Mask bad words
        const cleanTitle = maskBadWords(title || "")
        const cleanDescription = maskBadWords(description || "")

        const review = await Review.create({
            user: targetUser,
            product,
            order,
            rating: Number(rating) || 5,
            title: cleanTitle,
            description: cleanDescription
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

        const existingReview = await Review.findOne({ _id: id, deletedAt: null })
        if (!existingReview) {
            return res.status(404).json({ error: "Review not found" })
        }

        const isOwner = String(existingReview.user) === String(req.user._id)
        const isAdmin = req.user.role === "admin"

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "You can only edit your own review" })
        }

        const updates = pickFields(req.body, editableFields)

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        if (updates.rating !== undefined) {
            updates.rating = Number(updates.rating)
        }

        if (updates.title) {
            updates.title = maskBadWords(updates.title)
        }

        if (updates.description) {
            updates.description = maskBadWords(updates.description)
        }

        const review = await Review.findOneAndUpdate(
            { _id: id, deletedAt: null },
            updates,
            { returnDocument: "after", runValidators: true }
        )
            .populate("user", "firstName lastName profilePath")
            .populate("product", "name")
            .populate("replies.authorId", "firstName lastName role")

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

        const existingReview = await Review.findOne({ _id: id, deletedAt: null })
        if (!existingReview) {
            return res.status(404).json({ error: "Review not found" })
        }

        const isAdmin = req.user.role === "admin"
        const isOwner = String(existingReview.user) === String(req.user._id)

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: "You are not authorized to delete this review" })
        }

        const review = await Review.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        res.status(200).json({ message: "Review deleted successfully", review })
    } catch (error) {
        sendError(res, error)
    }
}

const addReviewReply = async (req, res) => {
    try {
        const { id } = req.params
        const { comment, content } = req.body || {}
        const replyContent = (content || comment || "").trim()

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid review id" })
        }

        if (!replyContent) {
            return res.status(400).json({ error: "Reply content is required" })
        }

        const review = await Review.findOne({ _id: id, deletedAt: null })

        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        const authorRole = req.user.role === "admin" ? "admin" : "customer"

        // Mask bad words in reply content
        const cleanContent = maskBadWords(replyContent)

        review.replies.push({
            reviewId: review._id,
            authorId: req.user._id,
            authorRole,
            content: cleanContent
        })

        await review.save()
        await review.populate("user", "firstName lastName")
        await review.populate("product", "name")
        await review.populate("replies.authorId", "firstName lastName role")

        res.status(201).json(review)
    } catch (error) {
        sendError(res, error)
    }
}

const deleteReviewReply = async (req, res) => {
    try {
        const { id, replyId } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid review id" })
        }

        const review = await Review.findOne({ _id: id, deletedAt: null })
        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        const replyIndex = review.replies.findIndex((r) => String(r._id) === String(replyId))
        if (replyIndex === -1) {
            return res.status(404).json({ error: "Reply not found" })
        }

        const reply = review.replies[replyIndex]
        const isAdmin = req.user.role === "admin"
        const isAuthor = String(reply.authorId) === String(req.user._id)

        if (!isAdmin && !isAuthor) {
            return res.status(403).json({ error: "You are not authorized to delete this reply" })
        }

        review.replies.splice(replyIndex, 1)
        await review.save()
        await review.populate("user", "firstName lastName profilePath")
        await review.populate("product", "name")
        await review.populate("replies.authorId", "firstName lastName role")

        res.status(200).json({ message: "Reply deleted successfully", review })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    addReviewReply,
    deleteReviewReply
}
