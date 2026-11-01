const dns = require('node:dns');
require("dotenv").config()

dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require("mongoose")
const app = require("./app")

// Simple boolean toggle for Render deployment readiness
const isDeployToRender = String(process.env.DEPLOY_TO_RENDER).toLowerCase() === "true" || Boolean(process.env.RENDER)

const targetMongoUri = isDeployToRender
    ? process.env.MONGO_URI
    : (process.env.MONGO_URI_LOCAL || process.env.MONGO_URI)

console.log(`[Database] Initializing connection in ${isDeployToRender ? "RENDER / CLOUD" : "LOCAL"} mode...`)

mongoose.connect(targetMongoUri)
    .then(() => {
        console.log("Database Connected Successfully")

        const port = process.env.PORT || 8000
        app.listen(port, () => {
            console.log("Listening on PORT:", port)
        })
    })
    .catch((err) => {
        console.log("ERROR connecting to database:", err)
    })
