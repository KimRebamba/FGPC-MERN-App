import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../../components/admin/Navbar';
import {useEffect, useState} from 'react'


const GearDetail = () => {

    const navigate = useNavigate();
    const { id } = useParams()

    const [gear, setGear] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState(null);

    const handleDelete = async (id) => {
        setIsDeleting(true);

        const response = await fetch(`http://localhost:8000/api/gears/${id}`, { method: 'DELETE' });
        const json = await response.json();

        if (response.ok) {
            setTimeout(() => {
                setIsDeleting(false);
                console.log('Gear deleted successfully:', json);
                navigate('/admin/gears');                
            }, 1000);
        }else{
                setError(json.error || 'Failed to delete gear');
        }
    }

    useEffect(() => {
        const getGear = async () => {
            const response = await fetch(`http://localhost:8000/api/gears/${id}`);
            const json = await response.json();
            if (response.ok) {
                setGear(json);
            }
        };
        getGear();
    }, [id]);

    return ( 
    <div className="gear-detail-admin">
        <AdminNavbar />

        <h1>Gear Details</h1>
        {gear && (
            <div className="gear-content-admin">
                {error && <div className="error">{error}</div>}

                <h2>{gear.name}</h2>
                <p>{gear.description}</p>
                <p>Price: ${gear.price}</p>
                <p>Created At: {gear.createdAt}</p>  
                <button onClick = {() => navigate("/admin/gears/edit/" + id)} className="gear-edit-button">Edit</button>
                {isDeleting && <button onClick = {() => handleDelete(gear._id)} className="gear-delete-button">Deleting...</button>}
                {!isDeleting && <button onClick = {() => handleDelete(gear._id)} className="gear-delete-button">Delete</button>}
                
            </div>
        )}
    </div> );
}
 
export default GearDetail;