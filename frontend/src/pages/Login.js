import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signInWithPopup } from "firebase/auth"
import { useFormik } from "formik"
import * as Yup from "yup"
import { auth, googleProvider } from "../firebase"
import { clearAuthError, loginUser, loginWithGoogle } from "../actions/authActions"

// SVG icons
const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
)

const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.8 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.8z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.2-11.4-7.8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.2 5.2c-.4.4 6.7-4.9 6.7-14.7 0-1.3-.1-2.6-.4-3.8z" />
    </svg>
)

const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Email address is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    remember: Yup.boolean()
})

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { loading, error } = useSelector((state) => state.auth)

    const [showPassword, setShowPassword] = useState(false)
    const [localError, setLocalError] = useState(null)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const goAfterLogin = (loggedInUser) => {
        if (!loggedInUser) return

        const target = location.state?.from

        if (target) {
            navigate(target)
            return
        }

        navigate(loggedInUser.role === "admin" ? "/admin" : "/")
    }

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            remember: true
        },
        validationSchema: loginValidationSchema,
        onSubmit: async (values) => {
            setLocalError(null)
            const result = await dispatch(loginUser(values.email, values.password, values.remember))
            goAfterLogin(result)
        }
    })

    const handleGoogleLogin = async () => {
        setLocalError(null)

        try {
            const result = await signInWithPopup(auth, googleProvider)
            const idToken = await result.user.getIdToken()

            goAfterLogin(await dispatch(loginWithGoogle(idToken)))
        } catch (requestError) {
            setLocalError(requestError.message)
        }
    }

    const displayError = localError || error

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <img src="/fgp-logo-small.png" alt="FGP" />
                </div>

                {/* Heading */}
                <div className="auth-heading">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to shop or manage the store</p>
                </div>

                {/* Messages */}
                <div className="notification-slot">
                    {location.state?.message && (
                        <p className="form-success">{location.state.message}</p>
                    )}
                    {displayError && (
                        <p className="form-error">{displayError}</p>
                    )}
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={formik.handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={`form-input ${formik.touched.email && formik.errors.email ? "input-error" : ""}`}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                {formik.errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-field">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className={`form-input ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                {formik.errors.password}
                            </span>
                        )}
                    </div>

                    <div className="form-field form-field-checkbox">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            className="form-checkbox"
                            checked={formik.values.remember}
                            onChange={formik.handleChange}
                        />
                        <label htmlFor="remember" className="form-label" style={{ textTransform: "none", fontSize: "14px" }}>
                            Remember me for 7 days
                        </label>
                    </div>

                    <button type="submit" className="primary-button" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: 700 }}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                {/* Google Sign-in */}
                <button
                    type="button"
                    className="google-button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{ width: "100%", padding: "12px", fontSize: "15px" }}
                >
                    <GoogleIcon />
                    <span>Sign in with Google</span>
                </button>

                {/* Footer link */}
                <p className="auth-footer-text" style={{ fontSize: "14px", marginTop: "24px" }}>
                    Don't have an account? <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Create account</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
