const StatusBadge = ({ value }) => {
    if (!value && value !== false) return null

    const label = String(value).toLowerCase().replace(/_/g, " ")
    const cssClass = "status-badge status-badge--" + label.replace(/\s/g, "-")

    return (
        <span className={cssClass}>{label}</span>
    )
}

export default StatusBadge
