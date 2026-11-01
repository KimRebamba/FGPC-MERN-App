const express = require("express")
const router = express.Router()

const {
    register,
    login,
    googleLogin,
    getCurrentUser,
    updateCurrentUser,
    verifyPassword,
    changePassword,
    logout
} = require("../Controllers/authController")
const { protect } = require("../middlewares/auth")
const { profileImage } = require("../middlewares/upload")

router.post("/register", register)

router.post("/login", login)

router.post("/google", googleLogin)

router.post("/logout", logout)

router.get("/me", protect, getCurrentUser)

router.patch("/me", protect, profileImage, updateCurrentUser)

router.post("/verify-password", protect, verifyPassword)

router.patch("/me/password", protect, changePassword)

module.exports = router
