import {
    CART_REQUEST,
    CART_SUCCESS,
    CART_SAVE_REQUEST,
    CART_FAIL
} from "../constants/cartConstants"

const initialState = {
    cart: null,
    loading: false,
    saving: false,
    error: null
}

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case CART_REQUEST:
            return { ...state, loading: true, error: null }

        case CART_SAVE_REQUEST:
            return { ...state, saving: true, error: null }

        case CART_SUCCESS:
            return { ...state, loading: false, saving: false, error: null, cart: action.payload }

        case CART_FAIL:
            return { ...state, loading: false, saving: false, error: action.payload }

        default:
            return state
    }
}
