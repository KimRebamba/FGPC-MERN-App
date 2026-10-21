import GearPreview from "../../components/GearPreview";
import {useEffect, useState} from 'react'
import AdminNavbar from "../../components/admin/Navbar";
import "../../pages/admin/index.css"
import { Link, useNavigate } from "react-router-dom";

const Gear = () => {

    const [gears, setGears] = useState(null);
    const [gear, setGear] = useState({
        name: '',
        description: '',
        price: '',
        isVisible: true,
    });

    const navigate = useNavigate();
    
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

        useEffect(() => {
    
            const getGear = async () => {
                const response = await fetch("http://localhost:8000/api/gears")
                const json = await response.json()
    
                if(response.ok){
                    console.log(json.results)
                    setGears(json.results)
                }
                else{
                    setError(json.error || 'Failed to fetch gears');
                }
            }
            
            getGear()   
        }, [])

        const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGear((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/gears', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gear),
            });

            const json = await response.json();

            if (response.ok) {
                setIsPending(false);
                navigate('/admin/gears');
            } else {
                setError(json.error || 'Failed to create gear');
                setIsPending(false);
            }
        } catch (err) {
            setError('Network error while creating gear');
            setIsPending(false);
        }
    }
    return ( 
    <div className="gear-admin">
        <AdminNavbar />
        <h1>Gear Management</h1>

        {gears && gears.map((gear) => {
            return (
                <Link to={"/admin/gears/" + gear._id}>
                    <div className="gear-preview">
                        <h2 key={gear._id}>{gear.name}</h2>           
                    </div>
                </Link>
            )
        })}

        <h1>Create New Gear</h1>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={gear.name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        name="description" 
                        value={gear.description} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="form-group">
                    <label>Price (PHP)</label>
                    <input 
                        type="number" 
                        name="price" 
                        value={gear.price} 
                        onChange={handleChange} 
                        required 
                    />
                </div>               

                {/* Visibility */}
                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox" 
                            name="isVisible" 
                            checked={gear.isVisible} 
                            onChange={handleChange} 
                        />
                        Visible in Store
                    </label>
                </div>

                <button type="submit" disabled={isPending}>
                    {isPending ? 'Adding Gear...' : 'Add Gear'}
                </button>
            </form>
        
    </div> )
}
 
export default Gear;