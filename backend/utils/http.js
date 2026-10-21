const mongoose = require("mongoose")

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const pickFields = (source = {}, allowedFields) => {
    const picked = {}

    for (const field of allowedFields) {
        if (source[field] !== undefined) {
            picked[field] = source[field]
        }
    }

    return picked
}

const sendError = (res, error) => {
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: error.message })
    }

    if (error.code === 11000) {
        return res.status(409).json({ error: "A record with these details already exists" })
    }

    return res.status(500).json({ error: error.message })
}

module.exports = {
    isValidId,
    pickFields,
    sendError
}
