const fs = require("node:fs")
const cloudinary = require("cloudinary").v2

const isCloudinaryEnabled = () => {
    return String(process.env.CLOUDINARY_ENABLED).toLowerCase() === "true"
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "zde7dpud",
    api_key: process.env.CLOUDINARY_API_KEY || "643555333758435",
    api_secret: process.env.CLOUDINARY_API_SECRET || "ZabXy0VqtGfzn2VPwrmotzT_b0Q"
})

const publicUrl = (folder, filename) => "/uploads/" + folder + "/" + filename

const uploadSingleImage = async (file, folder = "general") => {
    if (!file) {
        return null
    }

    if (isCloudinaryEnabled() && file.path) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `fgp/${folder}`,
                resource_type: "image"
            })
            // Clean up temporary local file
            fs.unlink(file.path, () => {})
            return result.secure_url
        } catch (error) {
            console.error("[Cloudinary] Upload failed, falling back to local file:", error.message)
            return publicUrl(folder, file.filename)
        }
    }

    return publicUrl(folder, file.filename)
}

const uploadManyImages = async (files, folder = "products") => {
    if (!files || files.length === 0) {
        return null
    }

    const uploaded = []

    for (let index = 0; index < files.length; index++) {
        const file = files[index]
        let pathStr = publicUrl(folder, file.filename)

        if (isCloudinaryEnabled() && file.path) {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `fgp/${folder}`,
                    resource_type: "image"
                })
                fs.unlink(file.path, () => {})
                pathStr = result.secure_url
            } catch (error) {
                console.error("[Cloudinary] Image upload failed, fallback to local:", error.message)
            }
        }

        uploaded.push({
            imagePath: pathStr,
            isPrimary: index === 0,
            sortOrder: index
        })
    }

    return uploaded
}

module.exports = {
    isCloudinaryEnabled,
    uploadSingleImage,
    uploadManyImages
}
