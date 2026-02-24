import requests
import pandas as pd
from typing import Optional, Tuple

class WeatherGateway:
    def __init__(self):
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"

    def get_coordinates(self, city_name: str) -> Optional[Tuple[float, float, str]]:
        """
        Fetches latitude, longitude, and formatted name for a given city.
        Returns None if city not found.
        """
        params = {
            "name": city_name,
            "count": 1,
            "language": "en",
            "format": "json"
        }
        try:
            response = requests.get(self.geocoding_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("results"):
                return None
            
            result = data["results"][0]
            return result["latitude"], result["longitude"], result["name"]
        except requests.RequestException as e:
            print(f"Error fetching coordinates: {e}")
            return None

    def get_forecast(self, lat: float, lon: float) -> pd.DataFrame:
        """
        Fetches 7-day forecast for given coordinates.
        Returns a DataFrame with Date, Max Temp, and Rainfall.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": ["temperature_2m_max", "rain_sum"],
            "timezone": "auto"
        }
        
        try:
            response = requests.get(self.forecast_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            daily_data = data.get("daily", {})
            if not daily_data:
                return pd.DataFrame()
            
            df = pd.DataFrame({
                "Date": pd.to_datetime(daily_data["time"]),
                "Max Temp (°C)": daily_data["temperature_2m_max"],
                "Rainfall (mm)": daily_data["rain_sum"]
            })
            
            # Format Date to be more readable if needed, but keeping datetime object is good for plotting
            return df
        except requests.RequestException as e:
            print(f"Error fetching forecast: {e}")
            return pd.DataFrame()
