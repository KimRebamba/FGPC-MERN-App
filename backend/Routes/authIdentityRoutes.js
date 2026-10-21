const express = require("express")
const router = express.Router()

const {
    getAuthIdentities,
    getAuthIdentity
} = require("../Controllers/authIdentityController")
const { protect, requireAdmin } = require("../middlewares/auth")

router.use(protect, requireAdmin)

router.get("/", getAuthIdentities)

router.get("/:id", getAuthIdentity)

module.exports = router
