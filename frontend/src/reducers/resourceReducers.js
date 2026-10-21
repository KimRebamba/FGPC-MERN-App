import { createResourceReducer } from "./createResourceReducer"
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

export const productsReducer = createResourceReducer(productTypes)

export const categoriesReducer = createResourceReducer(categoryTypes)

export const brandsReducer = createResourceReducer(brandTypes)

export const usersReducer = createResourceReducer(userTypes)

export const cartsReducer = createResourceReducer(cartTypes)

export const ordersReducer = createResourceReducer(orderTypes)

export const returnRequestsReducer = createResourceReducer(returnRequestTypes)

export const reviewsReducer = createResourceReducer(reviewTypes)

export const authIdentitiesReducer = createResourceReducer(authIdentityTypes)
