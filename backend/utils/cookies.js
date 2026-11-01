const SESSION_COOKIE = "fgpSession"

const sessionDuration = 7 * 24 * 60 * 60 * 1000

const cookieOptions = (remember) => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(remember ? { maxAge: sessionDuration } : {})
})

const setSessionCookie = (res, token, remember) => {
    res.cookie(SESSION_COOKIE, token, cookieOptions(remember))
}

const clearSessionCookie = (res) => {
    res.clearCookie(SESSION_COOKIE, cookieOptions(false))
}

module.exports = {
    SESSION_COOKIE,
    setSessionCookie,
    clearSessionCookie
}
