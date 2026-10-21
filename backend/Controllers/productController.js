const Product = require("../Models/Product")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "price", "category", "brand", "images", "isActive", "stock"]

const getProducts = async (req, res) => {
    try {
        const { search, category, brand, isActive } = req.query
        const filter = { deletedAt: null }

        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        if (category) {
            filter.category = category
        }

        if (brand) {
            filter.brand = brand
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true"
        }

        const products = await Product.find(filter)
            .populate("category", "name")
            .populate("brand", "name")
            .sort({ createdAt: -1 })

        res.status(200).json({ count: products.length, products })
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
            .populate("category", "name")
            .populate("brand", "name")

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json(product)
    } catch (error) {
        sendError(res, error)
    }
}

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(pickFields(req.body, editableFields))

        res.status(201).json(product)
    } catch (error) {
        sendError(res, error)
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, deletedAt: null },
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

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid product id" })
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json({ message: "Product deleted", product })
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
