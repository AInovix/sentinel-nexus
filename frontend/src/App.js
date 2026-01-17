import React, { useState, useEffect, useMemo } from 'react';
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

const DEFCON_INFO = {
  1: { name: 'COCKED PISTOL', desc: 'Maximum readiness – imminent nuclear risk', color: '#f85149' },
  2: { name: 'FAST PACE', desc: 'Forces ready to deploy in 6 hours', color: '#db6d28' },
  3: { name: 'ROUND HOUSE', desc: 'Air Force mobilization in 15 minutes', color: '#d29922' },
  4: { name: 'DOUBLE TAKE', desc: 'Heightened watch & security', color: '#58a6ff' },
  5: { name: 'FADE OUT', desc: 'Normal peacetime posture', color: '#3fb950' }
};

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // When backend is ready, use this:
      // const res = await axios.get('https://your-backend.onrender.com/api/dashboard');
      // For now: fallback only
      throw new Error('No backend');
    } catch {
      setError('Live feeds offline – strategic fallback active');
      setNews([
        { title: 'Unconfirmed missile launch detected', description: 'High-confidence satellite source – Middle East region' },
        { title: 'Cyber attack on critical infrastructure', description: 'State actor attribution ongoing' },
        { title: 'Border escalation – troop movements observed', description: 'Diplomatic de-escalation channels activated' }
      ]);
      setThreats([
        { signature: 'RANSOMWARE-VAR-2026A', first_seen: '2026-01-16' },
        { signature: 'APT-41 Campaign Spike', first_seen: '2026-01-15' }
      ]);
      setWeather({ current_weather: { temperature: 18, windspeed: 25 } });
      setMarkers([
        { position: [35, 45], popup: 'Hot Zone Alpha' },
        { position: [50, 30], popup: 'Active Conflict Zone' }
      ]);
      const score = 35 + Math.random() * 40;
      const level = score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';
      setThreatLevel(level);
      setAlertMessage(level === 'HIGH' ? 'ELEVATED THREAT LEVEL – IMMEDIATE REVIEW REQUIRED' : level === 'MEDIUM' ? 'WATCH CONDITION – MONITORING INTENSIFIED' : '');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min
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
      <div className={`loading ${!isLoading ? 'hidden' : ''}`}>
        <div className="loading-logo">PULSE</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>

      <header className="header">
        <div className="header-left">
          <div className="logo">PULSE</div>
          <div className="status"><span className="status-dot"></span>OPERATIONAL</div>
        </div>
        <div className="header-time">{new Date().toLocaleTimeString('en-US', { hour12: false })} UTC</div>
      </header>

      <div className="defcon-bar">
        <span className="defcon-label">DEFCON STATUS</span>
        <div className="defcon-levels">
          {[1,2,3,4,5].map(l => (
            <div
              key={l}
              className={`defcon-level defcon-${l} ${threatLevel === 'HIGH' && l === 2 ? 'active' : threatLevel === 'MEDIUM' && l === 3 ? 'active' : threatLevel === 'LOW' && l === 4 ? 'active' : ''}`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="defcon-info">
          <div className="defcon-name" style={{ color: threatColor }}>
            {threatLevel === 'HIGH' ? 'COCKED PISTOL' : threatLevel === 'MEDIUM' ? 'FAST PACE' : 'DOUBLE TAKE'}
          </div>
          <div className="defcon-desc">
            {threatLevel === 'HIGH' ? 'Maximum readiness – imminent risk' : threatLevel === 'MEDIUM' ? 'Forces on alert' : 'Heightened watch'}
          </div>
        </div>
        <div className="threat-score">THREAT LEVEL: {threatLevel}</div>
      </div>

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
          {isLoading && <div className="loading">Initializing...</div>}
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
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/bellingcat" data-height="320" data-theme="dark">Bellingcat</a>
              </div>
            </div>
          </section>

          <section className="status-panel">
            <div className="weather">
              Reference Weather: {weather ? `${weather.current_weather.temperature}°C / ${weather.current_weather.windspeed} km/h` : '—'}
            </div>
          </section>
        </aside>
      </div>

      <style jsx global>{`
        .app.dark { background: #0a0c10; color: #e6edf3; height: 100vh; font-family: 'Inter', sans-serif; }
        .header { background: #111827; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; }
        .logo { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; color: #3fb950; letter-spacing: 0.05em; }
        .status { display: flex; align-items: center; gap: 0.5rem; background: rgba(63,185,80,0.1); padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid rgba(63,185,80,0.3); font-family: 'JetBrains Mono'; font-size: 0.8rem; }
        .status-dot { width: 8px; height: 8px; background: #3fb950; border-radius: 50%; animation: blink 2s infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .header-time { font-family: 'JetBrains Mono'; color: #8b949e; }
        .defcon-bar { background: #161b22; padding: 1rem 2rem; display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid #30363d; flex-wrap: wrap; }
        .defcon-label { font-family: 'JetBrains Mono'; color: #8b949e; font-size: 0.85rem; letter-spacing: 0.1em; }
        .defcon-levels { display: flex; gap: 0.4rem; }
        .defcon-level { padding: 0.5rem 1rem; font-family: 'JetBrains Mono'; font-weight: 700; border-radius: 4px; opacity: 0.4; border: 1px solid transparent; transition: all 0.3s; }
        .defcon-level.active { opacity: 1; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 currentColor; } 50% { box-shadow: 0 0 12px 4px currentColor; } }
        .defcon-1 { background: rgba(248,81,73,0.15); color: #f85149; border-color: #f85149; }
        .defcon-2 { background: rgba(219,109,40,0.15); color: #db6d28; border-color: #db6d28; }
        .defcon-3 { background: rgba(210,153,34,0.15); color: #d29922; border-color: #d29922; }
        .defcon-4 { background: rgba(88,166,255,0.15); color: #58a6ff; border-color: #58a6ff; }
        .defcon-5 { background: rgba(63,185,80,0.15); color: #3fb950; border-color: #3fb950; }
        .defcon-info { text-align: center; }
        .defcon-name { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.1rem; }
        .defcon-desc { font-size: 0.85rem; color: #8b949e; }
        .threat-score { font-family: 'JetBrains Mono'; background: #161b22; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #30363d; }
        .layout { display: flex; height: calc(100vh - 110px); }
        .map-container { flex: 1; background: #080a0f; }
        .sidebar { width: 380px; background: #0d1117; border-left: 1px solid #30363d; overflow-y: auto; padding: 1.5rem; }
        .panel { margin-bottom: 2rem; }
        .panel h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
        .feed-item { background: #161b22; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border-left: 4px solid #3b82f6; }
        .item-title { font-weight: 600; margin-bottom: 0.5rem; }
        .item-desc { font-size: 0.9rem; color: #8b949e; }
        .threat-list li { background: #161b22; padding: 0.8rem; border-radius: 6px; margin-bottom: 0.6rem; display: flex; justify-content: space-between; }
        .threat-name { color: #f85149; font-weight: 600; }
        .embed-grid { display: grid; gap: 1rem; }
        .embed-item { height: 320px; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; }
        .alert-banner { background: #991b1b; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; animation: pulse 2s infinite; }
        .loading, .error-banner { text-align: center; padding: 2rem 0; color: #8b949e; }
        .error-banner { background: #7f1d1d; color: #fecaca; border-radius: 8px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

export default App;
