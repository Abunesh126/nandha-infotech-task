import requests
import asyncio
import aiohttp
from typing import Dict, List, Optional, Union
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class WeatherData:
    """Enhanced data class for weather information"""
    city: str
    country: str
    temperature: float
    feels_like: float
    humidity: int
    pressure: int
    wind_speed: float
    wind_direction: int
    visibility: float
    weather_main: str
    weather_description: str
    clouds: int
    sunrise: datetime
    sunset: datetime
    timestamp: datetime
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        # Convert datetime objects to ISO format strings
        data['sunrise'] = self.sunrise.isoformat() if self.sunrise else None
        data['sunset'] = self.sunset.isoformat() if self.sunset else None
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)

@dataclass
class ForecastData:
    """Data class for forecast information"""
    date: datetime
    temperature_max: float
    temperature_min: float
    humidity: int
    pressure: int
    weather_main: str
    weather_description: str
    wind_speed: float
    clouds: int
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        data['date'] = self.date.isoformat()
        return data

class EnhancedWeatherService:
    """Enhanced weather service with async support and comprehensive features"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENWEATHER_API_KEY', 'fa4f706105a3478dfdf1d950ee3b302b')
        self.base_url = 'https://api.openweathermap.org/data/2.5'
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def validate_api_key(self) -> bool:
        """Validate if API key is present"""
        return bool(self.api_key and len(self.api_key) >= 10)
    
    def _parse_weather_data(self, data: Dict, city: str) -> WeatherData:
        """Parse API response into WeatherData object"""
        main = data.get('main', {})
        weather = data.get('weather', [{}])[0]
        wind = data.get('wind', {})
        sys = data.get('sys', {})
        clouds = data.get('clouds', {})
        
        return WeatherData(
            city=city,
            country=sys.get('country', 'N/A'),
            temperature=main.get('temp', 0),
            feels_like=main.get('feels_like', 0),
            humidity=main.get('humidity', 0),
            pressure=main.get('pressure', 0),
            wind_speed=wind.get('speed', 0),
            wind_direction=wind.get('deg', 0),
            visibility=data.get('visibility', 0) / 1000,  # Convert to km
            weather_main=weather.get('main', 'N/A'),
            weather_description=weather.get('description', 'N/A'),
            clouds=clouds.get('all', 0),
            sunrise=datetime.fromtimestamp(sys.get('sunrise', 0)) if sys.get('sunrise') else datetime.now(),
            sunset=datetime.fromtimestamp(sys.get('sunset', 0)) if sys.get('sunset') else datetime.now(),
            timestamp=datetime.now()
        )
    
    async def get_current_weather_async(self, city: str, units: str = 'metric') -> Optional[WeatherData]:
        """
        Get current weather data asynchronously
        
        Args:
            city: City name
            units: Units (metric, imperial, kelvin)
            
        Returns:
            WeatherData object or None if failed
        """
        try:
            if not self.validate_api_key():
                raise ValueError("Invalid or missing API key")
            
            url = f"{self.base_url}/weather"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': units
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    response.raise_for_status()
                    data = await response.json()
            
            return self._parse_weather_data(data, city)
            
        except aiohttp.ClientError as e:
            logger.error(f"HTTP client error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in async weather fetch: {e}")
        
        return None
    
    def get_current_weather(self, city: str, units: str = 'metric') -> Optional[WeatherData]:
        """
        Get current weather data synchronously
        
        Args:
            city: City name
            units: Units (metric, imperial, kelvin)
            
        Returns:
            WeatherData object or None if failed
        """
        try:
            if not city or not city.strip():
                raise ValueError("City name cannot be empty")
            
            if not self.validate_api_key():
                raise ValueError("Invalid or missing API key")
            
            url = f"{self.base_url}/weather"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': units
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            if response.status_code == 404:
                logger.warning(f"City not found: {city}")
                return None
            
            data = response.json()
            return self._parse_weather_data(data, city)
            
        except requests.exceptions.Timeout:
            logger.error("Request timeout - Weather API took too long to respond")
        except requests.exceptions.ConnectionError:
            logger.error("Connection error - Unable to reach the Weather API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                logger.error(f"City not found: {city}")
            else:
                logger.error(f"HTTP error: {e}")
        except ValueError as e:
            logger.error(f"Validation error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
        
        return None
    
    def get_5_day_forecast(self, city: str, units: str = 'metric') -> List[ForecastData]:
        """
        Get 5-day weather forecast
        
        Args:
            city: City name
            units: Units (metric, imperial, kelvin)
            
        Returns:
            List of ForecastData objects
        """
        try:
            if not city or not city.strip():
                raise ValueError("City name cannot be empty")
            
            if not self.validate_api_key():
                raise ValueError("Invalid or missing API key")
            
            url = f"{self.base_url}/forecast"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': units
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            forecast_list = []
            
            # Group by date and get daily forecast
            daily_data = {}
            for item in data.get('list', []):
                date = datetime.fromtimestamp(item['dt']).date()
                if date not in daily_data:
                    daily_data[date] = []
                daily_data[date].append(item)
            
            # Process daily data
            for date, items in list(daily_data.items())[:5]:  # Limit to 5 days
                temps = [item['main']['temp'] for item in items]
                forecast_data = ForecastData(
                    date=datetime.combine(date, datetime.min.time()),
                    temperature_max=max(temps),
                    temperature_min=min(temps),
                    humidity=items[0]['main']['humidity'],
                    pressure=items[0]['main']['pressure'],
                    weather_main=items[0]['weather'][0]['main'],
                    weather_description=items[0]['weather'][0]['description'],
                    wind_speed=items[0]['wind']['speed'],
                    clouds=items[0]['clouds']['all']
                )
                forecast_list.append(forecast_data)
            
            return forecast_list
            
        except Exception as e:
            logger.error(f"Error getting forecast: {e}")
            return []
    
    def get_weather_by_coordinates(self, lat: float, lon: float, units: str = 'metric') -> Optional[WeatherData]:
        """
        Get weather data by coordinates
        
        Args:
            lat: Latitude
            lon: Longitude
            units: Units (metric, imperial, kelvin)
            
        Returns:
            WeatherData object or None if failed
        """
        try:
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                raise ValueError(f"Invalid coordinates: lat={lat}, lon={lon}")
            
            url = f"{self.base_url}/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': units
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            city_name = data.get('name', f"Location {lat}, {lon}")
            return self._parse_weather_data(data, city_name)
            
        except Exception as e:
            logger.error(f"Error getting weather by coordinates: {e}")
            return None
    
    def get_air_quality_index(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Get air quality index for coordinates
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Air quality data dictionary or None if failed
        """
        try:
            url = f"http://api.openweathermap.org/data/2.5/air_pollution"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting air quality: {e}")
            return None


# Convenience functions for backward compatibility
def fetch_weather_data(city: str, api_key: str) -> Optional[Dict]:
    """Legacy function for backward compatibility"""
    service = EnhancedWeatherService(api_key)
    weather_data = service.get_current_weather(city)
    return weather_data.to_dict() if weather_data else None

def parse_weather_data(data: Dict) -> Dict:
    """Legacy function for parsing weather data"""
    if not data:
        return {}
    
    return {
        'water_level': data.get('temperature', 'N/A'),
        'lowest_value_point': data.get('humidity', 'N/A'),
        'potential_action_point': data.get('pressure', 'N/A')
    }

def display_weather_data(city: str, weather_data: Dict):
    """Legacy function for displaying weather data"""
    if not weather_data:
        print(f"No weather data available for {city}")
        return
    
    print(f"Current Weather Data for {city}:")
    print(f"Temperature: {weather_data.get('temperature', 'N/A')}°C")
    print(f"Humidity: {weather_data.get('humidity', 'N/A')}%")
    print(f"Pressure: {weather_data.get('pressure', 'N/A')} hPa")
    print(f"Weather: {weather_data.get('weather_description', 'N/A')}")


def main():
    """Enhanced main function with comprehensive testing"""
    # Initialize the weather service
    weather_service = EnhancedWeatherService()
    
    # Test cities
    test_cities = ["London", "New York", "Tokyo", "Mumbai"]
    
    print("Enhanced Weather Service Test")
    print("=" * 50)
    
    for city in test_cities:
        print(f"\nTesting weather for {city}:")
        
        # Get current weather
        weather_data = weather_service.get_current_weather(city)
        if weather_data:
            print(f"  Temperature: {weather_data.temperature}°C")
            print(f"  Feels like: {weather_data.feels_like}°C")
            print(f"  Humidity: {weather_data.humidity}%")
            print(f"  Weather: {weather_data.weather_description}")
        else:
            print(f"  Failed to get weather data for {city}")
    
    # Test forecast for London
    print(f"\n5-Day Forecast for London:")
    forecast_data = weather_service.get_5_day_forecast("London")
    for forecast in forecast_data:
        print(f"  {forecast.date.strftime('%Y-%m-%d')}: {forecast.temperature_min}°C - {forecast.temperature_max}°C, {forecast.weather_description}")


if __name__ == "__main__":
    main()