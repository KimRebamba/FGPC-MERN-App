const mongoose = require("mongoose")
const Product = require("../Models/Product")
const Category = require("../Models/Category")
const Brand = require("../Models/Brand")
const Review = require("../Models/Review")
const Cart = require("../Models/Cart")
const { uploadManyImages } = require("../utils/uploads")
const { isValidId, toBoolean, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "price", "category", "brand", "images", "isActive", "stock"]

// [prof-requirements: MP2 - Filter functions: price filter, category filter, ratings filter]
const getProducts = async (req, res) => {
    try {
        const { search, category, brand, isActive, status, deleted, minPrice, maxPrice, minRating } = req.query
        let filter = {}

        if (status === "deleted" || deleted === "true") {
            filter.deletedAt = { $ne: null }
        } else if (status === "all") {
        } else {
            filter.deletedAt = null
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }

        if (category) {
            if (isValidId(category)) {
                filter.category = category
            } else {
                const matchedCategory = await Category.findOne({
                    name: { $regex: category.trim(), $options: "i" },
                    deletedAt: null
                })
                if (matchedCategory) {
                    filter.category = matchedCategory._id
                } else {
                    return res.status(200).json({ count: 0, products: [] })
                }
            }
        }

        if (brand) {
            if (isValidId(brand)) {
                filter.brand = brand
            } else {
                const matchedBrand = await Brand.findOne({
                    name: { $regex: brand.trim(), $options: "i" },
                    deletedAt: null
                })
                if (matchedBrand) {
                    filter.brand = matchedBrand._id
                } else {
                    return res.status(200).json({ count: 0, products: [] })
                }
            }
        }

        if (status === "active" || isActive === "true" || isActive === true) {
            filter.isActive = true
        } else if (status === "inactive" || isActive === "false" || isActive === false) {
            filter.isActive = false
        } else if (status === "out_of_stock") {
            filter.stock = { $lte: 0 }
        }

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) {
                filter.price.$gte = mongoose.Types.Decimal128.fromString(String(minPrice))
            }
            if (maxPrice) {
                filter.price.$lte = mongoose.Types.Decimal128.fromString(String(maxPrice))
            }
        }

        const products = await Product.find(filter)
            .populate("category", "name isActive deletedAt")
            .populate("brand", "name isActive deletedAt")
            .sort({ createdAt: -1 })

        const reviewStats = await Review.aggregate([
            { $match: { deletedAt: null } },
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ])

        const ratingMap = {}
        reviewStats.forEach((stat) => {
            ratingMap[String(stat._id)] = {
                avgRating: Math.round(stat.avgRating * 10) / 10,
                reviewCount: stat.count
            }
        })

        let enrichedProducts = products.map((prod) => {
            const json = prod.toJSON()
            const stats = ratingMap[String(prod._id)] || { avgRating: 0, reviewCount: 0 }

            let categoryObj = json.category
            if (!categoryObj || categoryObj.deletedAt || categoryObj.isActive === false) {
                categoryObj = {
                    _id: categoryObj?._id || null,
                    name: "Uncategorized",
                    isInactiveOrDeleted: true
                }
            }

            let brandObj = json.brand
            if (!brandObj || brandObj.deletedAt || brandObj.isActive === false) {
                brandObj = {
                    _id: brandObj?._id || null,
                    name: "No Brand",
                    isInactiveOrDeleted: true
                }
            }

            return {
                ...json,
                category: categoryObj,
                brand: brandObj,
                averageRating: stats.avgRating,
                reviewCount: stats.reviewCount
            }
        })

        if (minRating) {
            const threshold = Number(minRating)
            enrichedProducts = enrichedProducts.filter((p) => p.averageRating >= threshold)
        }

        enrichedProducts.sort((a, b) => {
            const aInStock = (a.stock || 0) > 0 ? 1 : 0
            const bInStock = (b.stock || 0) > 0 ? 1 : 0
            if (aInStock !== bInStock) {
                return bInStock - aInStock
            }
            return 0
        })

        res.status(200).json({ count: enrichedProducts.length, products: enrichedProducts })
    } catch (error) {
        sendError(res, error)
    }
}

const getProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const product = await Product.findOne({ _id: id, deletedAt: null })
            .populate("category", "name isActive deletedAt")
            .populate("brand", "name isActive deletedAt")

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        const reviewStats = await Review.aggregate([
            { $match: { product: product._id, deletedAt: null } },
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ])

        const json = product.toJSON()
        if (!json.category || json.category.deletedAt || json.category.isActive === false) {
            json.category = {
                _id: json.category?._id || null,
                name: "Uncategorized",
                isInactiveOrDeleted: true
            }
        }
        if (!json.brand || json.brand.deletedAt || json.brand.isActive === false) {
            json.brand = {
                _id: json.brand?._id || null,
                name: "No Brand",
                isInactiveOrDeleted: true
            }
        }
        json.averageRating = reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0
        json.reviewCount = reviewStats.length > 0 ? reviewStats[0].count : 0

        res.status(200).json(json)
    } catch (error) {
        sendError(res, error)
    }
}

// [prof-requirements: MP1 - Product CRUD: create with multiple photo upload]
const createProduct = async (req, res) => {
    try {
        const details = pickFields(req.body, editableFields)

        if (details.isActive !== undefined) {
            details.isActive = toBoolean(details.isActive)
        }

        if (details.brand === "") {
            details.brand = null
        }

        const uploadedImages = await uploadManyImages(req.files, "products")

        if (uploadedImages) {
            details.images = uploadedImages
        }

        const product = await Product.create(details)

        res.status(201).json(product)
    } catch (error) {
        sendError(res, error)
    }
}

// [prof-requirements: MP1 - Product CRUD: update product]
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (updates.isActive !== undefined) {
            updates.isActive = toBoolean(updates.isActive)
        }

        if (updates.brand === "") {
            updates.brand = null
        }

        const uploadedImages = await uploadManyImages(req.files, "products")

        if (uploadedImages) {
            updates.images = uploadedImages
        }

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
            updates.isActive = true
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const product = await Product.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json(product)
    } catch (error) {
        sendError(res, error)
    }
}

// [prof-requirements: MP1 - Product CRUD: soft deletion]
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        const carts = await Cart.updateMany(
            { "items.product": product._id },
            { $pull: { items: { product: product._id } } }
        )

        res.status(200).json({
            message: "Product deleted",
            product,
            cartsUpdated: carts.modifiedCount
        })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}
