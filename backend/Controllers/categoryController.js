const Category = require("../Models/Category")
const Product = require("../Models/Product")
const { uploadSingleImage } = require("../utils/uploads")
const { isValidId, toBoolean, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "imagePath", "isActive"]

const getCategories = async (req, res) => {
    try {
        const { search, isActive, status, deleted } = req.query
        let filter = {}

        if (status === "deleted" || deleted === "true") {
            filter.deletedAt = { $ne: null }
        } else if (status === "all") {
            // all categories including deleted
        } else {
            filter.deletedAt = null
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }

        if (status === "active" || isActive === "true" || isActive === true) {
            filter.isActive = true
        } else if (status === "inactive" || isActive === "false" || isActive === false) {
            filter.isActive = false
        }

        const categories = await Category.find(filter).sort({ name: 1 })

        res.status(200).json({ count: categories.length, categories })
    } catch (error) {
        sendError(res, error)
    }
}

const getCategory = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid category id" })
        }

        const category = await Category.findOne({ _id: id, deletedAt: null })

        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }

        res.status(200).json(category)
    } catch (error) {
        sendError(res, error)
    }
}

const createCategory = async (req, res) => {
    try {
        const details = pickFields(req.body, editableFields)

        if (details.isActive !== undefined) {
            details.isActive = toBoolean(details.isActive)
        }

        if (req.file) {
            details.imagePath = await uploadSingleImage(req.file, "categories")
        }

        const category = await Category.create(details)

        res.status(201).json(category)
    } catch (error) {
        sendError(res, error)
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid category id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (updates.isActive !== undefined) {
            updates.isActive = toBoolean(updates.isActive)
        }

        if (req.file) {
            updates.imagePath = await uploadSingleImage(req.file, "categories")
        }

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
            updates.isActive = true
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const category = await Category.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }

        res.status(200).json(category)
    } catch (error) {
        sendError(res, error)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid category id" })
        }

        const category = await Category.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        if (!category) {
            return res.status(404).json({ error: "Category not found or already deleted" })
        }

        res.status(200).json({ message: "Category deleted", category })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}
