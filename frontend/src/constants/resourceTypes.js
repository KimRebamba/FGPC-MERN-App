const createResourceTypes = (name) => ({
    LIST_REQUEST: name + "_LIST_REQUEST",
    LIST_SUCCESS: name + "_LIST_SUCCESS",
    DETAIL_REQUEST: name + "_DETAIL_REQUEST",
    DETAIL_SUCCESS: name + "_DETAIL_SUCCESS",
    SAVE_REQUEST: name + "_SAVE_REQUEST",
    SAVE_SUCCESS: name + "_SAVE_SUCCESS",
    DELETE_SUCCESS: name + "_DELETE_SUCCESS",
    FAIL: name + "_FAIL",
    CLEAR: name + "_CLEAR"
})

export const productTypes = createResourceTypes("PRODUCTS")
export const categoryTypes = createResourceTypes("CATEGORIES")
export const brandTypes = createResourceTypes("BRANDS")
export const userTypes = createResourceTypes("USERS")
export const cartTypes = createResourceTypes("CARTS")
export const orderTypes = createResourceTypes("ORDERS")
export const returnRequestTypes = createResourceTypes("RETURN_REQUESTS")
export const reviewTypes = createResourceTypes("REVIEWS")
export const authIdentityTypes = createResourceTypes("AUTH_IDENTITIES")
