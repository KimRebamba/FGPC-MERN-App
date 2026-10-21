import api from "../api/axiosClient"
import { getErrorMessage } from "../utils/getErrorMessage"
import { clearSession, getStoredToken, saveSession, saveStoredUser } from "../utils/authStorage"
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
    LOGOUT,
    CLEAR_AUTH_ERROR
} from "../constants/authConstants"

const startSession = (dispatch, type, data) => {
    saveSession(data)
    dispatch({ type, payload: { user: data.user, token: data.token } })
}

export const loginUser = (email, password) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST })

    try {
        const { data } = await api.post("/auth/login", { email, password })

        startSession(dispatch, LOGIN_SUCCESS, data)

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

        startSession(dispatch, LOGIN_SUCCESS, data)

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

        startSession(dispatch, REGISTER_SUCCESS, data)

        return data.user
    } catch (error) {
        dispatch({ type: REGISTER_FAIL, payload: getErrorMessage(error) })

        return null
    }
}

export const loadUser = () => async (dispatch) => {
    if (!getStoredToken()) {
        return
    }

    dispatch({ type: LOAD_USER_REQUEST })

    try {
        const { data } = await api.get("/auth/me")

        saveStoredUser(data)
        dispatch({ type: LOAD_USER_SUCCESS, payload: data })
    } catch (error) {
        clearSession()
        dispatch({ type: LOAD_USER_FAIL, payload: getErrorMessage(error) })
    }
}

export const logoutUser = () => (dispatch) => {
    clearSession()
    dispatch({ type: LOGOUT })
}

export const clearAuthError = () => (dispatch) => {
    dispatch({ type: CLEAR_AUTH_ERROR })
}
