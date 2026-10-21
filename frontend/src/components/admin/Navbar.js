import { Link } from "react-router-dom";
import "../../pages/admin/index.css"

const Navbar = () => {
    return ( 
        <div className="navbar-admin">
            <Link to="/admin"><h1>Full Gear Pogi Club - Admin</h1></Link>
            <Link to="/admin/gears">Gears</Link>
        </div>
     );
}
 
export default Navbar;