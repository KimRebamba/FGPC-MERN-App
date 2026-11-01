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

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    saving: false,
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
            return { ...state, loading: false, error: null, user: action.payload, isAuthenticated: true }

        case LOAD_USER_SUCCESS:
            return { ...state, loading: false, error: null, user: action.payload, isAuthenticated: true }

        case LOGIN_FAIL:
        case REGISTER_FAIL:
            return { ...state, loading: false, error: action.payload }

        case LOAD_USER_FAIL:
            return { ...state, loading: false, error: null, user: null, isAuthenticated: false }

        case PROFILE_REQUEST:
            return { ...state, saving: true, error: null }

        case PROFILE_SUCCESS:
            return { ...state, saving: false, user: action.payload }

        case PROFILE_FAIL:
            return { ...state, saving: false, error: action.payload }

        case LOGOUT:
            return { ...state, user: null, isAuthenticated: false, loading: false, saving: false, error: null }

        case CLEAR_AUTH_ERROR:
            return { ...state, error: null }

        default:
            return state
    }
}
