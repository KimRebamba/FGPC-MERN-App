require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../Models/User")

const [email, password, firstName = "Admin", lastName = "Account"] = process.argv.slice(2)

const run = async () => {
    if (!email || !password) {
        console.log("Usage: node scripts/seedAdmin.js <email> <password> [firstName] [lastName]")
        process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI)

    const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

    if (existingUser) {
        existingUser.role = "admin"
        existingUser.password = hashedPassword
        existingUser.isDeactivated = false
        existingUser.deletedAt = null
        existingUser.deletedBy = null
        await existingUser.save()
        console.log("Admin updated:", existingUser.email)
    } else {
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "admin",
            emailVerifiedAt: new Date()
        })
        console.log("Admin created:", user.email)
    }

    await mongoose.disconnect()
}

run().catch(async (error) => {
    console.log("ERROR:", error.message)
    await mongoose.disconnect()
    process.exit(1)
})
