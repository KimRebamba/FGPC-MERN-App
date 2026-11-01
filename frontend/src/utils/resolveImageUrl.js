const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

export const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
        return null
    }

    if (imagePath.startsWith("http")) {
        return imagePath
    }

    return new URL(API_URL).origin + imagePath
}
