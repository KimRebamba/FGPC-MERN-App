const FormField = ({ label, name, type = "text", value, onChange, options, required = false, placeholder, rows }) => {
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
                    />
                    {label}
                </label>
            </div>
        )
    }

    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">{label}</label>

            {type === "select" && (
                <select id={name} name={name} className="form-select" value={value} onChange={onChange} required={required}>
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            )}

            {type === "textarea" && (
                <textarea
                    id={name}
                    name={name}
                    className="form-textarea"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows || 4}
                    required={required}
                />
            )}

            {type !== "select" && type !== "textarea" && (
                <input
                    id={name}
                    name={name}
                    type={type}
                    className="form-input"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
    )
}

export default FormField
