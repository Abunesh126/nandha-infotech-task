import requests

# Replace with your actual OpenCage API key
opencage_api_key = 'e2077ef4c9ee401ebaf345be209f68c0'

# Define the coordinates
latitude = 10.9413 # Example latitude
longitude = 76.7439  # Example longitude

# Construct the Reverse Geocoding API URL
reverse_geocoding_url = f'https://api.opencagedata.com/geocode/v1/json?q={latitude}+{longitude}&key={opencage_api_key}'

# Make a request to the OpenCage Reverse Geocoding API
reverse_geocoding_response = requests.get(reverse_geocoding_url)

# Check if the request was successful
if reverse_geocoding_response.status_code == 200:
    # Parse the JSON response
    reverse_geocoding_data = reverse_geocoding_response.json()
    if reverse_geocoding_data['results']:
        # Get the components of the first result
        components = reverse_geocoding_data['results'][0]['components']
        state = components.get('state', 'N/A')
        district = components.get('state_district', 'N/A')
        taluk = components.get('suburb', 'N/A')

        # Print the location details
        print(f"Location: {taluk}, {district}, {state}")
        print(f"Latitude: {latitude}, Longitude: {longitude}")
    else:
        print("Error: No results found for the specified coordinates.")
else:
    print(f"Error: Unable to fetch reverse geocoding data (Status code: {reverse_geocoding_response.status_code})")
