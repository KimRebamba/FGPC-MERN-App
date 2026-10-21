import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from "../../components/admin/Navbar"

const GearEdit = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [gear, setGear] = useState({
        name: '',
        description: '',
        price: '',
        isVisible: true,
    });

    const [originalName, setOriginalName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/gears/${id}`);
                const json = await response.json();

                if (response.ok) {
                    setGear(json);
                    setOriginalName(json.name);
                    setLoading(false);
                } else {
                    setError(json.error || 'Failed to fetch gear');
                    setLoading(false);
                }
            } catch (err) {
                setError('Network error while fetching gear');
                setLoading(false);
            }
        };

        fetchGear();
    }, [id]);

    
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

        try {

            const response = await fetch(`http://localhost:8000/api/gears/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gear),
            });

            const json = await response.json();

            if (response.ok) {
                setTimeout(() => {
                    setIsPending(false);
                    console.log('Gear updated successfully:', json);
                    navigate('/admin/gears');
                }, 1000);
            } else {
                setError(json.error || 'Failed to update gear');
            }
        } catch (err) {
            setError('Network error while updating');
        }
    };

    return (

        <div className="gear-edit">

            <AdminNavbar />
            {loading && <div>Loading gear details...</div>}
            {error && <div className="error">{error}</div>}

            <h1>Edit Gear: {originalName}</h1>

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        onChange={handleChange} 
                        value={gear.name || ''} 
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        name="description" 
                        onChange={handleChange} 
                        value={gear.description || ''} 
                    />
                </div>

                {/* Price */}
                <div className="form-group">
                    <label>Price (PHP)</label>
                    <input 
                        type="number" 
                        name="price" 
                        onChange={handleChange} 
                        value={gear.price || ''} 
                    />
                </div>

                {/* Is Visible (Checkbox) */}
                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox" 
                            name="isVisible" 
                            onChange={handleChange} 
                            checked={gear.isVisible || false} 
                        />
                        Visible in Store
                    </label>
                </div>
                {isPending && <button type="submit" disabled>Saving Changes...</button>}
                {!isPending && <button type="submit">Save Changes</button>}
            </form>
        </div>
    );
};

export default GearEdit;