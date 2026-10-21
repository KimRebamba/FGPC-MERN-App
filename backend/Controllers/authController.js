const bcrypt = require("bcryptjs")
const User = require("../Models/User")
const AuthIdentity = require("../Models/AuthIdentity")
const { signToken } = require("../utils/jwt")
const { toSafeUser } = require("../utils/safeUser")
const { sendError } = require("../utils/http")
const { isFirebaseConfigured, verifyGoogleIdToken } = require("../config/firebase")

const buildSession = (user) => ({
    token: signToken(user._id),
    user: toSafeUser(user)
})

const splitGoogleName = (name, email) => {
    const nameParts = (name || "").trim().split(" ").filter(Boolean)

    return {
        firstName: nameParts[0] || email.split("@")[0],
        lastName: nameParts.slice(1).join(" ")
    }
}

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, contactNumber } = req.body || {}

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "First name, last name, email and password are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

        if (existingUser) {
            return res.status(409).json({ error: "An account with this email already exists" })
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 10),
            contactNumber: contactNumber || null,
            role: "customer"
        })

        res.status(201).json(buildSession(user))
    } catch (error) {
        sendError(res, error)
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), deletedAt: null }).select("+password")

        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        if (user.isDeactivated) {
            return res.status(403).json({ error: "This account has been deactivated" })
        }

        res.status(200).json(buildSession(user))
    } catch (error) {
        sendError(res, error)
    }
}

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body || {}

        if (!idToken) {
            return res.status(400).json({ error: "Google id token is required" })
        }

        if (!isFirebaseConfigured()) {
            return res.status(503).json({ error: "Google sign-in is not configured yet. Add your Firebase service account key first" })
        }

        const googleUser = await verifyGoogleIdToken(idToken)

        if (!googleUser.email) {
            return res.status(400).json({ error: "This Google account has no email address" })
        }

        const email = googleUser.email.toLowerCase()
        const identity = await AuthIdentity.findOne({
            provider: "google",
            providerUserId: googleUser.providerUserId
        })

        let user = identity ? await User.findOne({ _id: identity.user, deletedAt: null }) : null

        if (!user) {
            user = await User.findOne({ email, deletedAt: null })
        }

        if (!user) {
            const { firstName, lastName } = splitGoogleName(googleUser.name, email)

            user = await User.create({
                firstName,
                lastName,
                email,
                role: "customer",
                emailVerifiedAt: googleUser.emailVerified ? new Date() : null
            })
        }

        if (user.isDeactivated) {
            return res.status(403).json({ error: "This account has been deactivated" })
        }

        if (identity) {
            identity.user = user._id
            identity.providerEmail = email
            identity.linkedAt = new Date()
            await identity.save()
        } else {
            await AuthIdentity.create({
                user: user._id,
                provider: "google",
                providerUserId: googleUser.providerUserId,
                providerEmail: email,
                linkedAt: new Date()
            })
        }

        res.status(200).json(buildSession(user))
    } catch (error) {
        sendError(res, error)
    }
}

const getCurrentUser = async (req, res) => {
    res.status(200).json(toSafeUser(req.user))
}

module.exports = {
    register,
    login,
    googleLogin,
    getCurrentUser
}
