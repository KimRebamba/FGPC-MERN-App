import { useState } from "react"
import { useDispatch } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { updateProfile } from "../../actions/authActions"
import { useAuth } from "../../hooks/useAuth"
import FormField from "../../components/Form/FormField"
import PageHeader from "../../components/Layout/PageHeader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import { resolveImageUrl } from "../../utils/resolveImageUrl"
import api from "../../api/axiosClient"
import { getErrorMessage } from "../../utils/getErrorMessage"

const adminProfileValidationSchema = Yup.object().shape({
    firstName: Yup.string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .required("First name is required"),
    lastName: Yup.string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .required("Last name is required"),
    contactNumber: Yup.string()
        .trim()
        .matches(/^[0-9+\-\s()]*$/, "Please enter a valid contact number")
})

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
)

const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
)

const AdminProfile = () => {
    const dispatch = useDispatch()
    const { user, saving, error } = useAuth()

    const [activeTab, setActiveTab] = useState("info")

    // Personal info
    const [avatar, setAvatar] = useState(null)
    const [infoMessage, setInfoMessage] = useState(null)
    const [infoError, setInfoError] = useState(null)

    // Password
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [passwordVerified, setPasswordVerified] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState(null)
    const [passwordError, setPasswordError] = useState(null)

    const avatarUrl = resolveImageUrl(user.profilePath)
    const initials = (user.firstName?.[0] || user.email?.[0] || "A").toUpperCase()

    const formik = useFormik({
        initialValues: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            contactNumber: user.contactNumber || ""
        },
        enableReinitialize: true,
        validationSchema: adminProfileValidationSchema,
        onSubmit: async (values) => {
            setInfoError(null)
            setInfoMessage(null)

            const formData = new FormData()
            formData.append("firstName", values.firstName)
            formData.append("lastName", values.lastName)
            formData.append("contactNumber", values.contactNumber || "")

            if (avatar) {
                formData.append("profile", avatar)
            }

            const updatedUser = await dispatch(updateProfile(formData))

            if (updatedUser) {
                setInfoMessage("Profile updated successfully!")
                setAvatar(null)
            }
        }
    })

    const handleVerifyOldPassword = async () => {
        setPasswordError(null)

        if (!oldPassword) {
            setPasswordError("Please enter your current password")
            return
        }

        setVerifying(true)

        try {
            await api.post("/auth/verify-password", { password: oldPassword })
            setPasswordVerified(true)
        } catch (err) {
            setPasswordError(getErrorMessage(err) || "Incorrect password")
        } finally {
            setVerifying(false)
        }
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()
        setPasswordError(null)
        setPasswordMessage(null)

        if (!newPassword) {
            setPasswordError("New password is required")
            return
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        setChangingPassword(true)

        try {
            await api.patch("/auth/me/password", { password: newPassword })
            setPasswordMessage("Password changed successfully!")
            setOldPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
            setPasswordVerified(false)
        } catch (err) {
            setPasswordError(getErrorMessage(err) || "Failed to change password")
        } finally {
            setChangingPassword(false)
        }
    }

    return (
        <div className="admin-page">
            <PageHeader title="My Profile" description="Manage your admin account settings" />

            {/* Summary */}
            <div className="profile-summary">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={user.firstName} className="profile-avatar" />
                ) : (
                    <div className="profile-avatar-placeholder">{initials}</div>
                )}
                <div>
                    <p className="profile-name">{user.firstName} {user.lastName}</p>
                    <p className="profile-email">{user.email}</p>
                    <p className="profile-role">{user.role}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    type="button"
                    className={"profile-tab" + (activeTab === "info" ? " active" : "")}
                    onClick={() => setActiveTab("info")}
                >
                    Personal info
                </button>
                <button
                    type="button"
                    className={"profile-tab" + (activeTab === "password" ? " active" : "")}
                    onClick={() => setActiveTab("password")}
                >
                    Change password
                </button>
            </div>

            {/* ---- Tab: Info ---- */}
            {activeTab === "info" && (
                <div className="profile-section">
                    <div className="notification-slot">
                        <ErrorMessage message={infoError || error} />
                        {infoMessage && <p className="form-success">{infoMessage}</p>}
                    </div>

                    <form className="admin-form" onSubmit={formik.handleSubmit} noValidate>
                        <FormField
                            label="First name"
                            name="firstName"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.firstName && formik.errors.firstName}
                            required
                        />
                        <FormField
                            label="Last name"
                            name="lastName"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lastName && formik.errors.lastName}
                            required
                        />
                        <FormField
                            label="Contact number"
                            name="contactNumber"
                            value={formik.values.contactNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.contactNumber && formik.errors.contactNumber}
                        />

                        <div className="form-field">
                            <label htmlFor="profile" className="form-label">Profile photo</label>
                            <input
                                id="profile"
                                type="file"
                                className="form-input"
                                accept="image/*"
                                onChange={(event) => setAvatar(event.target.files[0] || null)}
                            />
                            {avatar && <p className="form-hint">{avatar.name}</p>}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="primary-button" disabled={saving}>
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ---- Tab: Password ---- */}
            {activeTab === "password" && (
                <div className="profile-section">
                    <div className="notification-slot">
                        <ErrorMessage message={passwordError} />
                        {passwordMessage && <p className="form-success">{passwordMessage}</p>}
                    </div>

                    {!passwordVerified && (
                        <div className="admin-form">
                            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                Verify your current password first.
                            </p>

                            <div className="form-field">
                                <label htmlFor="oldPassword" className="form-label">Current password</label>
                                <div className="password-field">
                                    <input
                                        id="oldPassword"
                                        type={showOld ? "text" : "password"}
                                        className="form-input"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Your current password"
                                        autoComplete="current-password"
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowOld((p) => !p)}>
                                        {showOld ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="primary-button" onClick={handleVerifyOldPassword} disabled={verifying}>
                                    {verifying ? "Verifying..." : "Verify password"}
                                </button>
                            </div>
                        </div>
                    )}

                    {passwordVerified && (
                        <form className="admin-form" onSubmit={handlePasswordSubmit} noValidate>
                            <p className="form-success">✓ Password verified. Enter your new password.</p>

                            <div className="form-field">
                                <label htmlFor="newPassword" className="form-label">New password</label>
                                <div className="password-field">
                                    <input
                                        id="newPassword"
                                        type={showNew ? "text" : "password"}
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowNew((p) => !p)}>
                                        {showNew ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="confirmNewPassword" className="form-label">Confirm new password</label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    className="form-input"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="primary-button" disabled={changingPassword}>
                                    {changingPassword ? "Changing..." : "Change password"}
                                </button>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        setPasswordVerified(false)
                                        setOldPassword("")
                                        setNewPassword("")
                                        setConfirmNewPassword("")
                                        setPasswordError(null)
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminProfile

