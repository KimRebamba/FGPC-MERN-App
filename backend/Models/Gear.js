const mongoose = require("mongoose")

const Schema = mongoose.Schema

const gearSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    images: {
        type: [String]
    },
    isVisible: {
        type: Boolean,
        required: true
    },
    variations: [{
        name: String,
        value: String,
        stock: Number
    }]
}, {timestamps: true})

module.exports = mongoose.model("Gear", gearSchema)