import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

import 'leaflet/dist/leaflet.css';

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [xAlerts, setXAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setNews(res.data.news || []);
      setThreats(res.data.threats || []);
      setXAlerts(res.data.xAlerts || []);
      setWeather(res.data.weather);

      // Simple markers from news (fake positions; optimize by memoizing)
      const newMarkers = res.data.news.map((item, i) => ({
        position: [i * 10 % 90, i * 10 % 180], // Cycle positions for demo
        popup: item.title
      }));
      setMarkers(newMarkers);

      // Simplified predictions: Keyword check for 'threat' or 'alert'
      const highThreat = res.data.news.some(n => n.description && (n.description.includes('threat') || n.description.includes('alert')));
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
    const interval = setInterval(fetchData, 600000); // 10 min for perf
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
  }, []);

  // Memoize markers to prevent map re-renders
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
      <div style={{ width: '300px', padding: '10px', overflowY: 'auto' }}>
        <h2>News Feed</h2>
        <ul>
          {news.map((item, i) => <li key={i}>{item.title}</li>)}
        </ul>
        <h2>Threats (Malware)</h2>
        <ul>
          {threats.map((t, i) => <li key={i}>{t.signature || 'Unknown'} - {t.first_seen}</li>)}
        </ul>
        <h2>X Alerts</h2>
        <ul>
          {xAlerts.map((alert, i) => <li key={i}>{alert.text}</li>)}
        </ul>
        <h2>Weather Alert</h2>
        <p>{weather ? `Temp: ${weather.current_weather.temperature}°C` : 'Loading...'}</p>
        {alertMessage && <p style={{ color: 'red' }}>{alertMessage}</p>}
      </div>
    </div>
  );
}

export default App;
