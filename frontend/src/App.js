import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in Leaflet with React
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Toggle dark mode & save preference
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
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

      // Create reasonably distributed markers
      const newMarkers = newsItems.map((item, i) => {
        const lat =  -60 + Math.random() * 140; // -60 to 80 latitude
        const lng = -170 + Math.random() * 340; // -170 to 170 longitude
        return {
          position: [lat, lng],
          popup: item.title || 'Event'
        };
      });
      setMarkers(newMarkers);

      // Threat keyword detection
      const hasThreat = newsItems.some(item =>
        item.description?.toLowerCase().match(/threat|attack|missile|conflict|crisis|war|bomb|strike|invasion/)
      );

      if (hasThreat) {
        setAlertMessage('High-threat indicators detected in global news feed');
        if (Notification.permission === 'granted') {
          new Notification('Sentinel Nexus - Priority Alert', {
            body: 'Keywords suggesting potential threat or conflict detected',
            icon: '/favicon.ico'
          });
        }
      } else {
        setAlertMessage('');
      }
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      setError('Failed to load real-time data. Showing limited view.');
      // Fallback mock data
      setNews([
        { title: 'Global tensions reported in multiple regions', description: 'Unconfirmed reports of military activity' },
        { title: 'Diplomatic efforts underway', description: 'International talks to de-escalate' }
      ]);
      setThreats([{ signature: 'Emerging malware variant', first_seen: '2026-01-15' }]);
      setWeather({ current_weather: { temperature: 22, windspeed: 14 } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    // Notification permission
    if ("Notification" in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Load X/Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const memoizedMarkers = useMemo(() => markers, [markers]);

  const themeClass = darkMode ? 'dark-theme' : 'light-theme';

  return (
    <div className={`app-container ${themeClass}`}>
      <header className="app-header">
        <h1>Sentinel Nexus</h1>
        <button 
          onClick={toggleDarkMode} 
          className="mode-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="main-layout">
        {/* Map */}
        <div className="map-section">
          <MapContainer
            center={[15, 0]}
            zoom={2.2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {memoizedMarkers.map((m, i) => (
              <Marker key={i} position={m.position}>
                <Popup>{m.popup}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading global intelligence...</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {/* News */}
          <section className="card-section">
            <h2>BBC World News</h2>
            <div className="news-list">
              {news.slice(0, 10).map((item, i) => (
                <div key={i} className="news-card">
                  <h3>{item.title}</h3>
                  <p className="news-desc">{item.description?.substring(0, 120)}{item.description?.length > 120 ? '...' : ''}</p>
                </div>
              ))}
              {news.length === 0 && !isLoading && <p className="empty-state">No news available</p>}
            </div>
          </section>

          {/* Threats */}
          <section className="card-section">
            <h2>Recent Malware & Threats</h2>
            <ul className="threat-list">
              {threats.slice(0, 8).map((t, i) => (
                <li key={i}>
                  <strong>{t.signature || 'Unknown sample'}</strong>
                  <span> • {t.first_seen?.substring(0, 10) || '—'}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* X Feeds */}
          <section className="card-section">
            <h2>Live Intelligence Feeds</h2>
            
            <div className="twitter-embed">
              <h3>BBC Breaking</h3>
              <div className="twitter-container">
                <a
                  className="twitter-timeline"
                  href="https://twitter.com/BBCBreaking"
                  data-height="380"
                  data-theme={darkMode ? "dark" : "light"}
                  data-chrome="noheader nofooter noborders transparent"
                >
                  Tweets by BBCBreaking
                </a>
              </div>
            </div>

            <div className="twitter-embed">
              <h3>Reuters</h3>
              <div className="twitter-container">
                <a
                  className="twitter-timeline"
                  href="https://twitter.com/Reuters"
                  data-height="380"
                  data-theme={darkMode ? "dark" : "light"}
                  data-chrome="noheader nofooter noborders transparent"
                >
                  Tweets by Reuters
                </a>
              </div>
            </div>

            <div className="twitter-embed">
              <h3>Bellingcat (OSINT)</h3>
              <div className="twitter-container">
                <a
                  className="twitter-timeline"
                  href="https://twitter.com/bellingcat"
                  data-height="380"
                  data-theme={darkMode ? "dark" : "light"}
                  data-chrome="noheader nofooter noborders transparent"
                >
                  Tweets by bellingcat
                </a>
              </div>
            </div>
          </section>

          {/* Weather & Alert */}
          <section className="status-section">
            <div className="weather-box">
              <h3>Reference Weather</h3>
              <p>
                {weather
                  ? `Temp: ${weather.current_weather.temperature} °C • Wind: ${weather.current_weather.windspeed} km/h`
                  : '—'}
              </p>
            </div>

            {alertMessage && (
              <div className="alert-box">
                <strong>ALERT</strong>
                <p>{alertMessage}</p>
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* Basic CSS - can move to separate file later */}
      <style jsx global>{`
        :root {
          --bg: #f8f9fc;
          --text: #1a1f36;
          --sidebar-bg: #ffffff;
          --card-bg: #ffffff;
          --border: #e2e8f0;
        }
        .dark-theme {
          --bg: #0f172a;
          --text: #e2e8f0;
          --sidebar-bg: #1e293b;
          --card-bg: #1e293b;
          --border: #334155;
        }
        .app-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .app-header {
          padding: 12px 20px;
          background: var(--sidebar-bg);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .mode-toggle {
          background: var(--border);
          border: none;
          padding: 8px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
        }
        .main-layout {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .map-section {
          flex: 1;
        }
        .sidebar {
          width: 360px;
          background: var(--sidebar-bg);
          border-left: 1px solid var(--border);
          overflow-y: auto;
          padding: 20px;
          box-sizing: border-box;
        }
        .card-section {
          margin-bottom: 28px;
        }
        .card-section h2 {
          font-size: 1.25rem;
          margin: 0 0 12px;
          color: var(--text);
        }
        .news-card {
          background: var(--card-bg);
          padding: 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .news-card h3 {
          margin: 0 0 6px;
          font-size: 1.05rem;
        }
        .news-desc {
          margin: 0;
          font-size: 0.92rem;
          color: #64748b;
        }
        .threat-list li {
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
        }
        .twitter-embed {
          margin-bottom: 24px;
        }
        .twitter-embed h3 {
          margin: 0 0 8px;
          font-size: 1.05rem;
        }
        .twitter-container {
          height: 380px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          background: var(--card-bg);
        }
        .status-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .weather-box, .alert-box {
          background: var(--card-bg);
          padding: 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .alert-box {
          background: #fee2e2;
          border-color: #ef4444;
          color: #991b1b;
        }
        .dark-theme .alert-box {
          background: #7f1d1d;
          color: #fecaca;
          border-color: #f87171;
        }
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .dark-theme .loading-overlay {
          background: rgba(15,23,42,0.8);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .empty-state {
          color: #64748b;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default App;
