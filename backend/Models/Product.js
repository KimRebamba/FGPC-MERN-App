const mongoose = require("mongoose")
const { decimalToJSON, isNonNegative } = require("../utils/decimal")

const Schema = mongoose.Schema

const productImageSchema = new Schema({
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

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true,
        validate: {
            validator: isNonNegative,
            message: "Price cannot be negative"
        }
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        default: null
    },
    images: {
        type: [productImageSchema],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
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
    timestamps: true,
    toJSON: { transform: decimalToJSON }
})

module.exports = mongoose.model("Product", productSchema)
