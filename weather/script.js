async function getWeatherData() {
    const city = document.getElementById('city').value;
    const apiKey = 'f01646fea37fed90cc64433c7ce54e51'; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found');
            } else {
                throw new Error('Failed to fetch weather data');
            }
        }
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        document.getElementById('weatherData').innerText = error.message;
        console.error('Error:', error);
    }
}

function displayWeatherData(data) {
    const weatherDataDiv = document.getElementById('weatherData');
    weatherDataDiv.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}
