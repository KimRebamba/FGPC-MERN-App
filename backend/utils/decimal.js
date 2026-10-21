const mongoose = require("mongoose")

const isDecimal128 = (value) => Boolean(value && typeof value === "object" && value._bsontype === "Decimal128")

const toDecimal128 = (value) => {
    if (value === null || value === undefined || value === "") {
        return null
    }

    return mongoose.Types.Decimal128.fromString(String(value))
}

const toNumber = (value) => (isDecimal128(value) ? Number(value.toString()) : value)

const isNonNegative = (value) => !isDecimal128(value) || Number(value.toString()) >= 0

const convert = (value) => {
    if (isDecimal128(value)) {
        return value.toString()
    }

    if (Array.isArray(value)) {
        return value.map(convert)
    }

    if (value && typeof value === "object" && !(value instanceof Date) && !value._bsontype) {
        const output = {}

        for (const key of Object.keys(value)) {
            output[key] = convert(value[key])
        }

        return output
    }

    return value
}

const decimalToJSON = (doc, ret) => convert(ret)

module.exports = {
    toDecimal128,
    toNumber,
    isNonNegative,
    decimalToJSON
}
