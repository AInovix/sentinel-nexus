import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/dashboard');
      const newsItems = res.data.news || [];
      setNews(newsItems);
      setThreats(res.data.threats || []);
      setWeather(res.data.weather);

      const newMarkers = newsItems.map((_, i) => ({
        position: [-60 + Math.random() * 140, -170 + Math.random() * 340],
        popup: 'Event Location'
      }));
      setMarkers(newMarkers);

      const hasThreat = newsItems.some(item => 
        item.description?.toLowerCase().match(/threat|attack|missile|conflict|crisis|war|bomb|strike|invasion/)
      );
      setAlertMessage(hasThreat ? 'High-threat indicators detected' : '');
    } catch (err) {
      setError('Data load failed – using fallback view');
      setNews([{ title: 'Fallback: Global Alert', description: 'Potential threat detected' }]);
      setThreats([{ signature: 'Fallback Threat', first_seen: '2026-01-17' }]);
      setWeather({ current_weather: { temperature: 25, windspeed: 10 } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const memoizedMarkers = useMemo(() => markers, [markers]);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header>
        <h1>Sentinel Nexus</h1>
        <button onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
      </header>
      <div className="content">
        <div className="map">
          <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {memoizedMarkers.map((m, i) => <Marker key={i} position={m.position}><Popup>{m.popup}</Popup></Marker>)}
          </MapContainer>
        </div>
        <aside className="sidebar">
          {isLoading && <div className="loading">Loading intelligence...</div>}
          {error && <div className="error">{error}</div>}
          <section>
            <h2>News</h2>
            {news.map((item, i) => <div key={i} className="card"><h3>{item.title}</h3><p>{item.description}</p></div>)}
          </section>
          <section>
            <h2>Threats</h2>
            {threats.map((t, i) => <div key={i}>{t.signature} - {t.first_seen}</div>)}
          </section>
          <section>
            <h2>X Feeds</h2>
            <div className="embed">
              <a className="twitter-timeline" href="https://twitter.com/BBCBreaking" data-height="400" data-theme={darkMode ? "dark" : "light"}>Tweets by BBCBreaking</a>
            </div>
            {/* Add more embeds similarly */}
          </section>
          <section>
            <h2>Weather</h2>
            <p>{weather ? `Temp: ${weather.current_weather.temperature}°C` : '—'}</p>
            {alertMessage && <div className="alert">{alertMessage}</div>}
          </section>
        </aside>
      </div>
      <style jsx global>{`
        .app { height: 100vh; display: flex; flex-direction: column; background: ${darkMode ? '#0f172a' : '#f8f9fa'}; color: ${darkMode ? '#e2e8f0' : '#1e293b'}; }
        header { padding: 1rem; background: ${darkMode ? '#1e293b' : '#ffffff'}; border-bottom: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; display: flex; justify-content: space-between; }
        .content { flex: 1; display: flex; }
        .map { flex: 1; }
        .sidebar { width: 340px; padding: 1rem; overflow-y: auto; background: ${darkMode ? '#1e293b' : '#ffffff'}; border-left: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; }
        .card { background: ${darkMode ? '#334155' : '#f1f5f9'}; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
        .alert { background: #ef4444; color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
        .loading, .error { text-align: center; padding: 2rem; }
        .embed { height: 400px; border: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; border-radius: 8px; overflow: hidden; }
      `}</style>
    </div>
  );
}

export default App;
