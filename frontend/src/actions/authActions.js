import api from "../api/axiosClient"
import { getErrorMessage } from "../utils/getErrorMessage"
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    PROFILE_REQUEST,
    PROFILE_SUCCESS,
    PROFILE_FAIL,
    LOGOUT,
    CLEAR_AUTH_ERROR
} from "../constants/authConstants"

export const loginUser = (email, password, remember) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST })

    try {
        const { data } = await api.post("/auth/login", { email, password, remember })

        dispatch({ type: LOGIN_SUCCESS, payload: data.user })

        return data.user
    } catch (error) {
        dispatch({ type: LOGIN_FAIL, payload: getErrorMessage(error) })

        return null
    }
}

export const loginWithGoogle = (idToken) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST })

    try {
        const { data } = await api.post("/auth/google", { idToken })

        dispatch({ type: LOGIN_SUCCESS, payload: data.user })

        return data.user
    } catch (error) {
        dispatch({ type: LOGIN_FAIL, payload: getErrorMessage(error) })

        return null
    }
}

export const registerUser = (values) => async (dispatch) => {
    dispatch({ type: REGISTER_REQUEST })

    try {
        const { data } = await api.post("/auth/register", values)

        dispatch({ type: REGISTER_SUCCESS, payload: data.user })

        return data.user
    } catch (error) {
        dispatch({ type: REGISTER_FAIL, payload: getErrorMessage(error) })

        return null
    }
}

export const loadUser = () => async (dispatch) => {
    dispatch({ type: LOAD_USER_REQUEST })

    try {
        const { data } = await api.get("/auth/me")

        dispatch({ type: LOAD_USER_SUCCESS, payload: data })
    } catch (error) {
        dispatch({ type: LOAD_USER_FAIL })
    }
}

export const updateProfile = (values) => async (dispatch) => {
    dispatch({ type: PROFILE_REQUEST })

    try {
        const { data } = await api.patch("/auth/me", values)

        dispatch({ type: PROFILE_SUCCESS, payload: data })

        return data
    } catch (error) {
        dispatch({ type: PROFILE_FAIL, payload: getErrorMessage(error) })

        return null
    }
}

export const logoutUser = () => async (dispatch) => {
    await api.post("/auth/logout").catch(() => null)

    dispatch({ type: LOGOUT })
}

export const clearAuthError = () => (dispatch) => {
    dispatch({ type: CLEAR_AUTH_ERROR })
}
