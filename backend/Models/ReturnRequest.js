const mongoose = require("mongoose")

const Schema = mongoose.Schema

const returnItemSchema = new Schema({
    orderItemId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    productNameSnapshot: {
        type: String,
        default: "",
        trim: true
    },
    priceSnapshot: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        required: true,
        trim: true
    }
})

const returnRequestSchema = new Schema({
    requestNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    items: {
        type: [returnItemSchema],
        validate: {
            validator: (items) => items.length > 0,
            message: "Return request must have at least one item"
        }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed", "cancelled"],
        default: "pending"
    },
    resolution: {
        type: String,
        enum: ["refund", "replacement", "store_credit", null],
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    adminNotes: {
        type: String,
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
    timestamps: true
})

module.exports = mongoose.model("ReturnRequest", returnRequestSchema)
