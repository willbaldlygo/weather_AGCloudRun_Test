const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Gateway route for Open-Meteo
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        // 1. Get coordinates for the city using Geocoding API
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }

        const location = geoResponse.data.results[0];
        
        // 2. Get 7-day weather forecast
        // We will fetch Max Temperature, Rainfall (precipitation_sum), and Windspeed (windspeed_10m_max)
        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&timezone=auto`);

        res.json({
            city: location.name,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
            forecast: weatherResponse.data.daily
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Serve frontend build (if available)
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));

// Fallback to index.html for React Router / SPA application
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
