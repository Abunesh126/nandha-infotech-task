// Enhanced Air Quality Monitor JavaScript
class AirQualityMonitor {
    constructor() {
        // Updated to use working OpenWeatherMap API instead of broken Weatherbit
        this.openWeatherApiKey = 'fa4f706105a3478dfdf1d950ee3b302b'; // Working key
        this.opencageApiKey = 'cafbcfbe477144c0b347d595e44bf6a5'; // Will implement Nominatim fallback
        this.currentData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLocationSupport();
    }

    setupEventListeners() {
        const fetchBtn = document.getElementById('fetch-data');
        const locationBtn = document.getElementById('get-current-location');
        const refreshBtn = document.getElementById('refresh-data');
        const exportBtn = document.getElementById('export-data');
        const shareBtn = document.getElementById('share-data');
        const locationInput = document.getElementById('location');

        fetchBtn.addEventListener('click', () => this.fetchDataByLocation());
        locationBtn.addEventListener('click', () => this.getCurrentLocation());
        refreshBtn.addEventListener('click', () => this.refreshCurrentData());
        exportBtn.addEventListener('click', () => this.exportData());
        shareBtn.addEventListener('click', () => this.shareData());

        // Enter key support for location input
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchDataByLocation();
            }
        });

        // Auto-complete suggestions (basic implementation)
        locationInput.addEventListener('input', () => this.handleLocationInput());
    }

    checkLocationSupport() {
        const locationBtn = document.getElementById('get-current-location');
        if (!navigator.geolocation) {
            locationBtn.style.display = 'none';
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('air-quality-display').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        document.getElementById('air-quality-display').classList.add('hidden');
    }

    showResults() {
        this.hideLoading();
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('air-quality-display').classList.remove('hidden');
    }

    async fetchDataByLocation() {
        const location = document.getElementById('location').value.trim();

        if (!location) {
            this.showError('Please enter a location');
            return;
        }

        this.showLoading();

        try {
            // Get coordinates from location name
            const geolocationData = await this.getCoordinates(location);

            if (!geolocationData || geolocationData.results.length === 0) {
                throw new Error('Location not found. Please check the spelling and try again.');
            }

            const geometry = geolocationData.results[0].geometry;
            const latitude = geometry.lat;
            const longitude = geometry.lng;

            // Get air quality data
            await this.fetchAirQualityData(latitude, longitude, location);

        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError(`Error: ${error.message}`);
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    // Get location name from coordinates
                    const locationName = await this.getLocationName(latitude, longitude);
                    await this.fetchAirQualityData(latitude, longitude, locationName);
                } catch (error) {
                    console.error('Error with current location:', error);
                    this.showError(`Error getting location data: ${error.message}`);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError(`Location access denied: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    async getCoordinates(location) {
        // Try OpenCage first, fallback to Nominatim
        try {
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${this.opencageApiKey}&limit=1`;
            const response = await fetch(url);

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401 || response.status === 403) {
                console.warn('OpenCage API issue, using Nominatim fallback');
                return await this.getCoordinatesNominatim(location);
            }
        } catch (error) {
            console.warn('OpenCage error, using Nominatim fallback:', error);
            return await this.getCoordinatesNominatim(location);
        }
    }

    async getCoordinatesNominatim(location) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'AirQualityMonitor/1.0 (Educational Purpose)'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim geocoding failed: ${response.status}`);
        }

        const data = await response.json();

        // Convert Nominatim format to OpenCage-like format
        if (data && data.length > 0) {
            const result = data[0];
            return {
                results: [{
                    formatted: result.display_name,
                    geometry: {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    }
                }]
            };
        }

        return { results: [] };
    }

    async getLocationName(lat, lng) {
        // Try OpenCage first, fallback to Nominatim
        try {
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${this.opencageApiKey}&limit=1`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                return data.results[0]?.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            } else if (response.status === 401 || response.status === 403) {
                console.warn('OpenCage API issue, using Nominatim fallback');
                return await this.getLocationNameNominatim(lat, lng);
            }
        } catch (error) {
            console.warn('OpenCage error, using Nominatim fallback:', error);
            return await this.getLocationNameNominatim(lat, lng);
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    async getLocationNameNominatim(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'AirQualityMonitor/1.0 (Educational Purpose)'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
        } catch (error) {
            console.warn('Nominatim reverse geocoding error:', error);
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    async fetchAirQualityData(latitude, longitude, locationName) {
        try {
            // Use OpenWeatherMap Air Pollution API (working key)
            const openWeatherData = await this.getOpenWeatherAirQuality(latitude, longitude);

            if (openWeatherData) {
                this.displayAirQualityData(openWeatherData, latitude, longitude, locationName);
                return;
            }

            // If OpenWeatherMap fails, show error (Weatherbit key is broken)
            this.showError('Air quality data unavailable. Please try again later.');

        } catch (error) {
            console.error('Air quality fetch error:', error);
            this.showError('Failed to fetch air quality data. Please check your internet connection.');
        }
    }

    async getOpenWeatherAirQuality(lat, lon) {
        try {
            // Using working OpenWeatherMap API key
            const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}`;

            const response = await fetch(url);
            if (!response.ok) return null;

            const data = await response.json();

            // Convert OpenWeatherMap format to our expected format
            const pollution = data.list[0];
            return {
                data: [{
                    aqi: pollution.main.aqi * 50, // Convert to US AQI scale
                    pm10: pollution.components.pm10,
                    pm25: pollution.components.pm2_5,
                    o3: pollution.components.o3,
                    no2: pollution.components.no2,
                    so2: pollution.components.so2,
                    co: pollution.components.co / 1000 // Convert to mg/m³
                }]
            };
        } catch (error) {
            console.error('OpenWeatherMap API error:', error);
            return null;
        }
    }

    displayAirQualityData(airQualityData, latitude, longitude, locationName) {
        try {
            const airQuality = airQualityData.data[0];

            // Store current data
            this.currentData = {
                location: locationName,
                latitude,
                longitude,
                ...airQuality,
                timestamp: new Date().toISOString()
            };

            // Update location information
            this.updateLocationInfo(locationName, latitude, longitude);

            // Update AQI
            this.updateAQI(airQuality.aqi);

            // Update pollutants
            this.updatePollutants(airQuality);

            // Update recommendations
            this.updateRecommendations(airQuality.aqi);

            this.showResults();

        } catch (error) {
            console.error('Error displaying data:', error);
            this.showError('Error processing air quality data');
        }
    }

    updateLocationInfo(location, latitude, longitude) {
        document.getElementById('location-display').textContent = location;
        document.getElementById('latitude').textContent = latitude.toFixed(4);
        document.getElementById('longitude').textContent = longitude.toFixed(4);
        document.getElementById('last-updated').textContent = new Date().toLocaleString();
    }

    updateAQI(aqi) {
        const aqiElement = document.getElementById('aqi');
        const categoryElement = document.getElementById('aqi-category');
        const descriptionElement = document.getElementById('aqi-description');

        aqiElement.textContent = Math.round(aqi) || 'N/A';

        const aqiInfo = this.getAQIInfo(aqi);
        categoryElement.textContent = aqiInfo.category;
        descriptionElement.textContent = aqiInfo.description;

        // Update AQI card styling
        const aqiCard = document.querySelector('.aqi-card');
        aqiCard.className = `aqi-card ${aqiInfo.className}`;
    }

    updatePollutants(airQuality) {
        const pollutants = [
            { id: 'pm10', value: airQuality.pm10, thresholds: [50, 100, 150, 200] },
            { id: 'pm25', value: airQuality.pm25, thresholds: [35, 75, 115, 150] },
            { id: 'o3', value: airQuality.o3, thresholds: [100, 160, 200, 300] },
            { id: 'no2', value: airQuality.no2, thresholds: [100, 200, 700, 1200] },
            { id: 'so2', value: airQuality.so2, thresholds: [80, 180, 280, 400] },
            { id: 'co', value: airQuality.co, thresholds: [10, 20, 30, 40] }
        ];

        pollutants.forEach(pollutant => {
            const valueElement = document.getElementById(pollutant.id);
            const statusElement = document.getElementById(`${pollutant.id}-status`);

            const value = pollutant.value || 0;
            valueElement.textContent = value.toFixed(1);

            // Determine status based on thresholds
            const status = this.getPollutantStatus(value, pollutant.thresholds);
            statusElement.textContent = status.text;
            statusElement.className = `status-indicator ${status.className}`;
        });
    }

    getPollutantStatus(value, thresholds) {
        if (value <= thresholds[0]) return { text: 'Good', className: 'good' };
        if (value <= thresholds[1]) return { text: 'Moderate', className: 'moderate' };
        if (value <= thresholds[2]) return { text: 'Unhealthy for Sensitive', className: 'unhealthy-sensitive' };
        if (value <= thresholds[3]) return { text: 'Unhealthy', className: 'unhealthy' };
        return { text: 'Very Unhealthy', className: 'very-unhealthy' };
    }

    getAQIInfo(aqi) {
        if (aqi <= 50) {
            return {
                category: 'Good',
                description: 'Air quality is satisfactory and poses little or no health risk.',
                className: 'good'
            };
        } else if (aqi <= 100) {
            return {
                category: 'Moderate',
                description: 'Air quality is acceptable for most people.',
                className: 'moderate'
            };
        } else if (aqi <= 150) {
            return {
                category: 'Unhealthy for Sensitive Groups',
                description: 'Sensitive individuals may experience health effects.',
                className: 'unhealthy-sensitive'
            };
        } else if (aqi <= 200) {
            return {
                category: 'Unhealthy',
                description: 'Everyone may experience health effects.',
                className: 'unhealthy'
            };
        } else if (aqi <= 300) {
            return {
                category: 'Very Unhealthy',
                description: 'Health warnings of emergency conditions.',
                className: 'very-unhealthy'
            };
        } else {
            return {
                category: 'Hazardous',
                description: 'Emergency conditions affecting everyone.',
                className: 'hazardous'
            };
        }
    }

    updateRecommendations(aqi) {
        const recommendationsElement = document.getElementById('recommendations');
        let recommendations = [];

        if (aqi <= 50) {
            recommendations = [
                'Air quality is excellent. Perfect for outdoor activities.',
                'No health precautions needed.',
                'Great time for exercise and outdoor sports.'
            ];
        } else if (aqi <= 100) {
            recommendations = [
                'Air quality is acceptable for most people.',
                'Sensitive individuals should consider reducing prolonged outdoor exertion.',
                'Generally safe for outdoor activities.'
            ];
        } else if (aqi <= 150) {
            recommendations = [
                'Sensitive groups should avoid outdoor activities.',
                'Children, elderly, and people with respiratory conditions should limit outdoor exposure.',
                'Consider wearing a mask if you must go outside.'
            ];
        } else if (aqi <= 200) {
            recommendations = [
                'Everyone should avoid prolonged outdoor activities.',
                'Keep windows closed and use air purifiers indoors.',
                'Wear N95 masks when outdoors.',
                'Postpone outdoor exercise.'
            ];
        } else {
            recommendations = [
                'Stay indoors and keep windows closed.',
                'Use air purifiers if available.',
                'Avoid all outdoor activities.',
                'Seek immediate medical attention if experiencing difficulty breathing.',
                'Consider relocating temporarily if possible.'
            ];
        }

        recommendationsElement.innerHTML = recommendations
            .map(rec => `<div class="recommendation-item"><i class="fas fa-check-circle"></i> ${rec}</div>`)
            .join('');
    }

    async refreshCurrentData() {
        if (!this.currentData) {
            this.showError('No data to refresh. Please search for a location first.');
            return;
        }

        const { latitude, longitude, location } = this.currentData;
        await this.fetchAirQualityData(latitude, longitude, location);
    }

    exportData() {
        if (!this.currentData) {
            this.showError('No data to export. Please search for a location first.');
            return;
        }

        const dataToExport = {
            ...this.currentData,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `air-quality-${this.currentData.location}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    async shareData() {
        if (!this.currentData) {
            this.showError('No data to share. Please search for a location first.');
            return;
        }

        const shareText = `Air Quality in ${this.currentData.location}: AQI ${Math.round(this.currentData.aqi)} - ${this.getAQIInfo(this.currentData.aqi).category}`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Air Quality Data',
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                console.error('Error sharing:', error);
                this.fallbackShare(shareText);
            }
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Fallback sharing method
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Air quality data copied to clipboard!');
            });
        } else {
            // Very basic fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Air quality data copied to clipboard!');
        }
    }

    handleLocationInput() {
        const input = document.getElementById('location');
        const value = input.value.trim();

        // Basic validation and auto-complete could be implemented here
        if (value.length > 2) {
            // Could implement location suggestions
        }
    }
}

// Initialize the Air Quality Monitor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AirQualityMonitor();
});
