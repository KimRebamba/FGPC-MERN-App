import { Link } from "react-router-dom"
import { fgpcLogoSmall } from "../../assets"

const StoreFooter = () => {
    return (
        <footer className="store-footer">
            <div className="footer-grid">
                
                <div className="footer-brand">
                    <Link to="/" style={{ display: "inline-block" }}>
                        <img src={fgpcLogoSmall} alt="FGP" className="footer-logo" />
                    </Link>
                    <p className="footer-tagline">
                        FGP, abbreviation for Full Gear Pogi Club, is a motorcycle riding gear store that sells top-of-the-line motorcycle riding gear.
                        Located in the Philippines. Ride safe, mga pogi.
                    </p>
                </div>

                
                <div>
                    <p className="footer-col-title">Shop</p>
                    <div className="footer-links">
                        <Link to="/categories" className="footer-link">Categories</Link>
                        <Link to="/products" className="footer-link">All Products</Link>
                    </div>
                </div>

                
                <div>
                    <p className="footer-col-title">Account</p>
                    <div className="footer-links">
                        <Link to="/login" className="footer-link">Sign in</Link>
                        <Link to="/register" className="footer-link">Create account</Link>
                        <Link to="/activity" className="footer-link">My Activity</Link>
                        <Link to="/profile" className="footer-link">Profile</Link>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} FGP Gear. All rights reserved.</span>
            </div>
        </footer>
    )
}

export default StoreFooter

