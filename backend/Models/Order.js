const mongoose = require("mongoose")
const { decimalToJSON, isNonNegative } = require("../utils/decimal")

const Schema = mongoose.Schema

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    productNameSnapshot: {
        type: String,
        required: true,
        trim: true
    },
    priceSnapshot: {
        type: Schema.Types.Decimal128,
        required: true,
        validate: {
            validator: isNonNegative,
            message: "Price cannot be negative"
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
})

const shippingAddressSnapshotSchema = new Schema({
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

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => items.length > 0,
            message: "Order must have at least one item"
        }
    },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "delivered", "completed", "cancelled", "refunded"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "gcash", "maya", "card", "bank_transfer"],
        required: true
    },
    shippingAddressSnapshot: {
        type: shippingAddressSnapshotSchema,
        required: true
    },
    shippedAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
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

module.exports = mongoose.model("Order", orderSchema)
