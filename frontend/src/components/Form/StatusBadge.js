const StatusBadge = ({ value }) => {
    const label = value || "unknown"

    return (
        <span className={"status-badge status-badge-" + String(label).toLowerCase()}>
            {label}
        </span>
    )
}

export default StatusBadge
