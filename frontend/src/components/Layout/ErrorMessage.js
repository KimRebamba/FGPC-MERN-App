const ErrorMessage = ({ message }) => {
    if (!message) return null

    return (
        <p className="form-error-box">{message}</p>
    )
}

export default ErrorMessage
