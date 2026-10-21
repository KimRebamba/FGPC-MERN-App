import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import GearPreview from "../components/GearPreview"
import CustomerNavBar from '../components/Navbar'

const Home = () => {

    const [gears, setGears] = useState(null)

    useEffect(() => {

        const getGear = async () => {
            const response = await fetch("http://localhost:8000/api/gears")
            const json = await response.json()

            if(response.ok){
                console.log(json.results)
                setGears(json.results)
            }
            
        }
        
        getGear()   
    }, [])

    return ( 
    <div className="home-page">
        <CustomerNavBar />

        <div className="gears-list">
            {gears && gears.map((gear) => {
                return (
                    <Link to={"/gears/" + gear._id}>
                        <GearPreview key={gear._id} gear={gear}/>
                    </Link>
                )
                
            })}
        </div>
    </div> 
    );
}
 
export default Home; 