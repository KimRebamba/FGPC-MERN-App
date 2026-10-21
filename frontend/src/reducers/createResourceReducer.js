export const createInitialResourceState = () => ({
    items: [],
    count: 0,
    item: null,
    loading: false,
    saving: false,
    error: null,
    message: null
})

export const createResourceReducer = (types) => (state = createInitialResourceState(), action) => {
    switch (action.type) {
        case types.LIST_REQUEST:
        case types.DETAIL_REQUEST:
            return { ...state, loading: true, error: null }

        case types.LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload.items,
                count: action.payload.count
            }

        case types.DETAIL_SUCCESS:
            return { ...state, loading: false, item: action.payload }

        case types.SAVE_REQUEST:
            return { ...state, saving: true, error: null, message: null }

        case types.SAVE_SUCCESS: {
            const savedItem = action.payload.item
            const items = savedItem && state.items.some((entry) => entry._id === savedItem._id)
                ? state.items.map((entry) => (entry._id === savedItem._id ? savedItem : entry))
                : state.items

            return {
                ...state,
                saving: false,
                items,
                item: savedItem || state.item,
                message: action.payload.message
            }
        }

        case types.DELETE_SUCCESS: {
            const items = state.items.filter((entry) => entry._id !== action.payload.id)

            return {
                ...state,
                saving: false,
                items,
                count: Math.max(state.count - 1, 0),
                message: action.payload.message
            }
        }

        case types.FAIL:
            return { ...state, loading: false, saving: false, error: action.payload }

        case types.CLEAR:
            return { ...state, error: null, message: null }

        default:
            return state
    }
}
