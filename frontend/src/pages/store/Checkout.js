import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderActions } from "../../actions/resourceActions"
import { fetchCart } from "../../actions/cartActions"
import { useAuth } from "../../hooks/useAuth"
import FormField from "../../components/Form/FormField"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import { formatPrice } from "../../utils/formatPrice"
import { cartTotal } from "../../utils/calculateTotal"

const emptyAddress = {
    recipientName: "",
    contactNumber: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: ""
}

const paymentMethods = ["cod", "gcash", "maya", "card", "bank_transfer"]

const Checkout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useAuth()

    const { cart } = useSelector((state) => state.cart)
    const { saving, error } = useSelector((state) => state.orders)

    const [selectedAddressIndex, setSelectedAddressIndex] = useState(
        user?.addresses?.length > 0 ? 0 : "custom"
    )
    const [form, setForm] = useState(
        user?.addresses?.[0] ? { ...user.addresses[0] } : emptyAddress
    )
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [localError, setLocalError] = useState(null)

    useEffect(() => {
        if (!cart) {
            dispatch(fetchCart(user._id))
        }
    }, [dispatch, cart, user._id])

    const items = cart ? cart.items : []
    const total = cartTotal(items)

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({ ...previous, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLocalError(null)

        if (items.length === 0) {
            setLocalError("Your cart is empty")
            return
        }

        if (!form.recipientName || !form.contactNumber || !form.street || !form.city || !form.province || !form.postalCode) {
            setLocalError("Please fill out all required shipping address fields.")
            return
        }

        const order = await dispatch(orderActions.create({
            items: items.map((item) => ({ product: item.product._id, quantity: item.quantity })),
            paymentMethod,
            shippingAddressSnapshot: form
        }))

        if (order) {
            dispatch(fetchCart(user._id))
            navigate("/orders/" + order._id)
        }
    }

    return (
        <div className="checkout-page">
            <h1 className="page-title">Checkout</h1>

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                    <h2 className="section-title">Shipping address</h2>

                    <ErrorMessage message={localError || error} />

                    
                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="saved-addresses-selector" style={{ marginBottom: "28px" }}>
                            <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
                                Choose from your saved addresses
                            </label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {user.addresses.map((addr, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSelectedAddressIndex(idx)
                                            setForm({ ...addr })
                                        }}
                                        style={{
                                            border: selectedAddressIndex === idx ? "2px solid var(--accent)" : "1px solid var(--border)",
                                            background: selectedAddressIndex === idx ? "var(--surface-2)" : "var(--surface)",
                                            padding: "18px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "14px",
                                            transition: "border-color 0.2s ease"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            checked={selectedAddressIndex === idx}
                                            onChange={() => {
                                                setSelectedAddressIndex(idx)
                                                setForm({ ...addr })
                                            }}
                                            style={{ marginTop: "4px", accentColor: "var(--accent)" }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: "17px", color: "var(--text)" }}>
                                                {addr.recipientName} · {addr.contactNumber}
                                            </p>
                                            <p style={{ fontSize: "15px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.5" }}>
                                                {addr.street}, {addr.barangay ? addr.barangay + ", " : ""}{addr.city}, {addr.province} {addr.postalCode}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div
                                    onClick={() => {
                                        setSelectedAddressIndex("custom")
                                        setForm(emptyAddress)
                                    }}
                                    style={{
                                        border: selectedAddressIndex === "custom" ? "2px solid var(--accent)" : "1px solid var(--border)",
                                        background: selectedAddressIndex === "custom" ? "var(--surface-2)" : "var(--surface)",
                                        padding: "16px 18px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="selectedAddress"
                                        checked={selectedAddressIndex === "custom"}
                                        onChange={() => {
                                            setSelectedAddressIndex("custom")
                                            setForm(emptyAddress)
                                        }}
                                        style={{ accentColor: "var(--accent)" }}
                                    />
                                    <span style={{ fontSize: "16px", color: "var(--text)" }}>
                                        + Use a different shipping address
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <FormField label="Recipient name" name="recipientName" value={form.recipientName} onChange={handleChange} required />
                    <FormField label="Contact number" name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
                    <FormField label="Street" name="street" value={form.street} onChange={handleChange} required />
                    <FormField label="Barangay" name="barangay" value={form.barangay} onChange={handleChange} required />
                    <FormField label="City" name="city" value={form.city} onChange={handleChange} required />
                    <FormField label="Province" name="province" value={form.province} onChange={handleChange} required />
                    <FormField label="Postal code" name="postalCode" value={form.postalCode} onChange={handleChange} required />

                    <div className="form-field">
                        <label htmlFor="paymentMethod" className="form-label">Payment method</label>
                        <select
                            id="paymentMethod"
                            className="form-select"
                            value={paymentMethod}
                            onChange={(event) => setPaymentMethod(event.target.value)}
                        >
                            {paymentMethods.map((method) => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="primary-button" disabled={saving || items.length === 0}>
                        {saving ? "Placing order..." : "Place order"}
                    </button>
                </form>

                <aside className="checkout-summary">
                    <h2 className="section-title">Order summary</h2>

                    {items.length === 0 ? (
                        <p className="empty-state">
                            Your cart is empty. <Link to="/" className="table-link">Browse products</Link>
                        </p>
                    ) : (
                        <ul className="checkout-items">
                            {items.map((item) => (
                                <li key={item._id} className="checkout-item">
                                    <span className="checkout-item-name">{item.product?.name}</span>
                                    <span className="checkout-item-quantity">x{item.quantity}</span>
                                    <span className="checkout-item-price">
                                        {formatPrice(Number(item.product?.price || 0) * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="cart-total">Total: {formatPrice(total)}</p>
                </aside>
            </div>
        </div>
    )
}

export default Checkout
