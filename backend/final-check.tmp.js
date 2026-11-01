require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const app = require("./app")
const User = require("./Models/User")
const AuthIdentity = require("./Models/AuthIdentity")
const Cart = require("./Models/Cart")
const Category = require("./Models/Category")
const Brand = require("./Models/Brand")
const Product = require("./Models/Product")
const ReturnRequest = require("./Models/ReturnRequest")
const cloudinaryConfig = require("./config/cloudinary")

const failures = []
const check = (label, condition, detail) => {
    if (condition) {
        console.log("PASS " + label)
    } else {
        failures.push(label)
        console.log("FAIL " + label + (detail === undefined ? "" : " :: " + JSON.stringify(detail)))
    }
}

let baseUrl = ""

const request = async (method, path, options = {}) => {
    const headers = {}
    let body

    if (options.json !== undefined) {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(options.json)
    }

    if (options.form) {
        body = options.form
    }

    if (options.cookie) {
        headers.Cookie = options.cookie
    }

    if (options.token) {
        headers.Authorization = "Bearer " + options.token
    }

    const response = await fetch(baseUrl + path, { method, headers, body })
    const text = await response.text()

    return {
        status: response.status,
        body: text ? JSON.parse(text) : null,
        cookies: response.headers.getSetCookie()
    }
}

const sessionCookie = (cookies) => {
    const cookie = cookies.find((entry) => entry.startsWith("fgpSession="))

    return cookie ? cookie.split(";")[0] : null
}

const run = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/fgp_final_test", { serverSelectionTimeoutMS: 5000 })
    await mongoose.connection.dropDatabase()
    await Promise.all([User.init(), AuthIdentity.init(), Cart.init(), Product.init()])

    const admin = await User.create({
        firstName: "Ada",
        lastName: "Admin",
        email: "admin@example.com",
        password: await bcrypt.hash("AdminPass123", 10),
        role: "admin"
    })

    const customer = await User.create({
        firstName: "Kim",
        lastName: "Customer",
        email: "kim@example.com",
        password: await bcrypt.hash("secret123", 10)
    })

    await User.create({
        firstName: "Google",
        lastName: "Only",
        email: "google@example.com",
        password: null
    })

    const server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))
    baseUrl = "http://127.0.0.1:" + server.address().port

    const adminLogin = await request("POST", "/api/auth/login", {
        json: { email: "admin@example.com", password: "AdminPass123", remember: true }
    })
    check("login -> 200", adminLogin.status === 200, adminLogin)
    const adminCookie = sessionCookie(adminLogin.cookies)
    const adminToken = adminLogin.body.token
    check("login sets session cookie", Boolean(adminCookie), adminLogin.cookies)
    check("cookie is httpOnly", adminLogin.cookies.some((entry) => entry.includes("HttpOnly")))
    check("remember=true sets Max-Age", adminLogin.cookies.some((entry) => entry.includes("Max-Age")))

    const meWithCookie = await request("GET", "/api/auth/me", { cookie: adminCookie })
    check("auto-login via cookie -> 200", meWithCookie.status === 200 && meWithCookie.body.email === "admin@example.com", meWithCookie)

    check("me with bearer token still works", (await request("GET", "/api/auth/me", { token: adminToken })).status === 200)
    check("me with junk token -> 401", (await request("GET", "/api/auth/me", { token: "junk" })).status === 401)

    const sessionLogin = await request("POST", "/api/auth/login", {
        json: { email: "admin@example.com", password: "AdminPass123", remember: false }
    })
    check("remember=false omits Max-Age", !sessionLogin.cookies.some((entry) => entry.includes("Max-Age")), sessionLogin.cookies)

    const logout = await request("POST", "/api/auth/logout", { cookie: adminCookie })
    check("logout -> 200", logout.status === 200, logout)
    check("logout clears cookie", logout.cookies.some((entry) => entry.includes("fgpSession=;") || entry.includes("Expires=Thu, 01 Jan 1970")))

    const googleOnlyLogin = await request("POST", "/api/auth/login", {
        json: { email: "google@example.com", password: "anything" }
    })
    check("google-only account password login -> 400", googleOnlyLogin.status === 400, googleOnlyLogin)
    check("google-only message mentions Google", String(googleOnlyLogin.body.error).includes("Google"))

    const invalidEmail = await request("POST", "/api/auth/register", {
        json: { firstName: "Bad", lastName: "Email", email: "not-an-email", password: "secret123" }
    })
    check("validator rejects bad email -> 400", invalidEmail.status === 400, invalidEmail)

    const selfDeactivate = await request("PATCH", "/api/users/" + admin._id, {
        cookie: adminCookie,
        json: { isDeactivated: true }
    })
    check("cannot deactivate self -> 400", selfDeactivate.status === 400, selfDeactivate)

    const selfDemote = await request("PATCH", "/api/users/" + admin._id, {
        cookie: adminCookie,
        json: { role: "customer" }
    })
    check("cannot change own role -> 400", selfDemote.status === 400, selfDemote)

    const selfDelete = await request("DELETE", "/api/users/" + admin._id, { cookie: adminCookie })
    check("cannot delete self -> 400", selfDelete.status === 400, selfDelete)

    const badEmailUser = await request("POST", "/api/users", {
        cookie: adminCookie,
        json: { firstName: "Bad", lastName: "Email", email: "nope@", password: "secret123" }
    })
    check("user model validates email -> 400", badEmailUser.status === 400, badEmailUser)

    const category = await request("POST", "/api/categories", { cookie: adminCookie, json: { name: "Peripherals" } })
    const brand = await request("POST", "/api/brands", { cookie: adminCookie, json: { name: "Keychron" } })
    check("category and brand created", category.status === 201 && brand.status === 201, { category, brand })

    const product = await request("POST", "/api/products", {
        cookie: adminCookie,
        json: {
            name: "Keychron K2",
            price: "1999.99",
            category: category.body._id,
            brand: brand.body._id,
            stock: 5
        }
    })
    check("product created with JSON body", product.status === 201 && product.body.images.length === 0, product)

    await request("POST", "/api/carts/" + customer._id + "/items", {
        cookie: adminCookie,
        json: { product: product.body._id, quantity: 2 }
    })

    const blockedCategory = await request("DELETE", "/api/categories/" + category.body._id, { cookie: adminCookie })
    check("category with products -> 409", blockedCategory.status === 409, blockedCategory)
    check("category 409 explains why", String(blockedCategory.body.error).includes("product(s)"), blockedCategory.body)

    const blockedBrand = await request("DELETE", "/api/brands/" + brand.body._id, { cookie: adminCookie })
    check("brand with products -> 409", blockedBrand.status === 409, blockedBrand)

    const unconfiguredUpload = new FormData()
    unconfiguredUpload.append("name", "Cloudinary missing")
    unconfiguredUpload.append("image", new Blob([Buffer.from("fake")], { type: "image/png" }), "logo.png")

    const missingCloudinary = await request("POST", "/api/categories", { cookie: adminCookie, form: unconfiguredUpload })
    check("upload without cloudinary -> 503", missingCloudinary.status === 503, missingCloudinary)
    check("503 explains cloudinary", String(missingCloudinary.body.error).includes("Cloudinary"))

    cloudinaryConfig.uploadImages = async (files, folder) => files.map((file, index) => {
        return "https://res.cloudinary.com/demo/" + folder + "/" + index + ".png"
    })

    const categoryForm = new FormData()
    categoryForm.append("name", "Uploaded category")
    categoryForm.append("description", "Created with a file")
    categoryForm.append("isActive", "false")
    categoryForm.append("image", new Blob([Buffer.from("fake")], { type: "image/png" }), "category.png")

    const uploadedCategory = await request("POST", "/api/categories", { cookie: adminCookie, form: categoryForm })
    check("category multipart create -> 201", uploadedCategory.status === 201, uploadedCategory)
    check("category image uploaded", String(uploadedCategory.body.imagePath).includes("res.cloudinary.com"), uploadedCategory.body.imagePath)
    check("multipart isActive=false cast to boolean", uploadedCategory.body.isActive === false, uploadedCategory.body.isActive)

    const productForm = new FormData()
    productForm.append("name", "Uploaded keyboard")
    productForm.append("price", "2500.50")
    productForm.append("category", category.body._id)
    productForm.append("stock", "3")
    productForm.append("images", new Blob([Buffer.from("one")], { type: "image/png" }), "one.png")
    productForm.append("images", new Blob([Buffer.from("two")], { type: "image/png" }), "two.png")

    const uploadedProduct = await request("POST", "/api/products", { cookie: adminCookie, form: productForm })
    check("product multipart create -> 201", uploadedProduct.status === 201, uploadedProduct)
    check("product keeps both images", uploadedProduct.body.images.length === 2, uploadedProduct.body.images)
    check("first image is primary", uploadedProduct.body.images[0].isPrimary === true && uploadedProduct.body.images[1].isPrimary === false)
    check("image sort order stored", uploadedProduct.body.images[1].sortOrder === 1)

    const bigForm = new FormData()
    bigForm.append("name", "Too big")
    bigForm.append("image", new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: "image/png" }), "big.png")

    const oversized = await request("POST", "/api/categories", { cookie: adminCookie, form: bigForm })
    check("oversized upload -> 400", oversized.status === 400, oversized)

    const deletedProduct = await request("DELETE", "/api/products/" + product.body._id, { cookie: adminCookie })
    check("product delete -> 200", deletedProduct.status === 200, deletedProduct)
    check("product delete reports cart cleanup", deletedProduct.body.cartsUpdated === 1, deletedProduct.body)

    const cartAfterProductDelete = await request("GET", "/api/carts/" + customer._id, { cookie: adminCookie })
    check("product pulled from cart", cartAfterProductDelete.body.items.length === 0, cartAfterProductDelete.body.items)

    const secondProduct = await request("POST", "/api/products", {
        cookie: adminCookie,
        json: { name: "Second product", price: "10.00", category: category.body._id, brand: brand.body._id, stock: 4 }
    })

    const order = await request("POST", "/api/orders", {
        cookie: adminCookie,
        json: {
            user: customer._id,
            items: [{ product: secondProduct.body._id, quantity: 1 }],
            paymentMethod: "cod",
            shippingAddressSnapshot: {
                recipientName: "Kim Customer",
                contactNumber: "09171234567",
                street: "1 Main",
                barangay: "Poblacion",
                city: "Cebu City",
                province: "Cebu",
                postalCode: "6000"
            }
        }
    })
    check("order created", order.status === 201, order)

    const returnRequest = await request("POST", "/api/return-requests", {
        cookie: adminCookie,
        json: {
            user: customer._id,
            order: order.body._id,
            items: [{ orderItemId: order.body.items[0]._id, quantity: 1, reason: "Damaged" }]
        }
    })
    check("return request created", returnRequest.status === 201, returnRequest)

    const blockedOrder = await request("DELETE", "/api/orders/" + order.body._id, { cookie: adminCookie })
    check("order with open return -> 409", blockedOrder.status === 409, blockedOrder)

    await request("PATCH", "/api/return-requests/" + returnRequest.body._id, {
        cookie: adminCookie,
        json: { status: "completed", resolution: "refund" }
    })
    const deletedOrder = await request("DELETE", "/api/orders/" + order.body._id, { cookie: adminCookie })
    check("order deletes after return resolved", deletedOrder.status === 200, deletedOrder)

    await request("DELETE", "/api/products/" + secondProduct.body._id, { cookie: adminCookie })
    await request("DELETE", "/api/products/" + uploadedProduct.body._id, { cookie: adminCookie })
    check("category deletes once products are gone", (await request("DELETE", "/api/categories/" + category.body._id, { cookie: adminCookie })).status === 200)
    check("brand deletes once products are gone", (await request("DELETE", "/api/brands/" + brand.body._id, { cookie: adminCookie })).status === 200)

    await AuthIdentity.create({
        user: customer._id,
        provider: "google",
        providerUserId: "google-customer",
        providerEmail: customer.email
    })

    const deletedUser = await request("DELETE", "/api/users/" + customer._id, { cookie: adminCookie })
    check("user delete -> 200", deletedUser.status === 200, deletedUser)

    const identityAfter = await AuthIdentity.findOne({ providerUserId: "google-customer" })
    const cartAfter = await Cart.findOne({ user: customer._id })
    check("auth identity soft deleted with user", identityAfter.deletedAt !== null, identityAfter.deletedAt)
    check("cart soft deleted with user", cartAfter.deletedAt !== null, cartAfter.deletedAt)

    const staleSession = await request("GET", "/api/auth/me", { cookie: adminCookie })
    check("admin cookie still valid after deleting another account", staleSession.status === 200, staleSession)

    const customerLogin = await request("POST", "/api/auth/login", {
        json: { email: "kim@example.com", password: "secret123" }
    })
    check("deleted account cannot log in", customerLogin.status === 401, customerLogin)

    server.close()
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()

    console.log("")
    console.log(failures.length === 0 ? "ALL CHECKS PASSED" : "FAILURES (" + failures.length + "): " + failures.join(" | "))
    process.exit(failures.length === 0 ? 0 : 1)
}

run().catch(async (error) => {
    console.log("HARNESS ERROR:", error)
    await mongoose.disconnect()
    process.exit(1)
})
