const Brand = require("../Models/Brand")
const Product = require("../Models/Product")
const { uploadSingleImage } = require("../utils/uploads")
const { isValidId, toBoolean, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "logoPath", "isActive"]

const getBrands = async (req, res) => {
    try {
        const { search, isActive, status, deleted } = req.query
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

        if (status === "active" || isActive === "true" || isActive === true) {
            filter.isActive = true
        } else if (status === "inactive" || isActive === "false" || isActive === false) {
            filter.isActive = false
        }

        const brands = await Brand.find(filter).sort({ name: 1 })

        res.status(200).json({ count: brands.length, brands })
    } catch (error) {
        sendError(res, error)
    }
}

const getBrand = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid brand id" })
        }

        const brand = await Brand.findOne({ _id: id, deletedAt: null })

        if (!brand) {
            return res.status(404).json({ error: "Brand not found" })
        }

        res.status(200).json(brand)
    } catch (error) {
        sendError(res, error)
    }
}

const createBrand = async (req, res) => {
    try {
        const details = pickFields(req.body, editableFields)

        if (details.isActive !== undefined) {
            details.isActive = toBoolean(details.isActive)
        }

        if (req.file) {
            details.logoPath = await uploadSingleImage(req.file, "brands")
        }

        const brand = await Brand.create(details)

        res.status(201).json(brand)
    } catch (error) {
        sendError(res, error)
    }
}

const updateBrand = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid brand id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (updates.isActive !== undefined) {
            updates.isActive = toBoolean(updates.isActive)
        }

        if (req.file) {
            updates.logoPath = await uploadSingleImage(req.file, "brands")
        }

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
            updates.isActive = true
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const brand = await Brand.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!brand) {
            return res.status(404).json({ error: "Brand not found" })
        }

        res.status(200).json(brand)
    } catch (error) {
        sendError(res, error)
    }
}

const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid brand id" })
        }

        const brand = await Brand.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        if (!brand) {
            return res.status(404).json({ error: "Brand not found or already deleted" })
        }

        res.status(200).json({ message: "Brand deleted", brand })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
}
