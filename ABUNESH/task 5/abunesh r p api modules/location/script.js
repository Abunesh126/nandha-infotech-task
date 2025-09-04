document.getElementById('fetchLocation').addEventListener('click', () => {
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const apiKey = 'e2077ef4c9ee401ebaf345be209f68c0';

    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const components = data.results[0].components;
                const state = components.state || 'N/A';
                const district = components.state_district || 'N/A';
                const taluk = components.suburb || 'N/A';

                document.getElementById('location').innerHTML = `Location: <strong><u>${taluk}</u></strong>, ${district}, ${state}`;
                document.getElementById('coordinates').innerHTML = `Latitude: <strong><u>${latitude}</u></strong>, Longitude: <strong><u>${longitude}</u></strong>`;
            } else {
                document.getElementById('location').textContent = 'Error: No results found for the specified coordinates.';
                document.getElementById('coordinates').textContent = '';
            }
        })
        .catch(error => {
            document.getElementById('location').textContent = `Error: Unable to fetch reverse geocoding data (${error.message})`;
            document.getElementById('coordinates').textContent = '';
        });
});
