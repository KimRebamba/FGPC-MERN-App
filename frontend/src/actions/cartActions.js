import api from "../api/axiosClient"
import { getErrorMessage } from "../utils/getErrorMessage"
import {
    CART_REQUEST,
    CART_SUCCESS,
    CART_SAVE_REQUEST,
    CART_FAIL
} from "../constants/cartConstants"

const GUEST_CART_KEY = "fgp_guest_cart"

const readGuestCart = () => {
    try {
        const stored = localStorage.getItem(GUEST_CART_KEY)
        return stored ? JSON.parse(stored) : { items: [] }
    } catch {
        return { items: [] }
    }
}

const writeGuestCart = (cart) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
    } catch {
        // ignore
    }
}

export const fetchCart = (userId) => async (dispatch) => {
    dispatch({ type: CART_REQUEST })

    if (!userId) {
        const cart = readGuestCart()
        dispatch({ type: CART_SUCCESS, payload: cart })
        return cart
    }

    try {
        const { data } = await api.get("/carts/" + userId)

        // Check if there was guest cart to merge
        const guestCart = readGuestCart()
        if (guestCart.items && guestCart.items.length > 0) {
            for (const item of guestCart.items) {
                const prodId = item.product?._id || item.product
                if (prodId) {
                    await api.post("/carts/" + userId + "/items", {
                        product: prodId,
                        quantity: item.quantity || 1
                    }).catch(() => null)
                }
            }
            localStorage.removeItem(GUEST_CART_KEY)
            const refreshed = await api.get("/carts/" + userId)
            dispatch({ type: CART_SUCCESS, payload: refreshed.data })
            return refreshed.data
        }

        dispatch({ type: CART_SUCCESS, payload: data })
        return data
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
        return null
    }
}

export const addCartItem = (userId, productId, quantity = 1, productSnapshot = null) => async (dispatch) => {
    dispatch({ type: CART_SAVE_REQUEST })

    const qty = Math.max(1, Number(quantity) || 1)

    if (!userId) {
        const cart = readGuestCart()
        const existing = cart.items.find((it) => (it.product?._id || it.product) === productId)
        const stockLimit = productSnapshot?.stock !== undefined ? productSnapshot.stock : 9999
        const currentQty = existing ? Number(existing.quantity || 0) : 0

        if (currentQty + qty > stockLimit) {
            const allowed = Math.max(0, stockLimit - currentQty)
            if (allowed <= 0) {
                dispatch({ type: CART_FAIL, payload: `Only ${stockLimit} available. All are already in your cart.` })
                return null
            }
            if (existing) {
                existing.quantity = stockLimit
            }
        } else if (existing) {
            existing.quantity = currentQty + qty
        } else {
            cart.items.push({
                _id: "guest_" + productId + "_" + Date.now(),
                product: productSnapshot || { _id: productId, name: "Product", price: 0, stock: stockLimit },
                quantity: qty
            })
        }

        writeGuestCart(cart)
        dispatch({ type: CART_SUCCESS, payload: cart })
        return cart
    }

    try {
        const { data } = await api.post("/carts/" + userId + "/items", { product: productId, quantity: qty })
        dispatch({ type: CART_SUCCESS, payload: data })
        return data
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
        return null
    }
}

export const updateCartItem = (userId, itemId, quantity) => async (dispatch) => {
    dispatch({ type: CART_SAVE_REQUEST })

    const qty = Math.max(1, Number(quantity) || 1)

    if (!userId) {
        const cart = readGuestCart()
        const item = cart.items.find((it) => it._id === itemId)
        if (item) {
            const stockLimit = item.product?.stock !== undefined ? item.product.stock : 9999
            if (qty > stockLimit) {
                dispatch({ type: CART_FAIL, payload: `Only ${stockLimit} available in stock.` })
                return null
            }
            item.quantity = qty
        }
        writeGuestCart(cart)
        dispatch({ type: CART_SUCCESS, payload: cart })
        return cart
    }

    try {
        const { data } = await api.patch("/carts/" + userId + "/items/" + itemId, { quantity: qty })
        dispatch({ type: CART_SUCCESS, payload: data })
        return data
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
        return null
    }
}

export const removeCartItem = (userId, itemId) => async (dispatch) => {
    dispatch({ type: CART_SAVE_REQUEST })

    if (!userId) {
        const cart = readGuestCart()
        cart.items = cart.items.filter((it) => it._id !== itemId)
        writeGuestCart(cart)
        dispatch({ type: CART_SUCCESS, payload: cart })
        return cart
    }

    try {
        const { data } = await api.delete("/carts/" + userId + "/items/" + itemId)
        dispatch({ type: CART_SUCCESS, payload: data })
        return data
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
        return null
    }
}

export const clearCart = (userId) => async (dispatch) => {
    dispatch({ type: CART_SAVE_REQUEST })

    if (!userId) {
        const cart = { items: [] }
        writeGuestCart(cart)
        dispatch({ type: CART_SUCCESS, payload: cart })
        return cart
    }

    try {
        const { data } = await api.delete("/carts/" + userId + "/items")
        dispatch({ type: CART_SUCCESS, payload: data })
        return data
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
        return null
    }
}
