const StoreFooter = () => {
    return (
        <footer className="store-footer">
            <div className="footer-grid">
                {/* Brand */}
                <div className="footer-brand">
                    <img src="/fgpc-logo-small.png" alt="FGP" className="footer-logo" />
                    <p className="footer-tagline">
                        FGP, abbreviation for Full Gear Pogi Club, is a motorcycle riding gear store that sells top-of-the-line motorcycle riding gear.
                        Located in the Philippines. Ride safe, mga pogi.
                    </p>
                </div>

                {/* Shop links */}
                <div>
                    <p className="footer-col-title">Shop</p>
                    <div className="footer-links">
                        <a href="/categories" className="footer-link">Categories</a>
                        <a href="/products" className="footer-link">All Products</a>
                    </div>
                </div>

                {/* Account links */}
                <div>
                    <p className="footer-col-title">Account</p>
                    <div className="footer-links">
                        <a href="/login" className="footer-link">Sign in</a>
                        <a href="/register" className="footer-link">Create account</a>
                        <a href="/activity" className="footer-link">My Activity</a>
                        <a href="/profile" className="footer-link">Profile</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} FGP Gear. All rights reserved.</span>
                <span>Premium · Utilitarian · Made to last</span>
            </div>
        </footer>
    )
}

export default StoreFooter

