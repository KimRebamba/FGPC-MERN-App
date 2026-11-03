import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div className="access-denied-page" style={{ minHeight: "80vh" }}>
            <div className="access-denied-card" style={{ maxWidth: "640px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <span className="access-denied-badge access-denied-badge--danger">
                        404 · Page Not Found
                    </span>
                </div>

                <h1 className="access-denied-title" style={{ fontSize: "36px" }}>
                    Page Not Found
                </h1>

                <p className="access-denied-text">
                    The page you are looking for does not exist, has been moved, or may have taken an unexpected turn. Check the URL or head back to the shop.
                </p>

                <div className="access-denied-actions" style={{ marginTop: "12px" }}>
                    <Link to="/" className="primary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                        Return to Store
                    </Link>
                    <Link to="/products" className="secondary-button" style={{ padding: "12px 28px", fontSize: "15px" }}>
                        Browse Gear Catalog →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default NotFound

