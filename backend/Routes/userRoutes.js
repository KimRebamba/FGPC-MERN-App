const express = require("express")
const router = express.Router()

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../Controllers/userController")
const { protect, requireAdmin } = require("../middlewares/auth")
const { profileImage } = require("../middlewares/upload")

router.use(protect, requireAdmin)

router.get("/", getUsers)

router.get("/:id", getUser)

router.post("/", profileImage, createUser)

router.patch("/:id", profileImage, updateUser)

router.delete("/:id", deleteUser)

module.exports = router
