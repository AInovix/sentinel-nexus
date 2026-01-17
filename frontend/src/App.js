import React, { useState, useEffect, useMemo } from 'react';
import { Viewer, Entity, PolygonGraphics, PointGraphics, LabelGraphics } from 'resium';
import * as Cesium from 'cesium';
import axios from 'axios';

import 'leaflet/dist/leaflet.css'; // Keep for fallback if needed

// Set Cesium Ion token (get free from https://cesium.com/ion/signup then add to Netlify env vars as REACT_APP_CESIUM_ION_TOKEN)
Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_ION_TOKEN || 'your_token_here_if_not_using_env';

const DEFCON_INFO = {
  1: { name: 'COCKED PISTOL', desc: 'Maximum readiness – nuclear war imminent', color: '#f85149' },
  2: { name: 'FAST PACE', desc: 'Forces ready to deploy in 6 hours', color: '#db6d28' },
  3: { name: 'ROUND HOUSE', desc: 'Air Force mobilization in 15 minutes', color: '#d29922' },
  4: { name: 'DOUBLE TAKE', desc: 'Heightened watch & security', color: '#58a6ff' },
  5: { name: 'FADE OUT', desc: 'Normal peacetime posture', color: '#3fb950' }
};

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // REPLACE WITH YOUR RENDER BACKEND URL AFTER DEPLOYING
      const res = await axios.get('https://your-backend-name.onrender.com/api/dashboard');
      const newsItems = res.data.news || [];
      setNews(newsItems);
      setThreats(res.data.threats || []);
      setWeather(res.data.weather);

      const hasHighThreat = newsItems.some(item =>
        /threat|attack|missile|conflict|crisis|war|bomb|strike|invasion|cyber|breach/i.test(item.description || item.title || '')
      );
      const level = hasHighThreat ? 'HIGH' : newsItems.length > 5 ? 'MEDIUM' : 'LOW';
      setThreatLevel(level);
      setAlertMessage(level === 'HIGH' ? 'ELEVATED THREAT LEVEL – IMMEDIATE REVIEW REQUIRED' : '');
    } catch (err) {
      setError('Live feeds offline – strategic fallback active');
      // Rich fallback data
      setNews([
        { title: 'Unconfirmed missile activity detected', description: 'Satellite confirmation pending – high confidence source' },
        { title: 'Cyber intrusion attempt on critical infrastructure', description: 'State actor suspected – ongoing containment' },
        { title: 'Border escalation reported', description: 'Troop buildup observed – diplomatic channels engaged' }
      ]);
      setThreats([
        { signature: 'RANSOMWARE-VAR-2026A', first_seen: '2026-01-16' },
        { signature: 'APT-41 Campaign Spike', first_seen: '2026-01-15' }
      ]);
      setWeather({ current_weather: { temperature: 18, windspeed: 25 } });
      setThreatLevel('MEDIUM');
      setAlertMessage('Fallback mode – limited intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Tactical red zones (polygons on globe)
  const redZones = [
    { name: 'Middle East Hotspot', positions: [30, 40, 35, 50, 25, 55, 20, 45, 30, 40] },
    { name: 'Eastern Europe Tension Zone', positions: [48, 25, 55, 35, 50, 40, 45, 30, 48, 25] },
  ];

  const threatColor = threatLevel === 'HIGH' ? Cesium.Color.RED.withAlpha(0.3) : 
                     threatLevel === 'MEDIUM' ? Cesium.Color.ORANGE.withAlpha(0.25) : 
                     Cesium.Color.GREEN.withAlpha(0.15);

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
            <div key={l} className={`defcon-level defcon-${l} ${threatLevel === 'HIGH' && l === 2 ? 'active' : ''}`}>
              {l}
            </div>
          ))}
        </div>
        <div className="defcon-info">
          <div className="defcon-name" style={{ color: threatLevel === 'HIGH' ? '#f85149' : threatLevel === 'MEDIUM' ? '#db6d28' : '#3fb950' }}>
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
          <Viewer
            full
            baseLayerPicker={false}
            geocoder={false}
            homeButton={false}
            sceneModePicker={false}
            navigationHelpButton={false}
            animation={false}
            timeline={false}
            skyBox={false}
            skyAtmosphere={false}
            terrainProvider={Cesium.createWorldTerrain()}
            imageryProvider={new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })}
          >
            {/* Tactical red zones */}
            {redZones.map((zone, i) => (
              <Entity key={i} name={zone.name}>
                <PolygonGraphics
                  hierarchy={Cesium.Cartesian3.fromDegreesArray(zone.positions)}
                  material={threatColor}
                  outline={true}
                  outlineColor={Cesium.Color.RED}
                  outlineWidth={2}
                />
              </Entity>
            ))}

            {/* Markers */}
            <Entity position={Cesium.Cartesian3.fromDegrees(35, 45)}>
              <PointGraphics pixelSize={12} color={Cesium.Color.RED} />
              <LabelGraphics text="Hot Zone Alpha" font="14px sans-serif" fillColor={Cesium.Color.WHITE} />
            </Entity>
          </Viewer>
        </div>

        <aside className="sidebar">
          {isLoading && <div className="loading">Initializing...</div>}
          {error && <div className="error-banner">{error}</div>}

          {alertMessage && (
            <div className="alert-banner" style={{ background: threatLevel === 'HIGH' ? '#991b1b' : '#c2410c' }}>
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
            <h2>Live OSINT Feeds (X)</h2>
            <div className="embed-grid">
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/BBCBreaking" data-height="320" data-theme="dark" data-chrome="noheader nofooter noborders transparent">
                  Tweets by BBCBreaking
                </a>
              </div>
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/Reuters" data-height="320" data-theme="dark" data-chrome="noheader nofooter noborders transparent">
                  Tweets by Reuters
                </a>
              </div>
              <div className="embed-item">
                <a className="twitter-timeline" href="https://twitter.com/bellingcat" data-height="320" data-theme="dark" data-chrome="noheader nofooter noborders transparent">
                  Tweets by bellingcat
                </a>
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

      {/* Styling */}
      <style jsx global>{`
        .app.dark { background: #0a0c10; color: #e6edf3; height: 100vh; font-family: 'Inter', sans-serif; overflow: hidden; }
        .header { background: #111827; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; z-index: 100; position: relative; }
        .logo { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; color: #3fb950; letter-spacing: 0.05em; }
        .status { display: flex; align-items: center; gap: 0.5rem; background: rgba(63,185,80,0.1); padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid rgba(63,185,80,0.3); font-family: 'JetBrains Mono'; font-size: 0.8rem; }
        .status-dot { width: 8px; height: 8px; background: #3fb950; border-radius: 50%; animation: blink 2s infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .header-time { font-family: 'JetBrains Mono'; color: #8b949e; }
        .defcon-bar { background: #161b22; padding: 1rem 2rem; display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid #30363d; flex-wrap: wrap; z-index: 90; position: relative; }
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
        .layout { display: flex; height: calc(100vh - 140px); width: 100%; }
        .map-container { flex: 1; background: #000; position: relative; }
        .sidebar { width: 380px; background: #0d1117; border-left: 1px solid #30363d; overflow-y: auto; padding: 1.5rem; box-sizing: border-box; }
        .panel { margin-bottom: 2rem; background: #111827; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; }
        .panel h2 { font-size: 1.25rem; margin: 0; padding: 1rem; background: #161b22; color: #58a6ff; font-family: 'JetBrains Mono'; }
        .feed-item { background: #161b22; padding: 1rem; border-radius: 6px; margin: 0.8rem; border-left: 4px solid #3b82f6; }
        .item-title { font-weight: 600; margin-bottom: 0.5rem; }
        .item-desc { font-size: 0.9rem; color: #8b949e; }
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
