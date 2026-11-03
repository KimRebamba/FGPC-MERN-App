const validator = require("validator")
const bcrypt = require("bcryptjs")
const User = require("../Models/User")
const AuthIdentity = require("../Models/AuthIdentity")
const { signToken } = require("../utils/jwt")
const { toSafeUser } = require("../utils/safeUser")
const { sendError } = require("../utils/http")
const { setSessionCookie, clearSessionCookie } = require("../utils/cookies")
const { uploadSingleImage } = require("../utils/uploads")
const { pickFields } = require("../utils/http")
const { isFirebaseConfigured, verifyGoogleIdToken } = require("../config/firebase")

const sendSession = (res, user, remember, statusCode = 200) => {
    const token = signToken(user._id)

    setSessionCookie(res, token, remember)

    res.status(statusCode).json({
        token,
        user: toSafeUser(user)
    })
}

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

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Please enter a valid email address" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existingUser = await User.findOne({ email: normalizedEmail })

        if (existingUser) {
            return res.status(409).json({ error: "An account with this email already exists" })
        }

        const user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            contactNumber: contactNumber || null,
            role: "customer"
        })

        sendSession(res, user, true, 201)
    } catch (error) {
        sendError(res, error)
    }
}

const login = async (req, res) => {
    try {
        const { email, password, remember } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), deletedAt: null }).select("+password")

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        if (!user.password) {
            return res.status(400).json({ error: "This account uses Google sign-in. Continue with Google instead" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        if (user.isDeactivated) {
            return res.status(403).json({ error: "This account has been deactivated" })
        }

        sendSession(res, user, Boolean(remember))
    } catch (error) {
        sendError(res, error)
    }
}

// [prof-requirements: Quiz 4 - Gmail login using firebase (15pts)]
const googleLogin = async (req, res) => {
    try {
        const { idToken, remember = true } = req.body || {}

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
                password: null,
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

        sendSession(res, user, Boolean(remember))
    } catch (error) {
        sendError(res, error)
    }
}

const getCurrentUser = async (req, res) => {
    res.status(200).json(toSafeUser(req.user))
}

const updateCurrentUser = async (req, res) => {
    try {
        const updates = pickFields(req.body, ["firstName", "lastName", "contactNumber", "addresses"])

        if (req.file) {
            updates.profilePath = await uploadSingleImage(req.file, "profiles")
        }

        if (typeof updates.addresses === "string") {
            try {
                updates.addresses = JSON.parse(updates.addresses)
            } catch (error) {
                return res.status(400).json({ error: "Addresses must be a JSON array" })
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" })
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            returnDocument: "after",
            runValidators: true
        })

        res.status(200).json(toSafeUser(user))
    } catch (error) {
        sendError(res, error)
    }
}


const verifyPassword = async (req, res) => {
    try {
        const { password } = req.body || {}

        if (!password) {
            return res.status(400).json({ error: "Password is required" })
        }

        const user = await User.findById(req.user._id).select("+password")

        if (!user || !user.password) {
            return res.status(400).json({ error: "This account does not have a password set" })
        }

        const isCorrect = await bcrypt.compare(password, user.password)

        if (!isCorrect) {
            return res.status(401).json({ error: "Incorrect password" })
        }

        res.status(200).json({ message: "Password verified" })
    } catch (error) {
        sendError(res, error)
    }
}


const changePassword = async (req, res) => {
    try {
        const { password } = req.body || {}

        if (!password) {
            return res.status(400).json({ error: "New password is required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }

        const hashed = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate(req.user._id, { password: hashed })

        res.status(200).json({ message: "Password updated successfully" })
    } catch (error) {
        sendError(res, error)
    }
}

const logout = async (req, res) => {
    clearSessionCookie(res)

    res.status(200).json({ message: "Logged out" })
}

module.exports = {
    register,
    login,
    googleLogin,
    getCurrentUser,
    updateCurrentUser,
    verifyPassword,
    changePassword,
    logout
}
