const nodemailer = require("nodemailer")
const User = require("../Models/User")
const { generateOrderReceiptPdf } = require("./receiptGenerator")

/**
 * Check whether Mailtrap email sending is enabled.
 * Can be toggled via MAILTRAP_ENABLED=true/false in .env
 */
const isMailtrapEnabled = () => {
    const val = process.env.MAILTRAP_ENABLED
    return String(val).toLowerCase() === "true"
}

/**
 * Create Mailtrap SMTP transporter
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
        port: Number(process.env.MAILTRAP_PORT) || 2525,
        auth: {
            user: process.env.MAILTRAP_USER || "d06f8760800fa0",
            pass: process.env.MAILTRAP_PASS || "c6053775ed89ea"
        }
    })
}

/**
 * Send transaction details update email to customer with attached PDF receipt.
 * @param {Object} order - The updated order
 * @param {string} updateMessage - Description of status change (e.g. "Order marked as paid")
 */
// [prof-requirements: Term Test Lab - Email customer updated transaction details with products list, subtotal, grand total (5pts) & PDF receipt (10pts)]
const sendOrderTransactionEmail = async (order, updateMessage = "") => {
    if (!isMailtrapEnabled()) {
        console.log("[Mailer] Mailtrap is currently DISABLED (MAILTRAP_ENABLED=false). Email skipped.")
        return { success: false, reason: "disabled" }
    }

    try {
        let recipientEmail = order.user?.email
        let recipientName = order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : ""

        if (!recipientEmail && order.user) {
            const userId = order.user._id || order.user
            const userDoc = await User.findById(userId).select("email firstName lastName")
            if (userDoc) {
                recipientEmail = userDoc.email
                if (!recipientName) {
                    recipientName = `${userDoc.firstName || ""} ${userDoc.lastName || ""}`.trim()
                }
            }
        }

        if (!recipientName) {
            recipientName = order.shippingAddressSnapshot?.recipientName || "Valued Customer"
        }

        if (!recipientEmail) {
            recipientEmail = "customer@example.com"
        }

        const items = order.items || []
        let grandTotal = 0
        const itemsHtml = items.map((item) => {
            const price = Number(item.priceSnapshot ? item.priceSnapshot.toString() : 0)
            const qty = item.quantity || 1
            const subtotal = price * qty
            grandTotal += subtotal
            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #333333; color: #FFFFFF;">${item.productNameSnapshot || "Gear Item"}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #333333; color: #BBBBBB; text-align: center;">${qty}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #333333; color: #BBBBBB; text-align: right;">₱${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #333333; color: #C6FF00; font-weight: bold; text-align: right;">₱${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
            `
        }).join("")

        const orderCode = order._id.toString().slice(-6).toUpperCase()

        // Generate PDF Receipt
        let pdfBuffer = null
        try {
            pdfBuffer = await generateOrderReceiptPdf(order)
        } catch (pdfErr) {
            console.error("[Mailer] Failed to generate PDF receipt:", pdfErr)
        }

        const transporter = getTransporter()

        const htmlContent = `
        <div style="background-color: #0A0A0A; color: #FFFFFF; font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #222222;">
            <div style="border-bottom: 2px solid #C6FF00; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; letter-spacing: 1px;">FGP MOTORCYCLE GEAR</h1>
                <p style="color: #C6FF00; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Order Transaction Update</p>
            </div>

            <p style="font-size: 16px; color: #EEEEEE;">Hello <strong>${recipientName}</strong>,</p>
            <p style="font-size: 15px; color: #CCCCCC; line-height: 1.5;">
                ${updateMessage || `Your order <strong>#${orderCode}</strong> has been updated to <strong>${(order.status || "").toUpperCase()}</strong>.`}
            </p>

            <div style="background-color: #141414; border: 1px solid #282828; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 14px; color: #888888; text-transform: uppercase;">Transaction Details</p>
                <p style="margin: 0; font-size: 15px; color: #FFFFFF;">
                    Order Reference: <strong>#${orderCode}</strong> &bull; Status: <span style="color: #C6FF00; font-weight: bold;">${(order.status || "").toUpperCase()}</span>
                </p>
            </div>

            <h3 style="color: #FFFFFF; font-size: 16px; margin: 25px 0 12px 0; border-bottom: 1px solid #333333; padding-bottom: 8px;">Purchased Items & Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #1E1E1E;">
                        <th style="padding: 10px; color: #888888; text-align: left; font-size: 12px; text-transform: uppercase;">Product / Service</th>
                        <th style="padding: 10px; color: #888888; text-align: center; font-size: 12px; text-transform: uppercase;">Qty</th>
                        <th style="padding: 10px; color: #888888; text-align: right; font-size: 12px; text-transform: uppercase;">Unit Price</th>
                        <th style="padding: 10px; color: #888888; text-align: right; font-size: 12px; text-transform: uppercase;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 1px solid #333333;">
                <p style="font-size: 14px; color: #888888; margin: 4px 0;">Subtotal: <span style="color: #FFFFFF;">₱${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
                <p style="font-size: 14px; color: #888888; margin: 4px 0;">Shipping: <span style="color: #C6FF00;">Free Shipping</span></p>
                <p style="font-size: 20px; color: #FFFFFF; font-weight: bold; margin: 10px 0 0 0;">
                    Grand Total: <span style="color: #C6FF00;">₱${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </p>
            </div>

            <div style="background-color: #121212; border-left: 3px solid #C6FF00; padding: 12px; margin-top: 25px;">
                <p style="margin: 0; font-size: 13px; color: #AAAAAA;">
                    An official transaction receipt PDF is attached to this email for your records and warranty validation.
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #222222; font-size: 12px; color: #666666;">
                <p style="margin: 0;">FGP Motorcycle Gear &bull; Precision equipment for riders</p>
            </div>
        </div>
        `

        const mailOptions = {
            from: process.env.MAIL_FROM || "FGP Gear Store <orders@fgpgear.com>",
            to: `${recipientName} <${recipientEmail}>`,
            subject: `[FGP Gear] Transaction Update - Order #${orderCode} (${(order.status || "").toUpperCase()})`,
            text: `Your transaction for order #${orderCode} has been updated to ${order.status}. Grand Total: PHP ${grandTotal.toFixed(2)}. Please see attached PDF receipt.`,
            html: htmlContent,
            attachments: pdfBuffer ? [
                {
                    filename: `FGP-Receipt-${orderCode}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ] : []
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`[Mailer] Transaction email sent to ${recipientEmail} for Order #${orderCode}: MessageId ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    } catch (err) {
        console.error("[Mailer] Failed to send transaction email via Mailtrap:", err)
        return { success: false, error: err.message }
    }
}

module.exports = {
    isMailtrapEnabled,
    sendOrderTransactionEmail
}

