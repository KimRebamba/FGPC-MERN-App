const bcrypt = require("bcryptjs")
const User = require("../Models/User")
const AuthIdentity = require("../Models/AuthIdentity")
const Cart = require("../Models/Cart")
const { toSafeUser } = require("../utils/safeUser")
const { uploadSingleImage } = require("../utils/uploads")
const { isValidId, toBoolean, pickFields, sendError } = require("../utils/http")

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
        const { search, role, isDeactivated, status, deleted } = req.query
        let filter = {}

        if (deleted === "true" || status === "deleted") {
            filter.deletedAt = { $ne: null }
        } else if (status === "all") {
        } else {
            filter.deletedAt = null
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }

        if (role && role !== "all") {
            filter.role = role
        }

        if (status === "deactivated" || isDeactivated === "true" || isDeactivated === true) {
            filter.isDeactivated = true
        } else if (status === "active" || isDeactivated === "false" || isDeactivated === false) {
            filter.isDeactivated = false
        }

        const users = await User.find(filter).sort({ createdAt: -1 }).lean()
        const userIds = users.map((u) => u._id)
        const googleIdentities = await AuthIdentity.find({
            user: { $in: userIds },
            provider: "google",
            deletedAt: null
        }).lean()
        const googleUserIds = new Set(googleIdentities.map((i) => String(i.user)))

        const usersWithAuth = users.map((u) => ({
            ...u,
            isGoogleUser: googleUserIds.has(String(u._id))
        }))

        res.status(200).json({ count: usersWithAuth.length, users: usersWithAuth })
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

        const user = await User.findOne({ _id: id, deletedAt: null }).lean()

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const googleIdentity = await AuthIdentity.findOne({
            user: user._id,
            provider: "google",
            deletedAt: null
        }).lean()

        user.isGoogleUser = Boolean(googleIdentity)

        res.status(200).json(user)
    } catch (error) {
        sendError(res, error)
    }
}

const createUser = async (req, res) => {
    try {
        const details = pickFields(req.body, editableFields)

        if (details.isDeactivated !== undefined) {
            details.isDeactivated = toBoolean(details.isDeactivated)
        }

        if (req.body?.password) {
            details.password = await bcrypt.hash(req.body.password, 10)
        }

        if (req.file) {
            details.profilePath = await uploadSingleImage(req.file, "profiles")
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
        const isSelf = id === String(req.user._id)

        if (updates.isDeactivated !== undefined) {
            updates.isDeactivated = toBoolean(updates.isDeactivated)
        }

        if (isSelf && updates.isDeactivated === true) {
            return res.status(400).json({ error: "You cannot deactivate your own account" })
        }

        if (isSelf && updates.role && updates.role !== "admin") {
            return res.status(400).json({ error: "You cannot change your own role" })
        }

        if (req.body?.password) {
            updates.password = await bcrypt.hash(req.body.password, 10)
        }

        if (req.file) {
            updates.profilePath = await uploadSingleImage(req.file, "profiles")
        }

        if (req.body.restore === "true" || req.body.restore === true) {
            updates.deletedAt = null
            updates.deletedBy = null
            updates.isDeactivated = false
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const user = await User.findOneAndUpdate(
            { _id: id },
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

        if (id === String(req.user._id)) {
            return res.status(400).json({ error: "You cannot delete your own account" })
        }

        const user = await User.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date(), deletedBy: req.user._id },
            { returnDocument: "after" }
        )

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        await Promise.all([
            AuthIdentity.updateMany(
                { user: user._id, deletedAt: null },
                { deletedAt: user.deletedAt, deletedBy: req.user._id }
            ),
            Cart.updateMany(
                { user: user._id, deletedAt: null },
                { deletedAt: user.deletedAt, deletedBy: req.user._id }
            )
        ])

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
