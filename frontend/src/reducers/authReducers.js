import { getStoredToken, getStoredUser } from "../utils/authStorage"
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

const storedToken = getStoredToken()
const storedUser = getStoredUser()

const initialState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: Boolean(storedToken && storedUser),
    loading: false,
    error: null
}

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
        case REGISTER_REQUEST:
        case LOAD_USER_REQUEST:
            return { ...state, loading: true, error: null }

        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true
            }

        case LOAD_USER_SUCCESS:
            return { ...state, loading: false, error: null, user: action.payload, isAuthenticated: true }

        case LOGIN_FAIL:
        case REGISTER_FAIL:
            return { ...state, loading: false, error: action.payload }

        case LOAD_USER_FAIL:
            return { ...state, loading: false, error: action.payload, user: null, token: null, isAuthenticated: false }

        case LOGOUT:
            return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: null }

        case CLEAR_AUTH_ERROR:
            return { ...state, error: null }

        default:
            return state
    }
}
