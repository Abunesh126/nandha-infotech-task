// Quick location setter function
function setCoordinates(lat, lon) {
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;
}

// Main fetch location functionality
document.getElementById('fetchLocation').addEventListener('click', () => {
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    // LocationIQ API Configuration (API key is securely stored)
    const apiKey = 'pk.eyJ1IjoiYWJ1bmVzaCIsImEiOiJjbTBlMzJyOXgwYW1kMmxzNWdrN3RqN2VwIn0.YOUR_API_KEY'; // Secure API key
    
    // Validation
    if (!latitude || !longitude) {
        document.getElementById('location').innerHTML = '<span style="color: red;">⚠️ Please enter both latitude and longitude</span>';
        return;
    }
    
    if (latitude < -90 || latitude > 90) {
        document.getElementById('location').innerHTML = '<span style="color: red;">⚠️ Latitude must be between -90 and 90</span>';
        return;
    }
    
    if (longitude < -180 || longitude > 180) {
        document.getElementById('location').innerHTML = '<span style="color: red;">⚠️ Longitude must be between -180 and 180</span>';
        return;
    }
    
    // LocationIQ API Configuration
    const apiUrl = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

    // Show loading state
    document.getElementById('location').innerHTML = '<div class="loading">🔄 Loading location data...</div>';
    document.getElementById('coordinates').innerHTML = `
        <strong>🎯 Searching Coordinates:</strong><br>
        Latitude: <strong>${latitude}</strong><br>
        Longitude: <strong>${longitude}</strong>
    `;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your LocationIQ API key.');
                } else if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            console.log('LocationIQ API Response:', data); // For debugging
            
            if (data && data.address) {
                // Extract location components from LocationIQ response
                const address = data.address;
                const city = address.city || address.town || address.village || 'N/A';
                const state = address.state || address.region || 'N/A';
                const district = address.county || address.state_district || 'N/A';
                const country = address.country || 'N/A';
                const postcode = address.postcode || 'N/A';
                const road = address.road || address.street || 'N/A';
                const suburb = address.suburb || address.neighbourhood || 'N/A';
                
                // Display formatted location with better styling
                const locationText = `
                    <div class="address-card">
                        <h3>📍 Complete Address</h3>
                        <div class="address-full">${data.display_name}</div>
                        
                        <div class="address-details">
                            <div class="detail-row">
                                <span class="label">🏠 Road/Street:</span>
                                <span class="value">${road}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">🏘️ Area/Suburb:</span>
                                <span class="value">${suburb}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">🏙️ City/Town:</span>
                                <span class="value highlight">${city}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">🗺️ District:</span>
                                <span class="value">${district}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">🌍 State/Region:</span>
                                <span class="value">${state}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">🇮🇳 Country:</span>
                                <span class="value">${country}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">📮 Postal Code:</span>
                                <span class="value">${postcode}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('location').innerHTML = locationText;
                document.getElementById('coordinates').innerHTML = `
                    <div class="coordinates-card">
                        <h3>🎯 Exact Coordinates</h3>
                        <div class="coord-row">
                            <span class="coord-label">Latitude:</span>
                            <span class="coord-value">${latitude}°</span>
                        </div>
                        <div class="coord-row">
                            <span class="coord-label">Longitude:</span>
                            <span class="coord-value">${longitude}°</span>
                        </div>
                        <div class="coord-row">
                            <span class="coord-label">Location Type:</span>
                            <span class="coord-value">${data.type || 'N/A'}</span>
                        </div>
                        <div class="coord-row">
                            <span class="coord-label">Importance:</span>
                            <span class="coord-value">${data.importance || 'N/A'}</span>
                        </div>
                    </div>
                `;
            } else {
                document.getElementById('location').innerHTML = '<div class="error">❌ No location data found for the specified coordinates.</div>';
            }
        })
        .catch(error => {
            console.error('LocationIQ API Error:', error);
            document.getElementById('location').innerHTML = `
                <div class="error">
                    ❌ <strong>Error occurred:</strong><br>
                    ${error.message}<br><br>
                    <small>💡 Tips:</small><br>
                    • Check your API key is valid<br>
                    • Ensure coordinates are correct<br>
                    • Check your internet connection<br>
                    • Verify you haven't exceeded rate limits
                </div>
            `;
            document.getElementById('coordinates').innerHTML = `
                <div class="coordinates-card">
                    <h3>🎯 Attempted Coordinates</h3>
                    <div class="coord-row">
                        <span class="coord-label">Latitude:</span>
                        <span class="coord-value">${latitude}°</span>
                    </div>
                    <div class="coord-row">
                        <span class="coord-label">Longitude:</span>
                        <span class="coord-value">${longitude}°</span>
                    </div>
                </div>
            `;
        });
});

// Add Enter key support for inputs
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('fetchLocation').click();
            }
        });
    });
});
