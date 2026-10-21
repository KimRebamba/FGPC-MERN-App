export const formatDate = (value) => {
    if (!value) {
        return "—"
    }

    return new Date(value).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    })
}
