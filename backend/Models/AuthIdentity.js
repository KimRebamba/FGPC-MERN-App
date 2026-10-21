const mongoose = require("mongoose")

const Schema = mongoose.Schema

const authIdentitySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    provider: {
        type: String,
        enum: ["google", "facebook"],
        required: true
    },
    providerUserId: {
        type: String,
        required: true
    },
    providerEmail: {
        type: String,
        default: null,
        lowercase: true,
        trim: true
    },
    linkedAt: {
        type: Date,
        default: Date.now
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

authIdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true })

module.exports = mongoose.model("AuthIdentity", authIdentitySchema)
