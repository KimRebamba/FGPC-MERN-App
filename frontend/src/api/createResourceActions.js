import api from "./axiosClient"
import { getErrorMessage } from "../utils/getErrorMessage"

const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value)
        }
    })

    const query = searchParams.toString()

    return query ? "?" + query : ""
}

export const createResourceActions = ({ types, endpoint, listKey }) => {
    const fetchAll = (params) => async (dispatch) => {
        dispatch({ type: types.LIST_REQUEST })

        try {
            const { data } = await api.get(endpoint + buildQueryString(params))

            dispatch({
                type: types.LIST_SUCCESS,
                payload: {
                    items: data[listKey] || [],
                    count: data.count || 0
                }
            })
        } catch (error) {
            dispatch({ type: types.FAIL, payload: getErrorMessage(error) })
        }
    }

    const fetchOne = (id) => async (dispatch) => {
        dispatch({ type: types.DETAIL_REQUEST })

        try {
            const { data } = await api.get(endpoint + "/" + id)

            dispatch({ type: types.DETAIL_SUCCESS, payload: data })
        } catch (error) {
            dispatch({ type: types.FAIL, payload: getErrorMessage(error) })
        }
    }

    const create = (values) => async (dispatch) => {
        dispatch({ type: types.SAVE_REQUEST })

        try {
            const { data } = await api.post(endpoint, values)

            dispatch({
                type: types.SAVE_SUCCESS,
                payload: { item: data, message: data.message || "Record created" }
            })

            return data
        } catch (error) {
            dispatch({ type: types.FAIL, payload: getErrorMessage(error) })

            return null
        }
    }

    const update = (id, values) => async (dispatch) => {
        dispatch({ type: types.SAVE_REQUEST })

        try {
            const { data } = await api.patch(endpoint + "/" + id, values)

            dispatch({
                type: types.SAVE_SUCCESS,
                payload: { item: data, message: data.message || "Record updated" }
            })

            return data
        } catch (error) {
            dispatch({ type: types.FAIL, payload: getErrorMessage(error) })

            return null
        }
    }

    const remove = (id) => async (dispatch) => {
        dispatch({ type: types.SAVE_REQUEST })

        try {
            const { data } = await api.delete(endpoint + "/" + id)

            dispatch({
                type: types.DELETE_SUCCESS,
                payload: { id, message: data.message || "Record deleted" }
            })

            return data
        } catch (error) {
            dispatch({ type: types.FAIL, payload: getErrorMessage(error) })

            return null
        }
    }

    return { fetchAll, fetchOne, create, update, remove }
}
