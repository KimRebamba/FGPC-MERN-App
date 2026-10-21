export const getErrorMessage = (error) => {
    if (error.response?.data?.error) {
        return error.response.data.error
    }

    if (error.message) {
        return error.message
    }

    return "Something went wrong"
}
