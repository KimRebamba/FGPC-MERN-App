import axios from "axios"

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
    withCredentials: true
})

// Automatically attach Bearer token to all outgoing requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("fgp_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api
