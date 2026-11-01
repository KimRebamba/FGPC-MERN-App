import { resolveImageUrl } from "../../utils/resolveImageUrl"

const DetailModal = ({ title = "Details", data, isOpen, onClose }) => {
    if (!isOpen || !data) return null

    // Format keys and values nicely
    const entries = Object.entries(data).filter(([key]) => key !== "raw" && !key.startsWith("__"))

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button type="button" className="icon-button modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <table className="modal-table">
                        <tbody>
                            {entries.map(([key, value]) => {
                                // Don't show complex react elements or functions
                                if (typeof value === "function") return null

                                const label = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())

                                let content = value

                                if (value === null || value === undefined || value === "") {
                                    content = <span style={{ color: "var(--text-dim)" }}>—</span>
                                } else if (typeof value === "boolean") {
                                    content = value ? "Yes" : "No"
                                } else if (typeof value === "string" && (value.endsWith(".jpg") || value.endsWith(".png") || value.endsWith(".webp") || value.endsWith(".jpeg") || value.startsWith("/uploads/"))) {
                                    const url = resolveImageUrl(value)
                                    content = url ? (
                                        <img src={url} alt={key} style={{ maxHeight: "120px", objectFit: "contain", border: "1px solid var(--border)" }} />
                                    ) : value
                                } else if (typeof value === "object" && !Array.isArray(value) && value.$$typeof) {
                                    // React element
                                    content = value
                                } else if (typeof value === "object") {
                                    content = <pre style={{ whiteSpace: "pre-wrap", fontSize: "13px", color: "var(--text-muted)" }}>{JSON.stringify(value, null, 2)}</pre>
                                }

                                return (
                                    <tr key={key} className="modal-table-row">
                                        <td className="modal-table-label">{label}</td>
                                        <td className="modal-table-value">{content}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="modal-footer">
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DetailModal

