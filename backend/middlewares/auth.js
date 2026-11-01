const User = require("../Models/User")
const { verifyToken } = require("../utils/jwt")
const { SESSION_COOKIE } = require("../utils/cookies")

const readToken = (req) => {
    if (req.cookies && req.cookies[SESSION_COOKIE]) {
        return req.cookies[SESSION_COOKIE]
    }

    const header = req.headers.authorization || ""

    if (header.startsWith("Bearer ")) {
        return header.slice(7)
    }

    return null
}

const protect = async (req, res, next) => {
    try {
        const token = readToken(req)

        if (!token) {
            return res.status(401).json({ error: "You must be logged in to do this" })
        }

        const decoded = verifyToken(token)
        const user = await User.findOne({ _id: decoded.id, deletedAt: null })

        if (!user) {
            return res.status(401).json({ error: "This account no longer exists" })
        }

        if (user.isDeactivated) {
            return res.status(403).json({ error: "This account has been deactivated" })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ error: "Your session is invalid or has expired" })
    }
}

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access is required" })
    }

    next()
}

module.exports = {
    protect,
    requireAdmin
}
