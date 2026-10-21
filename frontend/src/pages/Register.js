import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { clearAuthError, registerUser } from "../actions/authActions"

const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
}

const Register = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state) => state.auth)

    const [form, setForm] = useState(emptyForm)
    const [localError, setLocalError] = useState(null)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({ ...previous, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLocalError(null)

        if (form.password !== form.confirmPassword) {
            setLocalError("Passwords do not match")
            return
        }

        const user = await dispatch(registerUser({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password
        }))

        if (user) {
            navigate("/login", { state: { message: "Account created. Sign in to continue." } })
        }
    }

    return (
        <div className="auth-page">
            <h1 className="auth-title">Create an account</h1>
            <p className="auth-subtitle">New accounts start as customers</p>

            <p className="form-error">{localError || error}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="firstName" className="form-label">First name</label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="form-input"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="lastName" className="form-label">Last name</label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="form-input"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

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
                        minLength={6}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="form-input"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        minLength={6}
                        required
                    />
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="auth-footer">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
        </div>
    )
}

export default Register
