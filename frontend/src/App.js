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
      const newsItems = res.data.news || [];
      setNews(newsItems);
      setThreats(res.data.threats || []);
      setWeather(res.data.weather);

      // Fake markers distributed roughly across the globe
      const newMarkers = newsItems.map((item, i) => ({
        position: [
          (Math.sin(i * 0.7) * 80) + (Math.random() * 10 - 5),
          (Math.cos(i * 0.9) * 170) + (Math.random() * 20 - 10)
        ],
        popup: item.title
      }));
      setMarkers(newMarkers);

      // Very simple keyword-based alert
      const hasThreatKeyword = newsItems.some(item =>
        item.description?.toLowerCase().includes('threat') ||
        item.description?.toLowerCase().includes('attack') ||
        item.description?.toLowerCase().includes('missile') ||
        item.description?.toLowerCase().includes('conflict') ||
        item.description?.toLowerCase().includes('crisis')
      );

      if (hasThreatKeyword) {
        setAlertMessage('Potential high-threat item detected in global news');
        if (Notification.permission === 'granted') {
          new Notification('Sentinel Nexus Alert', {
            body: 'Keywords indicating possible threat found in news feed'
          });
        }
      } else {
        setAlertMessage('');
      }
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    // Request notification permission
    if (!("Notification" in window)) return;
    Notification.requestPermission();

    // Load Twitter/X widgets script once
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const memoizedMarkers = useMemo(() => markers, [markers]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Map takes most of the screen */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
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
      <div
        style={{
          width: '340px',
          background: '#f9fbfd',
          borderLeft: '1px solid #d1d9e0',
          padding: '16px',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.4rem' }}>Sentinel Nexus</h2>

        {/* News */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>BBC World News</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {news.slice(0, 8).map((item, i) => (
              <li
                key={i}
                style={{
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #eee'
                }}
              >
                <strong style={{ lineHeight: 1.4 }}>{item.title}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* Threats */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Recent Malware Samples</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {threats.slice(0, 6).map((t, i) => (
              <li
                key={i}
                style={{ marginBottom: '8px', fontSize: '0.95rem' }}
              >
                {t.signature || 'Sample'} • {t.first_seen?.substring(0, 10) || '—'}
              </li>
            ))}
          </ul>
        </section>

        {/* X Timelines */}
        <section>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Live X Feeds</h3>

          {/* BBC Breaking */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '420px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
              <a
                className="twitter-timeline"
                href="https://twitter.com/BBCBreaking"
                data-height="420"
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
              >
                Tweets by BBCBreaking
              </a>
            </div>
          </div>

          {/* Reuters */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '420px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
              <a
                className="twitter-timeline"
                href="https://twitter.com/Reuters"
                data-height="420"
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
              >
                Tweets by Reuters
              </a>
            </div>
          </div>

          {/* Bellingcat (OSINT) */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '420px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
              <a
                className="twitter-timeline"
                href="https://twitter.com/bellingcat"
                data-height="420"
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
              >
                Tweets by bellingcat
              </a>
            </div>
          </div>

          {/* Optional: add more by copying the pattern above */}
        </section>

        {/* Weather & Alert */}
        <section style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Equator Reference Weather</h3>
          <p style={{ margin: '0 0 12px 0' }}>
            {weather
              ? `Temperature: ${weather.current_weather.temperature} °C   •   Wind: ${weather.current_weather.windspeed} km/h`
              : 'Loading...'}
          </p>

          {alertMessage && (
            <p style={{
              color: '#c53030',
              fontWeight: 600,
              background: '#fff5f5',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #feb2b2'
            }}>
              {alertMessage}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
