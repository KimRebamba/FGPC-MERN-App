import { Link } from 'react-router-dom'

const NavBar = () => {
    return ( 
    <header>
        <div className="navbar">
            <Link to="/"><h1>Full Gear Pogi Club</h1></Link>
        </div> 
    </header>);
}
 
export default NavBar;