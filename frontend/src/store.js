import { legacy_createStore as createStore, combineReducers, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"

import { authReducer } from "./reducers/authReducers"
import { cartReducer } from "./reducers/cartReducers"
import {
    productsReducer,
    categoriesReducer,
    brandsReducer,
    usersReducer,
    cartsReducer,
    ordersReducer,
    returnRequestsReducer,
    reviewsReducer,
    authIdentitiesReducer
} from "./reducers/resourceReducers"

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    users: usersReducer,
    carts: cartsReducer,
    orders: ordersReducer,
    returnRequests: returnRequestsReducer,
    reviews: reviewsReducer,
    authIdentities: authIdentitiesReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store
