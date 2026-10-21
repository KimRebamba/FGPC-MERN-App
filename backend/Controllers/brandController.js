const Brand = require("../Models/Brand")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = ["name", "description", "logoPath", "isActive"]

const getBrands = async (req, res) => {
    try {
        const { search, isActive } = req.query
        const filter = { deletedAt: null }

        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true"
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
        const brand = await Brand.create(pickFields(req.body, editableFields))

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

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const brand = await Brand.findOneAndUpdate(
            { _id: id, deletedAt: null },
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
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!brand) {
            return res.status(404).json({ error: "Brand not found" })
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
