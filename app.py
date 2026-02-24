import streamlit as st
import pandas as pd
from utils import WeatherGateway

# Page Configuration
st.set_page_config(page_title="Weather Forecaster", page_icon="🌦️")

# Title and Description
st.title("Weather Forecaster 🌦️")
st.markdown("Get the 7-day forecast (Max Temp & Rainfall) for any city.")

# Initialize Gateway
gateway = WeatherGateway()

# User Input
city_name = st.text_input("Enter City Name", placeholder="e.g., London, Tokyo, New York")

if city_name:
    with st.spinner(f"Fetching weather for {city_name}..."):
        # Step 1: Geocoding
        coordinates = gateway.get_coordinates(city_name)
        
        if not coordinates:
            st.error(f"City '{city_name}' not found. Please try again.")
        else:
            lat, lon, resolved_name = coordinates
            st.success(f"Showing forecast for: **{resolved_name}**")
            
            # Step 2: Forecast
            df = gateway.get_forecast(lat, lon)
            
            if df.empty:
                st.error("Could not retrieve forecast data.")
            else:
                # Filter Control
                show_rainy_only = st.checkbox("Show Rainy Days Only 🌧️")
                
                # Apply Filter
                display_df = df.copy()
                if show_rainy_only:
                    display_df = display_df[display_df["Rainfall (mm)"] > 0]
                
                # Layout: Table and Chart
                tab1, tab2 = st.tabs(["📊 Data Table", "📈 Max Temp Trend"])
                
                with tab1:
                    st.dataframe(display_df, use_container_width=True)
                    
                with tab2:
                    st.line_chart(df, x="Date", y="Max Temp (°C)")
