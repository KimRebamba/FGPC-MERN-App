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

router.use(protect, requireAdmin)

router.get("/", getUsers)

router.get("/:id", getUser)

router.post("/", createUser)

router.patch("/:id", updateUser)

router.delete("/:id", deleteUser)

module.exports = router
