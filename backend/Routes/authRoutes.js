const express = require("express")
const router = express.Router()

const {
    register,
    login,
    googleLogin,
    getCurrentUser
} = require("../Controllers/authController")
const { protect } = require("../middlewares/auth")

router.post("/register", register)

router.post("/login", login)

router.post("/google", googleLogin)

router.get("/me", protect, getCurrentUser)

module.exports = router
