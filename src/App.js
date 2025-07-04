import React, { useState, useEffect } from 'react';
import './App.css';
import { Analytics } from '@vercel/analytics/react';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [carparkResults, setCarparkResults] = useState([]); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false); // To show "No results" only after a search

    const [showUpdateBanner, setShowUpdateBanner] = useState(false);

    // --- useEffect to manage banner visibility ---
    useEffect(() => {
        // Check localStorage to see if the banner has been dismissed
        const hasDismissedBanner = localStorage.getItem('sg_carpark_finder_update_banner_dismissed');
        // You can also use a version number to show it again for a new update
        const currentAppVersion = 'v1.1'; // Example version for this update
        const lastShownVersion = localStorage.getItem('sg_carpark_finder_last_shown_version');

        if (hasDismissedBanner !== 'true' || lastShownVersion !== currentAppVersion) {
            setShowUpdateBanner(true);
            localStorage.setItem('sg_carpark_finder_last_shown_version', currentAppVersion);
        }
    }, []); // Empty dependency array ensures this runs once after initial render

    const handleDismissBanner = () => {
        setShowUpdateBanner(false);
        localStorage.setItem('sg_carpark_finder_update_banner_dismissed', 'true');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCarparkResults([]); 
        setSearchPerformed(true); // A search has been initiated

        try {
            const backendUrl = `https://sg-carpark-finder-be.onrender.com/find-carpark?search_query=${searchQuery}&limit=10`; // Use the default limit or adjust

            // const backendUrl = `http://127.0.0.1:5000/find-carpark?search_query=${searchQuery}&limit=10`;

            const response = await fetch(backendUrl);
            const data = await response.json(); 

            if (response.ok) {
                setCarparkResults(data); 
                if (data.length === 0) {
                    setError("No suitable carparks found for this location. Please try a different one.");
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
            {/* --- New Update Banner --- */}
            {showUpdateBanner && (
                <div className="update-banner">
                    <p>
                        🚨 New Feature: You can now search by Building Name or Address. 
                        <br/>
                        ✨ Try: "Ion Orchard"!
                        <br/>
                        🚧 Coming Soon: Estimated parking costs!
                    </p>
                    <button onClick={handleDismissBanner}>&times;</button> {/* Dismiss button */}
                </div>
            )}
            {/* --- End Update Banner --- */}
            <h1>Nearest Carpark Finder (SG)</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="location">Enter Singapore Location:</label>
                <input
                    type="text"
                    id="location"
                    placeholder="e.g., 039803 or Ion Orchard"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Find Carpark'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {loading && <p className="info-message">Loading carparks...</p>}

            {searchPerformed && !loading && carparkResults.length === 0 && !error && (
                <p className="info-message">No suitable carparks found for "{searchQuery}".</p>
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
                                <h3 className="carpark-item-title">{carpark.address || carpark.carpark_number}</h3> 
                                <p className="distance-display">{(carpark.distance / 1000).toFixed(2)} km</p>
                            </div>
                            
                            <div className="carpark-item-details">
                                <p><strong>Code:</strong> {carpark.carpark_number}</p>
                                <p><strong>Address:</strong> {carpark.address}</p>
                                <p><strong>Type:</strong> {carpark.type}</p>
                                <p><strong>Available Lots:</strong> {carpark.available_lots}</p>
                                <p><strong>Total Lots:</strong> {carpark.total_lots || carpark.total_lots_static}</p>
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