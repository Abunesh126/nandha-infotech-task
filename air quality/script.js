document.getElementById('fetch-data').addEventListener('click', () => {
    const weatherbitApiKey = '64efca388d274fad847198f295f68b0c';
    const opencageApiKey = 'cafbcfbe477144c0b347d595e44bf6a5';
    const location = document.getElementById('location').value;

    // Fetch geolocation based on the input location
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${opencageApiKey}`)
        .then(response => response.json())
        .then(geolocationData => {
            if (geolocationData.results.length > 0) {
                const geometry = geolocationData.results[0].geometry;
                const latitude = geometry.lat;
                const longitude = geometry.lng;

                // Weatherbit API URL
                const weatherbitUrl = `https://api.weatherbit.io/v2.0/current/airquality?lat=${latitude}&lon=${longitude}&key=${weatherbitApiKey}`;

                // Make a request to the Weatherbit API
                return fetch(weatherbitUrl)
                    .then(response => response.json())
                    .then(airQualityData => {
                        // Update air quality information
                        const airQuality = airQualityData.data[0];
                        const aqi = airQuality.aqi || 'N/A';
                        const pm10 = airQuality.pm10 || 'N/A';
                        const pm25 = airQuality.pm25 || 'N/A';
                        const o3 = airQuality.o3 || 'N/A';
                        const no2 = airQuality.no2 || 'N/A';
                        const so2 = airQuality.so2 || 'N/A';
                        const co = airQuality.co || 'N/A';

                        // Update the DOM with air quality information
                        document.getElementById('location-display').textContent = location;
                        document.getElementById('latitude').textContent = latitude;
                        document.getElementById('longitude').textContent = longitude;
                        document.getElementById('aqi').textContent = aqi;
                        document.getElementById('pm10').textContent = pm10;
                        document.getElementById('pm25').textContent = pm25;
                        document.getElementById('o3').textContent = o3;
                        document.getElementById('no2').textContent = no2;
                        document.getElementById('so2').textContent = so2;
                        document.getElementById('co').textContent = co;
                    });
            } else {
                console.error('Error: No results found for the specified location.');
            }
        })
        .catch(error => console.error('Error:', error));
});
