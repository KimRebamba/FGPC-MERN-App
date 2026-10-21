import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase"
import { clearAuthError, loginUser, loginWithGoogle } from "../actions/authActions"

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { loading, error } = useSelector((state) => state.auth)

    const [form, setForm] = useState({ email: "", password: "" })
    const [localError, setLocalError] = useState(null)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({ ...previous, [name]: value }))
    }

    const openDashboard = (user) => {
        if (user && user.role === "admin") {
            navigate("/admin")
            return
        }

        setLocalError("This account does not have admin access")
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLocalError(null)

        openDashboard(await dispatch(loginUser(form.email, form.password)))
    }

    const handleGoogleLogin = async () => {
        setLocalError(null)

        try {
            const result = await signInWithPopup(auth, googleProvider)
            const idToken = await result.user.getIdToken()

            openDashboard(await dispatch(loginWithGoogle(idToken)))
        } catch (requestError) {
            setLocalError(requestError.message)
        }
    }

    return (
        <div className="auth-page">
            <h1 className="auth-title">Admin login</h1>
            <p className="auth-subtitle">Sign in to manage the store</p>

            {location.state?.message && <p className="form-success">{location.state.message}</p>}
            <p className="form-error">{localError || error}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-input"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <button type="button" className="google-button" onClick={handleGoogleLogin} disabled={loading}>
                Continue with Google
            </button>

            <p className="auth-footer">
                No account yet? <Link to="/register" className="auth-link">Register</Link>
            </p>
        </div>
    )
}

export default Login
