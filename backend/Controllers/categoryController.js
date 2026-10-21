const Category = require("../Models/Category")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "imagePath", "isActive"]

const getCategories = async (req, res) => {
    try {
        const { search, isActive } = req.query
        const filter = { deletedAt: null }

        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true"
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
        const category = await Category.create(pickFields(req.body, editableFields))

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

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const category = await Category.findOneAndUpdate(
            { _id: id, deletedAt: null },
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
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!category) {
            return res.status(404).json({ error: "Category not found" })
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
