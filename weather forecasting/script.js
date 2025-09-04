async function getWeatherForecast() {
    const city = document.getElementById('city').value;
    const apiKey = 'f01646fea37fed90cc64433c7ce54e51';
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to retrieve data: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        displayForecasts(city, groupForecastsByDate(parseForecastData(data)));
    } catch (error) {
        alert(error.message);
    }
}

function parseForecastData(data) {
    return data.list.map(forecast => ({
        dt_txt: forecast.dt_txt,
        date: forecast.dt_txt.split(' ')[0],
        temperature: forecast.main.temp,
        feels_like: forecast.main.feels_like,
        temp_min: forecast.main.temp_min,
        temp_max: forecast.main.temp_max,
        humidity: forecast.main.humidity,
        pressure: forecast.main.pressure,
        wind_speed: forecast.wind.speed,
        wind_deg: forecast.wind.deg,
        weather_description: forecast.weather[0].description,
        cloudiness: forecast.clouds.all,
        rain: forecast.rain ? forecast.rain['3h'] : 0,
        snow: forecast.snow ? forecast.snow['3h'] : 0,
        visibility: forecast.visibility || 0,
        sea_level: forecast.main.sea_level || 'N/A',
        grnd_level: forecast.main.grnd_level || 'N/A'
    }));
}

function groupForecastsByDate(forecasts) {
    return forecasts.reduce((acc, forecast) => {
        if (!acc[forecast.date]) {
            acc[forecast.date] = [];
        }
        acc[forecast.date].push(forecast);
        return acc;
    }, {});
}

function displayForecasts(city, groupedForecasts) {
    const container = document.getElementById('forecasts');
    container.innerHTML = `<h2>5-Day Weather Forecast for ${city}</h2>`;
    
    Object.keys(groupedForecasts).forEach(date => {
        container.innerHTML += `
            <div class="date-heading">${date}</div>
            <table>
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Temperature (°C)</th>
                        <th>Feels Like (°C)</th>
                        <th>Min Temp (°C)</th>
                        <th>Max Temp (°C)</th>
                        <th>Humidity (%)</th>
                        <th>Pressure (hPa)</th>
                        <th>Wind (m/s)</th>
                        <th>Description</th>
                        <th>Cloudiness (%)</th>
                        <th>Rain (mm)</th>
                        <th>Snow (mm)</th>
                        <th>Visibility (m)</th>
                        <th>Sea Level (hPa)</th>
                        <th>Ground Level (hPa)</th>
                    </tr>
                </thead>
                <tbody>
                    ${groupedForecasts[date].map(forecast => `
                        <tr>
                            <td>${forecast.dt_txt}</td>
                            <td>${forecast.temperature}</td>
                            <td>${forecast.feels_like}</td>
                            <td>${forecast.temp_min}</td>
                            <td>${forecast.temp_max}</td>
                            <td>${forecast.humidity}</td>
                            <td>${forecast.pressure}</td>
                            <td>${forecast.wind_speed} at ${forecast.wind_deg}°</td>
                            <td>${forecast.weather_description}</td>
                            <td>${forecast.cloudiness}</td>
                            <td>${forecast.rain}</td>
                            <td>${forecast.snow}</td>
                            <td>${forecast.visibility}</td>
                            <td>${forecast.sea_level}</td>
                            <td>${forecast.grnd_level}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    });
}
