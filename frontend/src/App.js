import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

import 'leaflet/dist/leaflet.css';

// Leaflet icon fix with ESLint disable
/* eslint-disable no-undef */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
/* eslint-enable no-undef */

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [threatLevel, setThreatLevel] = useState('LOW'); // LOW / MEDIUM / HIGH
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get('/api/dashboard');
      const newsItems = res.data.news || [];
      setNews(newsItems);
      setThreats(res.data.threats || []);
      setWeather(res.data.weather);

      const newMarkers = newsItems.map(() => ({
        position: [-60 + Math.random() * 140, -170 + Math.random() * 340],
        popup: 'Active Event'
      }));
      setMarkers(newMarkers);

      const threatKeywords = /threat|attack|missile|conflict|crisis|war|bomb|strike|invasion|cyber|breach/i;
      const hasHighThreat = newsItems.some(item => threatKeywords.test(item.description || item.title || ''));
      setThreatLevel(hasHighThreat ? 'HIGH' : newsItems.length > 5 ? 'MEDIUM' : 'LOW');
      setAlertMessage(hasHighThreat ? 'ELEVATED THREAT LEVEL - IMMEDIATE REVIEW RECOMMENDED' : '');
    } catch (err) {
      setError('Real-time feeds unavailable. Using strategic overview mode.');
      // Richer mock data for professional fallback
      setNews([
        { title: 'Unconfirmed missile activity in contested zone', description: 'Satellite imagery shows movement - high confidence source' },
        { title: 'Cyber intrusion attempt on critical infrastructure', description: 'State actor suspected - ongoing containment' },
        { title: 'Border escalation reported', description: 'Troop buildup observed - diplomatic channels engaged' }
      ]);
      setThreats([
        { signature: 'RANSOMWARE-VAR-2026A', first_seen: '2026-01-16' },
        { signature: 'APT-41 Campaign Spike', first_seen: '2026-01-15' }
      ]);
      setWeather({ current_weather: { temperature: 18, windspeed: 25 } });
      setMarkers([
        { position: [35, 45], popup: 'Hot Zone Alpha' },
        { position: [-10, 120], popup: 'Emerging Incident' }
      ]);
      setThreatLevel('MEDIUM');
      setAlertMessage('Fallback mode active - limited intelligence available');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min in production feel
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const memoizedMarkers = useMemo(() => markers, [markers]);

  const threatColor = threatLevel === 'HIGH' ? '#ef4444' : threatLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <div className="app dark">
      <header className="header">
        <div className="title">SENTINEL NEXUS</div>
        <div className="status-bar">
          <div className="threat-gauge">
            <span>THREAT LEVEL:</span>
            <div className="gauge-bar" style={{ background: threatColor }}>
              {threatLevel}
            </div>
          </div>
        </div>
      </header>

      <div className="layout">
        <div className="map-container">
          <MapContainer center={[20, 0]} zoom={2.5} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {memoizedMarkers.map((m, i) => (
              <Marker key={i} position={m.position}>
                <Popup>{m.popup}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="sidebar">
          {isLoading && <div className="loading">Initializing situational awareness...</div>}
          {error && <div className="error-banner">{error}</div>}

          {alertMessage && (
            <div className="alert-banner" style={{ background: threatColor }}>
              <strong>PRIORITY ALERT</strong>
              <p>{alertMessage}</p>
            </div>
          )}

          <section className="panel">
            <h2>Global News Feed</h2>
            <div className="feed">
              {news.map((item, i) => (
                <div key={i} className="feed-item">
                  <div className="item-title">{item.title}</div>
                  <div className="item-desc">{item.description?.substring(0, 140) || ''}...</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Active Threats</h2>
            <ul className="threat-list">
              {threats.map((t, i) => (
                <li key={i}>
                  <span className="threat-name">{t.signature || 'Unknown'}</span>
                  <span className="threat-date">{t.first_seen || 'Recent'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>OSINT Feeds</h2>
            <div className="embed-grid">
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/BBCBreaking" data-height="320" data-theme="dark">BBC Breaking</a>
              </div>
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/Reuters" data-height="320" data-theme="dark">Reuters</a>
              </div>
            </div>
          </section>

          <section className="status-panel">
            <div className="weather">
              Weather Ref: {weather ? `${weather.current_weather.temperature}°C / ${weather.current_weather.windspeed} km/h` : '—'}
            </div>
          </section>
        </aside>
      </div>

      <style jsx global>{`
        .app.dark {
          background: #0a0f1a;
          color: #d1d5db;
          height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .header {
          background: #111827;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1f2937;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #60a5fa;
        }
        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .threat-gauge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }
        .gauge-bar {
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.9rem;
          color: white;
          font-weight: bold;
        }
        .layout {
          display: flex;
          height: calc(100vh - 60px);
        }
        .map-container {
          flex: 1;
        }
        .sidebar {
          width: 380px;
          background: #111827;
          border-left: 1px solid #1f2937;
          overflow-y: auto;
          padding: 1.5rem;
        }
        .panel {
          margin-bottom: 2rem;
        }
        .panel h2 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: #93c5fd;
          border-bottom: 1px solid #1f2937;
          padding-bottom: 0.5rem;
        }
        .feed-item {
          background: #1f2937;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #3b82f6;
        }
        .item-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .item-desc {
          font-size: 0.9rem;
          color: #9ca3af;
        }
        .threat-list li {
          background: #1f2937;
          padding: 0.8rem;
          border-radius: 6px;
          margin-bottom: 0.6rem;
          display: flex;
          justify-content: space-between;
        }
        .threat-name {
          color: #f87171;
          font-weight: 600;
        }
        .embed-grid {
          display: grid;
          gap: 1rem;
        }
        .embed-item {
          height: 320px;
          border: 1px solid #1f2937;
          border-radius: 8px;
          overflow: hidden;
        }
        .status-panel {
          background: #1f2937;
          padding: 1rem;
          border-radius: 8px;
        }
        .alert-banner {
          background: #991b1b;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .loading, .error-banner {
          text-align: center;
          padding: 2rem 0;
          color: #9ca3af;
        }
        .error-banner {
          background: #7f1d1d;
          color: #fecaca;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default App;
