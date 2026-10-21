export const formatPrice = (value) => {
    const amount = Number(value || 0)

    return "₱" + amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}
