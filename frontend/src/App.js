import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

import 'leaflet/dist/leaflet.css';

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setNews(res.data.news || []);
      setThreats(res.data.threats || []);
      setWeather(res.data.weather);

      const newMarkers = res.data.news.map((item, i) => ({
        position: [i * 10 % 90, i * 10 % 180],
        popup: item.title
      }));
      setMarkers(newMarkers);

      const highThreat = res.data.news.some(n => n.description && (n.description.toLowerCase().includes('threat') || n.description.toLowerCase().includes('alert')));
      if (highThreat) {
        setAlertMessage('High threat detected in news!');
        if (Notification.permission === 'granted') {
          new Notification('Sentinel Alert', { body: 'High threat in news!' });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 min
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();

    // Load X embed script dynamically (required for widget to work)
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const memoizedMarkers = useMemo(() => markers, [markers]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {memoizedMarkers.map((m, i) => (
            <Marker key={i} position={m.position}>
              <Popup>{m.popup}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ width: '320px', padding: '10px', overflowY: 'auto', background: '#f8f9fa' }}>
        <h2>News Feed (BBC World)</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {news.map((item, i) => (
            <li key={i} style={{ marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <strong>{item.title}</strong>
            </li>
          ))}
        </ul>

        <h2>Threats (Malware Recent)</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {threats.map((t, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>
              {t.signature || 'Sample'} - {t.first_seen?.substring(0, 10) || 'N/A'}
            </li>
          ))}
        </ul>

        <h2>X Real-Time Alerts</h2>
        {/* Embedded X Timeline - BBC Breaking News example */}
        <div style={{ height: '500px', overflow: 'hidden', border: '1px solid #ccc', borderRadius: '8px' }}>
          <a 
            className="twitter-timeline" 
            href="https://twitter.com/BBCBreaking" 
            data-height="500" 
            data-theme="light" 
            data-chrome="noheader nofooter noborders transparent"
          >
            Tweets by BBCBreaking
          </a>
        </div>

        <h2>Weather (Equator Example)</h2>
        <p>{weather ? `Temp: ${weather.current_weather.temperature}°C, Wind: ${weather.current_weather.windspeed} km/h` : 'Loading...'}</p>

        {alertMessage && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '15px' }}>{alertMessage}</p>}
      </div>
    </div>
  );
}

export default App;
