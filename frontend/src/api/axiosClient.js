import axios from "axios"
import { getStoredToken } from "../utils/authStorage"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api"
})

api.interceptors.request.use((config) => {
    const token = getStoredToken()

    if (token) {
        config.headers.Authorization = "Bearer " + token
    }

    return config
})

export default api
