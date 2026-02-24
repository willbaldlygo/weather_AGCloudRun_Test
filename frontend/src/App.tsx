import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Search, CloudRain, Wind, Thermometer } from 'lucide-react';
import './index.css';

interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
}

type ChartMetric = 'temperature' | 'rainfall' | 'windspeed';

function App() {
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<ChartMetric>('temperature');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityInput)}`);
      if (!res.ok) {
        throw new Error('City not found or failed to fetch. Please try another city.');
      }
      const data = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = weatherData ? weatherData.forecast.time.map((time, index) => ({
    date: new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    temperature: weatherData.forecast.temperature_2m_max[index],
    rainfall: weatherData.forecast.precipitation_sum[index],
    windspeed: weatherData.forecast.wind_speed_10m_max[index]
  })) : [];

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1 className="app-title">Weather Dashboard</h1>
        <p className="app-subtitle">7-Day Premium Forecast</p>
      </header>

      <form onSubmit={handleSearch} className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? <div className="spinner"></div> : <Search size={20} />}
          {loading ? 'Searching' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {weatherData && (
        <>
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                {weatherData.city}, {weatherData.country}
              </h2>
              <div className="controls">
                <button
                  className={`control-btn ${metric === 'temperature' ? 'active' : ''}`}
                  onClick={() => setMetric('temperature')}
                >
                  <Thermometer size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Temperature
                </button>
                <button
                  className={`control-btn ${metric === 'rainfall' ? 'active' : ''}`}
                  onClick={() => setMetric('rainfall')}
                >
                  <CloudRain size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Rainfall
                </button>
                <button
                  className={`control-btn ${metric === 'windspeed' ? 'active' : ''}`}
                  onClick={() => setMetric('windspeed')}
                >
                  <Wind size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Windspeed
                </button>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                  />
                  <Legend />
                  {metric === 'temperature' && (
                    <Line type="monotone" dataKey="temperature" name="Max Temp (°C)" stroke="#818cf8" strokeWidth={3} dot={{ r: 5, fill: '#818cf8' }} activeDot={{ r: 8 }} />
                  )}
                  {metric === 'rainfall' && (
                    <Line type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} activeDot={{ r: 8 }} />
                  )}
                  {metric === 'windspeed' && (
                    <Line type="monotone" dataKey="windspeed" name="Windspeed (km/h)" stroke="#a78bfa" strokeWidth={3} dot={{ r: 5, fill: '#a78bfa' }} activeDot={{ r: 8 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>7-Day Data View</h2>
            <div className="table-wrapper">
              <table className="weather-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Max Temp (°C)</th>
                    <th>Rainfall (mm)</th>
                    <th>Max Windspeed (km/h)</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((day, idx) => (
                    <tr key={idx}>
                      <td>{day.date}</td>
                      <td>{day.temperature}</td>
                      <td>{day.rainfall}</td>
                      <td>{day.windspeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
