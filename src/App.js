import React, { useState } from 'react';
import './App.css';
import { Analytics } from '@vercel/analytics/react';

function App() {
    const [postcode, setPostcode] = useState('');
    const [carparkResults, setCarparkResults] = useState([]); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false); // To show "No results" only after a search

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCarparkResults([]); 
        setSearchPerformed(true); // A search has been initiated

        try {
            const backendUrl = `https://sg-carpark-finder-be.onrender.com/find-carpark?postcode=${postcode}&limit=10`; // Use the default limit or adjust

            const response = await fetch(backendUrl);
            const data = await response.json(); 

            if (response.ok) {
                setCarparkResults(data); 
                if (data.length === 0) {
                    setError("No suitable carparks found for this postcode. Please try a different one.");
                }
            } else {
                setError(data.detail || 'An unknown error occurred. Please check your input.'); 
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError('Could not connect to the server or an unexpected error occurred. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Nearest Carpark Finder (SG)</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="postcode">Enter Singapore Postcode:</label>
                <input
                    type="text"
                    id="postcode"
                    placeholder="e.g., 039803"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    required
                    maxLength="6"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Find Carpark'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {loading && <p className="info-message">Loading carparks...</p>}

            {searchPerformed && !loading && carparkResults.length === 0 && !error && (
                <p className="info-message">No suitable carparks found for "{postcode}".</p>
            )}

            {carparkResults.length > 0 && (
                <div id="results">
                    <h2>Found Carpark Results</h2>
                    {carparkResults.map((carpark) => {
                        let displayLat, displayLng;

                        if (carpark.coordinates && Array.isArray(carpark.coordinates) && carpark.coordinates.length === 2) {
                            displayLat = carpark.coordinates[0];
                            displayLng = carpark.coordinates[1];
                        } else {
                            displayLat = 'N/A';
                            displayLng = 'N/A';
                        }
                        return (
                            <div key={carpark.carpark_number} className="carpark-item">
                            <div className="carpark-item-header">
                                <h3 className="carpark-item-title">{carpark.name || carpark.carpark_number}</h3> 
                            </div>
                            
                            <div className="carpark-item-details">
                                <p><strong>Code:</strong> {carpark.carpark_number}</p>
                                <p><strong>Address:</strong> {carpark.address}</p>
                                <p><strong>Type:</strong> {carpark.type}</p>
                                <p><strong>Available Lots:</strong> {carpark.available_lots}</p>
                                <p><strong>Total Lots (Static):</strong> {carpark.total_lots || carpark.total_lots_static}</p>
                        
                                
                                <p><strong>Distance:</strong> {(carpark.distance / 1000).toFixed(2)} km</p>
                            </div>

                            <div className="carpark-item-actions">
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${displayLat},${displayLng}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        </div>
                        );                        
                    })}
                </div>
            )}
            <Analytics />
        </div>
    );
}

export default App;