const TOKEN_KEY = "fgpAdminToken"
const USER_KEY = "fgpAdminUser"

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
    const storedUser = localStorage.getItem(USER_KEY)

    return storedUser ? JSON.parse(storedUser) : null
}

export const saveSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const saveStoredUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}
