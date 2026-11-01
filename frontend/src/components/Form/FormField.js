const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    onBlur,
    options,
    required = false,
    placeholder,
    rows,
    error,
    disabled = false
}) => {
    if (type === "checkbox") {
        return (
            <div className="form-field form-field-checkbox">
                <label htmlFor={name} className="form-label">
                    <input
                        id={name}
                        name={name}
                        type="checkbox"
                        className="form-checkbox"
                        checked={Boolean(value)}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={disabled}
                    />
                    {label}
                </label>
                {error && <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block" }}>{error}</span>}
            </div>
        )
    }

    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">{label}{required && " *"}</label>

            {type === "select" && (
                <select
                    id={name}
                    name={name}
                    className={`form-select ${error ? "input-error" : ""}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    required={required}
                    disabled={disabled}
                >
                    <option value="">Select {label.toLowerCase()}</option>
                    {options && options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            )}

            {type === "textarea" && (
                <textarea
                    id={name}
                    name={name}
                    className={`form-textarea ${error ? "input-error" : ""}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    rows={rows || 4}
                    required={required}
                    disabled={disabled}
                />
            )}

            {type !== "select" && type !== "textarea" && (
                <input
                    id={name}
                    name={name}
                    type={type}
                    className={`form-input ${error ? "input-error" : ""}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                />
            )}

            {error && (
                <span className="field-error-text" style={{ color: "var(--danger)", fontSize: "13px", marginTop: "4px", display: "block", fontWeight: 500 }}>
                    {error}
                </span>
            )}
        </div>
    )
}

export default FormField
