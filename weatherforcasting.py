import requests

# Your OpenWeather API key
api_key = "fa4f706105a3478dfdf1d950ee3b302b"

# Example URL of the OpenWeather API endpoint for current weather data
city = "London"
url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"  # units=metric for Celsius

# Making a GET request to the API endpoint
response = requests.get(url)

# Checking if the request was successful
if response.status_code == 200:
    # Parsing the response JSON
    data = response.json()
    
    # Extracting specific data from the JSON response
    # Assuming we are interested in the temperature, humidity, and pressure
    temperature = data.get('main', {}).get('temp', 'N/A')  # Temperature in Celsius
    humidity = data.get('main', {}).get('humidity', 'N/A')  # Humidity in percentage
    pressure = data.get('main', {}).get('pressure', 'N/A')  # Atmospheric pressure in hPa
    
    # Printing the extracted data
    print(f"Current Weather for {city}:")
    print(f"Temperature: {temperature}°C")
    print(f"Humidity: {humidity}%")
    print(f"Pressure: {pressure} hPa")
else:
    print(f"Failed to retrieve data: {response.status_code} - {response.text}")


