import requests

def fetch_weather_data(city, api_key):
    """Fetches the current weather data for a given city using the OpenWeather API."""
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to retrieve data: {response.status_code} - {response.text}")

def parse_weather_data(data):
    """Parses the weather data and extracts specific information."""
    # Extracting specific data from the JSON response
    # Assuming we are interested in the temperature, humidity, and pressure
    main_data = data.get('main', {})
    water_level = main_data.get('temp', 'N/A')  # Temperature as an example
    lvp = main_data.get('humidity', 'N/A')  # Humidity as an example of Lowest Value Point
    pap = main_data.get('pressure', 'N/A')  # Pressure as an example of Potential Action Point
    
    return {
        'water_level': water_level,
        'lowest_value_point': lvp,
        'potential_action_point': pap
    }

def display_weather_data(city, weather_data):
    """Displays the weather data."""
    print(f"Current Weather Data for {city}:")
    print(f"Water Level (Temperature): {weather_data['water_level']}K")
    print(f"Lowest Value Point (Humidity): {weather_data['lowest_value_point']}%")
    print(f"Potential Action Point (Pressure): {weather_data['potential_action_point']} hPa")
    
def main():
    # Your OpenWeather API key
    api_key = "f01646fea37fed90cc64433c7ce54e51"
    
    # City for which the weather data is to be fetched
    city = "india"
    
    try:
        data = fetch_weather_data(city, api_key)
        weather_data = parse_weather_data(data)
        display_weather_data(city, weather_data)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()
