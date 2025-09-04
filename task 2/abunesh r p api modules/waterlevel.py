import requests
import asyncio
import aiohttp
from typing import Dict, List, Optional, Union
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import os
import statistics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class WaterLevelData:
    """Enhanced data class for water level information"""
    location: str
    water_level: float  # Using temperature as proxy for water level
    humidity: int  # Humidity percentage
    pressure: float  # Atmospheric pressure
    visibility: float  # Visibility in km
    timestamp: datetime
    lowest_value_point: float
    potential_action_point: float
    alert_status: str
    recommendations: List[str]
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)

@dataclass
class WaterAlert:
    """Data class for water level alerts"""
    level: str  # LOW, NORMAL, HIGH, CRITICAL
    message: str
    actions: List[str]
    timestamp: datetime

class EnhancedWaterLevelService:
    """Enhanced water level monitoring service"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENWEATHER_API_KEY', 'f01646fea37fed90cc64433c7ce54e51')
        self.base_url = 'http://api.openweathermap.org/data/2.5/weather'
        
        # Water level thresholds (using temperature as proxy)
        self.thresholds = {
            'critical_low': 5.0,   # Below 5°C
            'low': 15.0,           # Below 15°C
            'normal_min': 15.0,    # 15°C - 25°C
            'normal_max': 25.0,
            'high': 30.0,          # Above 30°C
            'critical_high': 35.0  # Above 35°C
        }
    
    def validate_api_key(self) -> bool:
        """Validate if API key is present"""
        return bool(self.api_key and len(self.api_key) >= 10)
    
    def _analyze_water_level(self, water_level: float, humidity: int, pressure: float) -> WaterAlert:
        """
        Analyze water level and generate alerts
        
        Args:
            water_level: Water level value (temperature proxy)
            humidity: Humidity percentage
            pressure: Atmospheric pressure
            
        Returns:
            WaterAlert object with alert information
        """
        actions = []
        
        if water_level <= self.thresholds['critical_low']:
            level = "CRITICAL_LOW"
            message = f"Critical low water level detected: {water_level}°C"
            actions = [
                "Immediate action required",
                "Check water sources",
                "Implement emergency water conservation",
                "Monitor continuously"
            ]
        elif water_level <= self.thresholds['low']:
            level = "LOW"
            message = f"Low water level detected: {water_level}°C"
            actions = [
                "Increase monitoring frequency",
                "Prepare water conservation measures",
                "Check irrigation systems"
            ]
        elif water_level >= self.thresholds['critical_high']:
            level = "CRITICAL_HIGH"
            message = f"Critical high water level detected: {water_level}°C"
            actions = [
                "Flood risk assessment required",
                "Prepare drainage systems",
                "Issue safety warnings",
                "Monitor weather patterns"
            ]
        elif water_level >= self.thresholds['high']:
            level = "HIGH"
            message = f"High water level detected: {water_level}°C"
            actions = [
                "Monitor for potential flooding",
                "Check drainage capacity",
                "Prepare preventive measures"
            ]
        else:
            level = "NORMAL"
            message = f"Water level is normal: {water_level}°C"
            actions = ["Continue regular monitoring"]
        
        # Additional checks based on humidity and pressure
        if humidity > 85:
            actions.append("High humidity detected - monitor for excess moisture")
        elif humidity < 30:
            actions.append("Low humidity detected - potential dry conditions")
        
        if pressure < 1000:
            actions.append("Low pressure system - potential storm activity")
        
        return WaterAlert(
            level=level,
            message=message,
            actions=actions,
            timestamp=datetime.now()
        )
    
    def _calculate_action_points(self, water_level: float, humidity: int, pressure: float) -> tuple:
        """Calculate lowest value point and potential action point"""
        # Lowest value point calculation
        lvp = min(water_level * 0.8, humidity * 0.6, pressure * 0.001)
        
        # Potential action point calculation
        if water_level <= self.thresholds['low'] or water_level >= self.thresholds['high']:
            pap = water_level * 1.2  # Immediate action needed
        else:
            pap = water_level * 1.1  # Normal monitoring
        
        return lvp, pap
    
    async def fetch_water_data_async(self, location: str) -> Optional[WaterLevelData]:
        """
        Fetch water level data asynchronously
        
        Args:
            location: Location name or city
            
        Returns:
            WaterLevelData object or None if failed
        """
        try:
            if not location or not location.strip():
                raise ValueError("Location cannot be empty")
            
            if not self.validate_api_key():
                raise ValueError("Invalid or missing API key")
            
            url = f"{self.base_url}?q={location}&appid={self.api_key}&units=metric"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    response.raise_for_status()
                    data = await response.json()
            
            return self._parse_weather_to_water_data(data, location)
            
        except aiohttp.ClientError as e:
            logger.error(f"HTTP client error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in async water data fetch: {e}")
        
        return None
    
    def fetch_water_data(self, location: str) -> Optional[WaterLevelData]:
        """
        Fetch water level data synchronously
        
        Args:
            location: Location name or city
            
        Returns:
            WaterLevelData object or None if failed
        """
        try:
            if not location or not location.strip():
                raise ValueError("Location cannot be empty")
            
            if not self.validate_api_key():
                raise ValueError("Invalid or missing API key")
            
            url = f"{self.base_url}?q={location}&appid={self.api_key}&units=metric"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 404:
                logger.error(f"Location not found: {location}")
                return None
            
            response.raise_for_status()
            data = response.json()
            
            return self._parse_weather_to_water_data(data, location)
            
        except requests.exceptions.Timeout:
            logger.error("Request timeout - API took too long to respond")
        except requests.exceptions.ConnectionError:
            logger.error("Connection error - Unable to reach the API")
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error: {e}")
        except ValueError as e:
            logger.error(f"Validation error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
        
        return None
    
    def _parse_weather_to_water_data(self, data: Dict, location: str) -> WaterLevelData:
        """Parse weather API response to water level data"""
        main_data = data.get('main', {})
        
        water_level = main_data.get('temp', 0)  # Temperature as water level proxy
        humidity = main_data.get('humidity', 0)
        pressure = main_data.get('pressure', 0)
        visibility = data.get('visibility', 0) / 1000 if data.get('visibility') else 0  # Convert to km
        
        # Calculate action points
        lvp, pap = self._calculate_action_points(water_level, humidity, pressure)
        
        # Analyze water level for alerts
        alert = self._analyze_water_level(water_level, humidity, pressure)
        
        return WaterLevelData(
            location=location,
            water_level=water_level,
            humidity=humidity,
            pressure=pressure,
            visibility=visibility,
            timestamp=datetime.now(),
            lowest_value_point=lvp,
            potential_action_point=pap,
            alert_status=alert.level,
            recommendations=alert.actions
        )
    
    def get_historical_trend(self, location: str, days: int = 7) -> Dict:
        """
        Simulate historical trend data (in real implementation, this would query historical API)
        
        Args:
            location: Location name
            days: Number of days for historical data
            
        Returns:
            Dictionary with trend analysis
        """
        try:
            current_data = self.fetch_water_data(location)
            if not current_data:
                return {"error": "Unable to fetch current data"}
            
            # Simulate historical data (in real scenario, use historical weather API)
            historical_levels = []
            base_level = current_data.water_level
            
            for i in range(days):
                # Add some variation to simulate historical data
                variation = (i - days/2) * 0.5 + ((-1) ** i) * 2
                historical_levels.append(base_level + variation)
            
            # Calculate trend metrics
            trend_analysis = {
                "location": location,
                "current_level": current_data.water_level,
                "historical_data": historical_levels,
                "average": statistics.mean(historical_levels),
                "trend": "increasing" if historical_levels[-1] > historical_levels[0] else "decreasing",
                "volatility": statistics.stdev(historical_levels) if len(historical_levels) > 1 else 0,
                "max_level": max(historical_levels),
                "min_level": min(historical_levels),
                "days_analyzed": days,
                "timestamp": datetime.now().isoformat()
            }
            
            return trend_analysis
            
        except Exception as e:
            logger.error(f"Error getting historical trend: {e}")
            return {"error": f"Failed to analyze trend: {str(e)}"}
    
    def monitor_multiple_locations(self, locations: List[str]) -> List[Optional[WaterLevelData]]:
        """
        Monitor water levels for multiple locations
        
        Args:
            locations: List of location names
            
        Returns:
            List of WaterLevelData objects
        """
        results = []
        for location in locations:
            try:
                data = self.fetch_water_data(location)
                results.append(data)
            except Exception as e:
                logger.error(f"Error monitoring {location}: {e}")
                results.append(None)
        
        return results
    
    def generate_daily_report(self, location: str) -> Dict:
        """
        Generate a comprehensive daily report
        
        Args:
            location: Location name
            
        Returns:
            Daily report dictionary
        """
        try:
            current_data = self.fetch_water_data(location)
            if not current_data:
                return {"error": "Unable to fetch data for report"}
            
            trend_data = self.get_historical_trend(location)
            
            report = {
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "location": location,
                "current_status": {
                    "water_level": current_data.water_level,
                    "alert_status": current_data.alert_status,
                    "humidity": current_data.humidity,
                    "pressure": current_data.pressure
                },
                "trend_analysis": trend_data,
                "recommendations": current_data.recommendations,
                "next_monitoring": (datetime.now() + timedelta(hours=6)).isoformat(),
                "report_generated": datetime.now().isoformat()
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating daily report: {e}")
            return {"error": f"Failed to generate report: {str(e)}"}


# Legacy functions for backward compatibility
def fetch_weather_data(city: str, api_key: str) -> Optional[Dict]:
    """Legacy function for backward compatibility"""
    service = EnhancedWaterLevelService(api_key)
    water_data = service.fetch_water_data(city)
    if water_data:
        # Convert to legacy format
        return {
            'main': {
                'temp': water_data.water_level,
                'humidity': water_data.humidity,
                'pressure': water_data.pressure
            }
        }
    return None

def parse_weather_data(data: Dict) -> Dict:
    """Legacy function for parsing weather data"""
    if not data or 'main' not in data:
        return {
            'water_level': 'N/A',
            'lowest_value_point': 'N/A',
            'potential_action_point': 'N/A'
        }
    
    main_data = data['main']
    water_level = main_data.get('temp', 'N/A')
    lvp = main_data.get('humidity', 'N/A')
    pap = main_data.get('pressure', 'N/A')
    
    return {
        'water_level': water_level,
        'lowest_value_point': lvp,
        'potential_action_point': pap
    }

def display_weather_data(city: str, weather_data: Dict):
    """Legacy function for displaying weather data"""
    if not weather_data:
        print(f"No weather data available for {city}")
        return
    
    print(f"Current Weather Data for {city}:")
    if 'main' in weather_data:
        main = weather_data['main']
        print(f"Water Level (Temperature): {main.get('temp', 'N/A')}K")
        print(f"Lowest Value Point (Humidity): {main.get('humidity', 'N/A')}%")
        print(f"Potential Action Point (Pressure): {main.get('pressure', 'N/A')} hPa")
    else:
        print(f"Water Level: {weather_data.get('water_level', 'N/A')}")
        print(f"Lowest Value Point: {weather_data.get('lowest_value_point', 'N/A')}")
        print(f"Potential Action Point: {weather_data.get('potential_action_point', 'N/A')}")


def main():
    """Enhanced main function with comprehensive testing"""
    # Initialize the water level service
    water_service = EnhancedWaterLevelService()
    
    # Test location
    test_location = "india"
    
    print("Enhanced Water Level Monitoring Service")
    print("=" * 50)
    
    # Test current water level monitoring
    print(f"\nTesting water level monitoring for {test_location}:")
    water_data = water_service.fetch_water_data(test_location)
    
    if water_data:
        print(f"  Water Level: {water_data.water_level}°C")
        print(f"  Alert Status: {water_data.alert_status}")
        print(f"  Humidity: {water_data.humidity}%")
        print(f"  Pressure: {water_data.pressure} hPa")
        print(f"  Lowest Value Point: {water_data.lowest_value_point:.2f}")
        print(f"  Potential Action Point: {water_data.potential_action_point:.2f}")
        print("  Recommendations:")
        for rec in water_data.recommendations:
            print(f"    - {rec}")
    else:
        print(f"  Failed to get water level data for {test_location}")
    
    # Test historical trend
    print(f"\nTesting historical trend analysis:")
    trend_data = water_service.get_historical_trend(test_location, days=5)
    if 'error' not in trend_data:
        print(f"  Current Level: {trend_data['current_level']}°C")
        print(f"  Average (5 days): {trend_data['average']:.2f}°C")
        print(f"  Trend: {trend_data['trend']}")
        print(f"  Volatility: {trend_data['volatility']:.2f}")
    
    # Test daily report
    print(f"\nGenerating daily report:")
    report = water_service.generate_daily_report(test_location)
    if 'error' not in report:
        print(f"  Report Date: {report['report_date']}")
        print(f"  Alert Status: {report['current_status']['alert_status']}")
        print(f"  Next Monitoring: {report['next_monitoring']}")
    
    # Test multiple location monitoring
    print(f"\nTesting multiple location monitoring:")
    locations = ["Mumbai", "Delhi", "Chennai"]
    results = water_service.monitor_multiple_locations(locations)
    for i, result in enumerate(results):
        if result:
            print(f"  {locations[i]}: {result.water_level}°C ({result.alert_status})")
        else:
            print(f"  {locations[i]}: Failed to fetch data")


if __name__ == "__main__":
    main()
