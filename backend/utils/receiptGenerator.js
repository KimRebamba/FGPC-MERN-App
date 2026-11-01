const PDFDocument = require("pdfkit")

/**
 * Generate a PDF receipt buffer for an order.
 * @param {Object} order - Populated Mongoose order document or plain object
 * @returns {Promise<Buffer>}
 */
// [prof-requirements: Term Test Lab - Attach a PDF receipt on the email (10pts)]
// Uses pdfkit to generate formatted receipt with order items, subtotals, grand total, and shipping details
const generateOrderReceiptPdf = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" })
            const buffers = []

            doc.on("data", (chunk) => buffers.push(chunk))
            doc.on("end", () => resolve(Buffer.concat(buffers)))
            doc.on("error", (err) => reject(err))

            const address = order.shippingAddressSnapshot || {}
            const items = order.items || []

            // Primary colors: Dark motorcycle theme
            const primaryColor = "#0A0A0A"
            const accentColor = "#669900"
            const mutedColor = "#666666"

            // Header Banner
            doc.rect(40, 40, 515, 60).fill(primaryColor)
            doc.fillColor("#FFFFFF")
                .fontSize(22)
                .font("Helvetica-Bold")
                .text("FGP MOTORCYCLE GEAR", 60, 52, { letterSpacing: 2 })
            doc.fillColor("#C6FF00")
                .fontSize(10)
                .font("Helvetica")
                .text("OFFICIAL TRANSACTION RECEIPT", 60, 78, { letterSpacing: 1.5 })

            doc.fillColor(primaryColor)

            // Order Metadata Box
            doc.rect(40, 115, 515, 80).strokeColor("#DDDDDD").stroke()
            doc.fontSize(10).font("Helvetica-Bold").text("ORDER DETAILS", 55, 125)

            doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
            doc.text("Order Number:", 55, 142)
            doc.text("Transaction Date:", 55, 156)
            doc.text("Payment Method:", 55, 170)

            doc.font("Helvetica-Bold").fillColor(primaryColor)
            const orderIdStr = order._id ? order._id.toString().toUpperCase() : "N/A"
            doc.text("#" + orderIdStr.slice(-8), 160, 142)
            doc.text(new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }), 160, 156)
            doc.text((order.paymentMethod || "COD").toUpperCase(), 160, 170)

            // Status block on right side
            doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
            doc.text("Current Status:", 340, 142)
            doc.font("Helvetica-Bold").fontSize(12).fillColor(accentColor)
            doc.text((order.status || "PENDING").toUpperCase(), 340, 156)

            // Customer Destination Box
            doc.rect(40, 205, 515, 80).strokeColor("#DDDDDD").stroke()
            doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("SHIPPING DESTINATION", 55, 215)

            doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
            doc.text("Recipient:", 55, 232)
            doc.text("Contact:", 55, 246)
            doc.text("Address:", 55, 260)

            doc.font("Helvetica-Bold").fillColor(primaryColor)
            doc.text(address.recipientName || "Valued Customer", 130, 232)
            doc.text(address.contactNumber || "N/A", 130, 246)

            const addressLine = [
                address.street,
                address.barangay,
                address.city,
                address.province,
                address.postalCode
            ].filter(Boolean).join(", ")
            doc.font("Helvetica").text(addressLine || "N/A", 130, 260, { width: 400 })

            // Items Table
            let y = 305
            doc.rect(40, y, 515, 24).fill("#F3F3F3")
            doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(9)
            doc.text("ITEM DESCRIPTION", 55, y + 7)
            doc.text("QTY", 330, y + 7, { width: 40, align: "center" })
            doc.text("UNIT PRICE", 380, y + 7, { width: 75, align: "right" })
            doc.text("SUBTOTAL", 465, y + 7, { width: 75, align: "right" })

            y += 28
            let grandTotal = 0

            items.forEach((item, index) => {
                const priceNum = item.priceSnapshot ? Number(item.priceSnapshot.toString()) : 0
                const qtyNum = item.quantity || 1
                const subtotal = priceNum * qtyNum
                grandTotal += subtotal

                // Alternate row background
                if (index % 2 === 1) {
                    doc.rect(40, y - 4, 515, 22).fill("#FAFAFA")
                }

                doc.fillColor(primaryColor).font("Helvetica").fontSize(9)
                doc.text(item.productNameSnapshot || "Motorcycle Gear", 55, y, { width: 260, lineBreak: false })
                doc.text(qtyNum.toString(), 330, y, { width: 40, align: "center" })
                doc.text("PHP " + priceNum.toLocaleString("en-US", { minimumFractionDigits: 2 }), 380, y, { width: 75, align: "right" })
                doc.font("Helvetica-Bold").text("PHP " + subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 }), 465, y, { width: 75, align: "right" })

                y += 22
            })

            // Summary section
            y += 10
            doc.rect(40, y, 515, 1).strokeColor("#DDDDDD").stroke()
            y += 15

            doc.font("Helvetica").fontSize(10).fillColor(mutedColor)
            doc.text("Subtotal:", 350, y, { width: 100, align: "right" })
            doc.font("Helvetica-Bold").fillColor(primaryColor)
            doc.text("PHP " + grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 }), 465, y, { width: 75, align: "right" })

            y += 18
            doc.font("Helvetica").fillColor(mutedColor)
            doc.text("Shipping Fee:", 350, y, { width: 100, align: "right" })
            doc.font("Helvetica-Bold").fillColor(accentColor)
            doc.text("FREE", 465, y, { width: 75, align: "right" })

            y += 20
            doc.rect(340, y - 4, 215, 28).fill(primaryColor)
            doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF")
            doc.text("GRAND TOTAL:", 350, y + 4, { width: 100, align: "right" })
            doc.fillColor("#C6FF00")
            doc.text("PHP " + grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 }), 465, y + 4, { width: 75, align: "right" })

            // Footer
            y = 740
            doc.rect(40, y, 515, 1).strokeColor("#DDDDDD").stroke()
            doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
            doc.text("FGP Motorcycle Gear Store - High Performance Motorcycle Equipment and Apparel", 40, y + 10, { align: "center", width: 515 })
            doc.text("Thank you for your business. For customer support and warranty inquiries, please contact support@fgpgear.com", 40, y + 22, { align: "center", width: 515 })

            doc.end()
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    generateOrderReceiptPdf
}

