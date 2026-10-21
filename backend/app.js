
const express = require("express")
const app = express()
const cors = require('cors');

const gearRoutes = require("./Routes/gearRoutes")

app.use(cors())
app.use(express.json())
app.use("/api/gears", gearRoutes)

module.exports = app