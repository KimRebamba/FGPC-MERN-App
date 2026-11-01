require("dotenv").config()

const fs = require("node:fs")
const path = require("node:path")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const app = require("./app")
const User = require("./Models/User")
const Cart = require("./Models/Cart")
const Category = require("./Models/Category")
const Product = require("./Models/Product")
const Order = require("./Models/Order")
const Review = require("./Models/Review")

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
    await mongoose.connect("mongodb://127.0.0.1:27017/fgp_shop_test", { serverSelectionTimeoutMS: 5000 })
    await mongoose.connection.dropDatabase()
    await Promise.all([User.init(), Cart.init(), Product.init(), Order.init(), Review.init()])

    const admin = await User.create({
        firstName: "Ada",
        lastName: "Admin",
        email: "admin@example.com",
        password: await bcrypt.hash("AdminPass123", 10),
        role: "admin"
    })

    const customer = await User.create({
        firstName: "Kim",
        lastName: "Shopper",
        email: "kim@example.com",
        password: await bcrypt.hash("secret123", 10)
    })

    const other = await User.create({
        firstName: "Other",
        lastName: "Shopper",
        email: "other@example.com",
        password: await bcrypt.hash("secret123", 10)
    })

    const server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))
    baseUrl = "http://127.0.0.1:" + server.address().port

    const adminLogin = await request("POST", "/api/auth/login", { json: { email: "admin@example.com", password: "AdminPass123" } })
    const adminCookie = sessionCookie(adminLogin.cookies)

    const customerLogin = await request("POST", "/api/auth/login", { json: { email: "kim@example.com", password: "secret123" } })
    const customerCookie = sessionCookie(customerLogin.cookies)
    const customerId = customerLogin.body.user._id

    const otherLogin = await request("POST", "/api/auth/login", { json: { email: "other@example.com", password: "secret123" } })
    const otherCookie = sessionCookie(otherLogin.cookies)

    const adminForm = new FormData()
    adminForm.append("name", "Peripherals")
    adminForm.append("isActive", "false")
    adminForm.append("image", new Blob([Buffer.from("fake-image-bytes")], { type: "image/png" }), "peripherals.png")

    const category = await request("POST", "/api/categories", { cookie: adminCookie, form: adminForm })
    check("local upload creates category", category.status === 201, category)
    check("image path points at /uploads", String(category.body.imagePath).startsWith("/uploads/categories/"), category.body.imagePath)

    const fileName = path.basename(category.body.imagePath)
    const storedPath = path.join(__dirname, "uploads", "categories", fileName)
    check("file written to disk", fs.existsSync(storedPath), storedPath)

    const imageResponse = await fetch(baseUrl + category.body.imagePath)
    check("uploaded file served statically", imageResponse.status === 200)

    const productForm = new FormData()
    productForm.append("name", "Customer keyboard")
    productForm.append("price", "1499.00")
    productForm.append("category", category.body._id)
    productForm.append("stock", "6")
    productForm.append("images", new Blob([Buffer.from("one")], { type: "image/png" }), "one.png")
    productForm.append("images", new Blob([Buffer.from("two")], { type: "image/png" }), "two.png")

    const product = await request("POST", "/api/products", { cookie: adminCookie, form: productForm })
    check("product upload keeps both images", product.status === 201 && product.body.images.length === 2, product.body.images)
    check("product image paths are local", product.body.images.every((image) => image.imagePath.startsWith("/uploads/products/")))

    const otherCartAttempt = await request("GET", "/api/carts/" + customerId, { cookie: otherCookie })
    check("other customer cannot open your cart -> 403", otherCartAttempt.status === 403, otherCartAttempt)

    const adminCartAccess = await request("GET", "/api/carts/" + customerId, { cookie: adminCookie })
    check("admin can open any cart", adminCartAccess.status === 200, adminCartAccess)

    const ownCart = await request("POST", "/api/carts/" + customerId + "/items", {
        cookie: customerCookie,
        json: { product: product.body._id, quantity: 2 }
    })
    check("customer adds to own cart", ownCart.status === 200 && ownCart.body.items.length === 1, ownCart)

    const otherAddAttempt = await request("POST", "/api/carts/" + customerId + "/items", {
        cookie: otherCookie,
        json: { product: product.body._id, quantity: 1 }
    })
    check("other customer cannot write your cart -> 403", otherAddAttempt.status === 403, otherAddAttempt)

    const order = await request("POST", "/api/orders", {
        cookie: customerCookie,
        json: {
            user: other._id,
            items: [{ product: product.body._id, quantity: 1 }],
            paymentMethod: "cod",
            shippingAddressSnapshot: {
                recipientName: "Kim Shopper",
                contactNumber: "09171234567",
                street: "1 Main",
                barangay: "Poblacion",
                city: "Cebu City",
                province: "Cebu",
                postalCode: "6000"
            }
        }
    })
    check("customer order created", order.status === 201, order)
    check("order is forced to the logged-in customer", order.body.user === customerId, order.body.user)

    const otherOrderAttempt = await request("POST", "/api/orders", {
        cookie: otherCookie,
        json: {
            user: customerId,
            items: [{ product: product.body._id, quantity: 1 }],
            paymentMethod: "cod",
            shippingAddressSnapshot: {
                recipientName: "Other",
                contactNumber: "09170000000",
                street: "2 Main",
                barangay: "Poblacion",
                city: "Cebu City",
                province: "Cebu",
                postalCode: "6000"
            }
        }
    })
    check("customer cannot order for someone else", otherOrderAttempt.status === 201 && otherOrderAttempt.body.user !== customerId, otherOrderAttempt.body.user)

    const customerOrders = await request("GET", "/api/orders", { cookie: customerCookie })
    check("customer sees only own orders", customerOrders.body.count === 1, customerOrders.body.count)

    const otherOrders = await request("GET", "/api/orders", { cookie: otherCookie })
    check("other customer sees only their order", otherOrders.body.count === 1 && otherOrders.body.orders[0].user._id !== customerId, otherOrders.body.count)

    const adminOrders = await request("GET", "/api/orders", { cookie: adminCookie })
    check("admin sees every order", adminOrders.body.count === 2, adminOrders.body.count)

    const otherOrderRead = await request("GET", "/api/orders/" + order.body._id, { cookie: otherCookie })
    check("other customer cannot read your order -> 403", otherOrderRead.status === 403, otherOrderRead)

    const review = await request("POST", "/api/reviews", {
        cookie: customerCookie,
        json: { product: product.body._id, order: order.body._id, rating: 5, title: "Great" }
    })
    check("customer review created", review.status === 201, review)
    check("review belongs to logged-in customer", review.body.user === customerId, review.body.user)

    const otherReviewEdit = await request("PATCH", "/api/reviews/" + review.body._id, {
        cookie: otherCookie,
        json: { rating: 1 }
    })
    check("other customer cannot edit your review -> 403", otherReviewEdit.status === 403, otherReviewEdit)

    const ownReviewEdit = await request("PATCH", "/api/reviews/" + review.body._id, {
        cookie: customerCookie,
        json: { rating: 4 }
    })
    check("customer edits own review", ownReviewEdit.status === 200 && ownReviewEdit.body.rating === 4, ownReviewEdit)

    const profileForm = new FormData()
    profileForm.append("firstName", "Kimberly")
    profileForm.append("contactNumber", "09998887777")
    profileForm.append("profile", new Blob([Buffer.from("avatar")], { type: "image/png" }), "avatar.png")

    const profileUpdate = await request("PATCH", "/api/auth/me", { cookie: customerCookie, form: profileForm })
    check("customer updates own profile", profileUpdate.status === 200 && profileUpdate.body.firstName === "Kimberly", profileUpdate)
    check("profile image stored locally", String(profileUpdate.body.profilePath).startsWith("/uploads/profiles/"), profileUpdate.body.profilePath)

    const returnRequest = await request("POST", "/api/return-requests", {
        cookie: customerCookie,
        json: {
            order: order.body._id,
            items: [{ orderItemId: order.body.items[0]._id, quantity: 1, reason: "Damaged" }]
        }
    })
    check("customer return request created", returnRequest.status === 201, returnRequest)
    check("return request belongs to customer", returnRequest.body.user === customerId)

    const customerReturns = await request("GET", "/api/return-requests", { cookie: customerCookie })
    check("customer sees own return requests", customerReturns.body.count === 1, customerReturns.body.count)

    const otherReturns = await request("GET", "/api/return-requests", { cookie: otherCookie })
    check("other customer sees no return requests", otherReturns.body.count === 0, otherReturns.body.count)

    server.close()
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()

    fs.rmSync(path.join(__dirname, "uploads"), { recursive: true, force: true })

    console.log("")
    console.log(failures.length === 0 ? "ALL CHECKS PASSED" : "FAILURES (" + failures.length + "): " + failures.join(" | "))
    process.exit(failures.length === 0 ? 0 : 1)
}

run().catch(async (error) => {
    console.log("HARNESS ERROR:", error)
    await mongoose.disconnect()
    process.exit(1)
})
