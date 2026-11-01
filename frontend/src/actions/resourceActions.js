import api from "../api/axiosClient"
import { createResourceActions } from "../api/createResourceActions"
import { getErrorMessage } from "../utils/getErrorMessage"
import {
    productTypes,
    categoryTypes,
    brandTypes,
    userTypes,
    cartTypes,
    orderTypes,
    returnRequestTypes,
    reviewTypes,
    authIdentityTypes
} from "../constants/resourceTypes"

export const productActions = createResourceActions({
    types: productTypes,
    endpoint: "/products",
    listKey: "products"
})

export const categoryActions = createResourceActions({
    types: categoryTypes,
    endpoint: "/categories",
    listKey: "categories"
})

export const brandActions = createResourceActions({
    types: brandTypes,
    endpoint: "/brands",
    listKey: "brands"
})

export const userActions = createResourceActions({
    types: userTypes,
    endpoint: "/users",
    listKey: "users"
})

export const cartListActions = createResourceActions({
    types: cartTypes,
    endpoint: "/carts",
    listKey: "carts"
})

export const reviewActions = createResourceActions({
    types: reviewTypes,
    endpoint: "/reviews",
    listKey: "reviews"
})

export const authIdentityActions = createResourceActions({
    types: authIdentityTypes,
    endpoint: "/auth-identities",
    listKey: "authIdentities"
})

export const orderActions = {
    ...createResourceActions({
        types: orderTypes,
        endpoint: "/orders",
        listKey: "orders"
    }),

    complete: (id) => async (dispatch) => {
        dispatch({ type: orderTypes.SAVE_REQUEST })

        try {
            const { data } = await api.patch("/orders/" + id + "/complete")

            dispatch({
                type: orderTypes.SAVE_SUCCESS,
                payload: { item: data.order || data, message: data.message || "Order marked as completed" }
            })

            return data
        } catch (error) {
            dispatch({ type: orderTypes.FAIL, payload: getErrorMessage(error) })

            return null
        }
    },

    cancel: (id) => async (dispatch) => {
        dispatch({ type: orderTypes.SAVE_REQUEST })

        try {
            const { data } = await api.patch("/orders/" + id + "/cancel")

            dispatch({
                type: orderTypes.SAVE_SUCCESS,
                payload: { item: data.order || data, message: data.message || "Order cancelled" }
            })

            return data
        } catch (error) {
            dispatch({ type: orderTypes.FAIL, payload: getErrorMessage(error) })

            return null
        }
    },

    updateStatus: (id, status, extra = {}) => async (dispatch) => {
        dispatch({ type: orderTypes.SAVE_REQUEST })

        try {
            const payload = typeof status === "object" ? status : { status, ...extra }
            const { data } = await api.patch("/orders/" + id + "/status", payload)

            dispatch({
                type: orderTypes.SAVE_SUCCESS,
                payload: { item: data, message: data.message || "Order updated" }
            })

            return data
        } catch (error) {
            dispatch({ type: orderTypes.FAIL, payload: getErrorMessage(error) })

            return null
        }
    }
}

export const returnRequestActions = {
    ...createResourceActions({
        types: returnRequestTypes,
        endpoint: "/return-requests",
        listKey: "returnRequests"
    }),

    cancel: (id) => async (dispatch) => {
        dispatch({ type: returnRequestTypes.SAVE_REQUEST })

        try {
            const { data } = await api.patch("/return-requests/" + id + "/cancel")

            dispatch({
                type: returnRequestTypes.SAVE_SUCCESS,
                payload: { item: data.returnRequest || data, message: data.message || "Return request cancelled" }
            })

            return data
        } catch (error) {
            dispatch({ type: returnRequestTypes.FAIL, payload: getErrorMessage(error) })

            return null
        }
    }
}
