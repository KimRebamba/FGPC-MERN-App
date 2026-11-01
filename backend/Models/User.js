const mongoose = require("mongoose")
const validator = require("validator")

const Schema = mongoose.Schema

const addressSchema = new Schema({
    recipientName: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    barangay: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    province: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        trim: true
    }
})

const userSchema = new Schema({
    firstName: {
        type: String,
        default: "",
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: "Please enter a valid email address"
        }
    },
    password: {
        type: String,
        default: null,
        select: false
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    contactNumber: {
        type: String,
        default: null,
        trim: true
    },
    profilePath: {
        type: String,
        default: null
    },
    addresses: {
        type: [addressSchema],
        default: []
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema)
