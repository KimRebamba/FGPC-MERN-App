const AuthIdentity = require("../Models/AuthIdentity")
const { isValidId, sendError } = require("../utils/http")

const getAuthIdentities = async (req, res) => {
    try {
        const { provider, user } = req.query
        const filter = { deletedAt: null }

        if (provider) {
            filter.provider = provider
        }

        if (user) {
            filter.user = user
        }

        const authIdentities = await AuthIdentity.find(filter)
            .populate("user", "firstName lastName email role")
            .sort({ createdAt: -1 })

        res.status(200).json({ count: authIdentities.length, authIdentities })
    } catch (error) {
        sendError(res, error)
    }
}

const getAuthIdentity = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid auth identity id" })
        }

        const authIdentity = await AuthIdentity.findOne({ _id: id, deletedAt: null })
            .populate("user", "firstName lastName email role")

        if (!authIdentity) {
            return res.status(404).json({ error: "Auth identity not found" })
        }

        res.status(200).json(authIdentity)
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getAuthIdentities,
    getAuthIdentity
}
