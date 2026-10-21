const bcrypt = require("bcryptjs")
const User = require("../Models/User")
const { toSafeUser } = require("../utils/safeUser")
const { isValidId, pickFields, sendError } = require("../utils/http")

const editableFields = [
    "firstName",
    "lastName",
    "email",
    "contactNumber",
    "profilePath",
    "addresses",
    "role",
    "isDeactivated",
    "emailVerifiedAt"
]

const getUsers = async (req, res) => {
    try {
        const { search, role, isDeactivated } = req.query
        const filter = { deletedAt: null }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }

        if (role) {
            filter.role = role
        }

        if (isDeactivated !== undefined) {
            filter.isDeactivated = isDeactivated === "true"
        }

        const users = await User.find(filter).sort({ createdAt: -1 })

        res.status(200).json({ count: users.length, users })
    } catch (error) {
        sendError(res, error)
    }
}

const getUser = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        const user = await User.findOne({ _id: id, deletedAt: null })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json(user)
    } catch (error) {
        sendError(res, error)
    }
}

const createUser = async (req, res) => {
    try {
        const details = pickFields(req.body, editableFields)

        if (req.body?.password) {
            details.password = await bcrypt.hash(req.body.password, 10)
        }

        const user = await User.create(details)

        res.status(201).json(toSafeUser(user))
    } catch (error) {
        sendError(res, error)
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        const updates = pickFields(req.body, editableFields)

        if (req.body?.password) {
            updates.password = await bcrypt.hash(req.body.password, 10)
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const user = await User.findOneAndUpdate(
            { _id: id, deletedAt: null },
            updates,
            { returnDocument: "after", runValidators: true }
        )

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json(toSafeUser(user))
    } catch (error) {
        sendError(res, error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({ error: "Invalid user id" })
        }

        const user = await User.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.body?.deletedBy ?? null },
            { returnDocument: "after" }
        )

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message: "User deleted", user: toSafeUser(user) })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}
