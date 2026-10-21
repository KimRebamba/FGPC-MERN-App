const dns = require('node:dns');

require("dotenv").config()

dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require("mongoose")
const app = require("./app")

mongoose.connect(process.env.MONGO_URI_LOCAL)
    .then(() => {
        console.log("Database Connected Successfully")

        app.listen(process.env.PORT, 
            () => { console.log("Listening in PORT:", process.env.PORT)}
        )})
    .catch((err) => {
        console.log("ERROR:", err)
    })
