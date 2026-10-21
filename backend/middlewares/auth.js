const User = require("../Models/User")
const { verifyToken } = require("../utils/jwt")

const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization || ""

        if (!header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "You must be logged in to do this" })
        }

        const token = header.slice(7)
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
