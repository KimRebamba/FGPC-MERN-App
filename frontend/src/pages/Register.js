import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { clearAuthError, registerUser } from "../actions/authActions"
import { fgpLogoSmall } from "../assets"

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

// [prof-requirements: Unit 1 - Form validation on user registration: Yup & Formik (10pts)]
const registerValidationSchema = Yup.object().shape({
    firstName: Yup.string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .required("First name is required"),
    lastName: Yup.string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .required("Last name is required"),
    email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Email address is required"),
    contactNumber: Yup.string()
        .trim()
        .matches(/^[0-9+\-\s()]*$/, "Please enter a valid contact number"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords do not match")
        .required("Please confirm your password")
})

const Register = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state) => state.auth)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [localError, setLocalError] = useState(null)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: registerValidationSchema,
        onSubmit: async (values) => {
            setLocalError(null)
            const user = await dispatch(registerUser({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                contactNumber: values.contactNumber.trim() || undefined,
                password: values.password
            }))

            if (user) {
                navigate("/")
            }
        }
    })

    const displayError = localError || error

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <img src={fgpLogoSmall} alt="FGP" />
                </div>

                {/* Heading */}
                <div className="auth-heading">
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">Join FGP and start shopping premium moto gear</p>
                </div>

                {/* Messages */}
                <div className="notification-slot">
                    {displayError && (
                        <p className="form-error">{displayError}</p>
                    )}
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={formik.handleSubmit} noValidate>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-field">
                            <label htmlFor="firstName" className="form-label">First name *</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                className={`form-input ${formik.touched.firstName && formik.errors.firstName ? "input-error" : ""}`}
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Juan"
                                autoComplete="given-name"
                            />
                            {formik.touched.firstName && formik.errors.firstName && (
                                <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                    {formik.errors.firstName}
                                </span>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="lastName" className="form-label">Last name *</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                className={`form-input ${formik.touched.lastName && formik.errors.lastName ? "input-error" : ""}`}
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Dela Cruz"
                                autoComplete="family-name"
                            />
                            {formik.touched.lastName && formik.errors.lastName && (
                                <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                    {formik.errors.lastName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="email" className="form-label">Email *</label>
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
                        <label htmlFor="contactNumber" className="form-label">Contact number <span style={{ color: "var(--text-dim)", fontStyle: "normal" }}>(optional)</span></label>
                        <input
                            id="contactNumber"
                            name="contactNumber"
                            type="tel"
                            className={`form-input ${formik.touched.contactNumber && formik.errors.contactNumber ? "input-error" : ""}`}
                            value={formik.values.contactNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="+63 912 345 6789"
                            autoComplete="tel"
                        />
                        {formik.touched.contactNumber && formik.errors.contactNumber && (
                            <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                {formik.errors.contactNumber}
                            </span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">Password *</label>
                        <div className="password-field">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className={`form-input ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
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

                    <div className="form-field">
                        <label htmlFor="confirmPassword" className="form-label">Confirm password *</label>
                        <div className="password-field">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                className={`form-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "input-error" : ""}`}
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirm((prev) => !prev)}
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                                {formik.errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <button type="submit" className="primary-button" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: 700 }}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                {/* Footer links */}
                <p className="auth-footer" style={{ fontSize: "16px", marginTop: "20px" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>

                <div style={{ marginTop: "16px" }}>
                    <Link to="/login" className="secondary-button" style={{ display: "inline-flex", width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px" }}>
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register
