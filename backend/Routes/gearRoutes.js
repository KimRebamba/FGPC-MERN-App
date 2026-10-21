const express = require("express")
const router = express.Router()

const {
    createGear,
    getAllGear,
    getGear,
    deleteGear,
    updateGear
} = require("../Controllers/gearController")

router.get("/", getAllGear)

router.get("/:id", getGear)

router.post("/", createGear)

router.patch("/:id", updateGear)

router.delete("/:id", deleteGear)

module.exports = router