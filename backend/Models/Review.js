const mongoose = require("mongoose")

const Schema = mongoose.Schema

const reviewImageSchema = new Schema({
    imagePath: {
        type: String,
        required: true,
        trim: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    }
})

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        default: "",
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    images: {
        type: [reviewImageSchema],
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

reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true })

module.exports = mongoose.model("Review", reviewSchema)
