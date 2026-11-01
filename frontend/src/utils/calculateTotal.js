export const cartTotal = (items = []) => items.reduce((total, item) => {
    return total + Number(item.product?.price || 0) * item.quantity
}, 0)

export const orderTotal = (items = []) => items.reduce((total, item) => {
    return total + Number(item.priceSnapshot || 0) * item.quantity
}, 0)
