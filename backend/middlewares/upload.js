const fs = require("node:fs")
const path = require("node:path")
const multer = require("multer")

const uploadsRoot = path.join(__dirname, "..", "uploads")

const createStorage = (folder) => {
    const destination = path.join(uploadsRoot, folder)

    fs.mkdirSync(destination, { recursive: true })

    return multer.diskStorage({
        destination: (req, file, callback) => callback(null, destination),
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase()
            const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + extension

            callback(null, uniqueName)
        }
    })
}

const createUploader = (folder, field, maxCount) => {
    const instance = multer({
        storage: createStorage(folder),
        limits: {
            fileSize: 5 * 1024 * 1024,
            files: maxCount
        }
    })

    if (maxCount === 1) {
        return instance.single(field)
    }

    return instance.array(field, maxCount)
}

const productImages = createUploader("products", "images", 5)

const reviewImages = createUploader("reviews", "images", 4)

const categoryImage = createUploader("categories", "image", 1)

const brandLogo = createUploader("brands", "logo", 1)

const profileImage = createUploader("profiles", "profile", 1)

module.exports = {
    uploadsRoot,
    productImages,
    reviewImages,
    categoryImage,
    brandLogo,
    profileImage
}
