import React, { useState, useEffect, useRef } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

const DEFCON_INFO = {
  1: { name: 'COCKED PISTOL', desc: 'Maximum force readiness — Nuclear war imminent', color: '#f85149' },
  2: { name: 'FAST PACE', desc: 'Armed Forces ready to deploy and engage in 6 hours', color: '#db6d28' },
  3: { name: 'ROUND HOUSE', desc: 'Air Force ready to mobilize in 15 minutes', color: '#d29922' },
  4: { name: 'DOUBLE TAKE', desc: 'Increased intelligence watch and strengthened security', color: '#58a6ff' },
  5: { name: 'FADE OUT', desc: 'Lowest state of readiness — Normal peacetime', color: '#3fb950' }
};

const COUNTRY_COLORS = {
  US: '#58a6ff66', RU: '#d2992266', CN: '#d2992266', IR: '#f8514966',
  UA: '#f8514966', IL: '#f8514966', KP: '#f8514966', TW: '#db6d2866',
  VE: '#f8514966', PS: '#f8514966', SY: '#f8514966', SD: '#db6d2866',
  ER: '#db6d2866', AF: '#f8514966', LB: '#f8514966', YE: '#f8514966',
};

const CITIES = [
  { name: 'CARACAS', coords: [10.48, -66.87], type: 'critical' },
  { name: 'TEHRAN', coords: [35.69, 51.39], type: 'critical' },
  { name: 'KYIV', coords: [50.45, 30.52], type: 'critical' },
  { name: 'GAZA', coords: [31.5, 34.47], type: 'critical' },
  { name: 'DAMASCUS', coords: [33.51, 36.29], type: 'critical' },
  { name: 'KHARTOUM', coords: [15.5, 32.56], type: 'elevated' },
  { name: 'ASMARA', coords: [15.34, 38.93], type: 'elevated' },
  { name: 'TAIPEI', coords: [25.03, 121.57], type: 'elevated' },
  { name: 'BEIJING', coords: [39.90, 116.41], type: 'watch' },
  { name: 'MOSCOW', coords: [55.76, 37.62], type: 'watch' },
];

function App() {
  const mapRef = useRef(null);
  const [defconLevel, setDefconLevel] = useState(4);
  const [threatScore, setThreatScore] = useState(35);
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new jsVectorMap({
        selector: '#world-map',
        map: 'world',
        backgroundColor: 'transparent',
        zoomOnScroll: true,
        zoomButtons: false,
        regionStyle: {
          initial: { fill: '#1a2332', stroke: '#2d3a4d', strokeWidth: 0.4 },
          hover: { fill: '#243040', cursor: 'pointer' }
        },
        markers: CITIES.map(c => ({
          name: c.name,
          coords: c.coords,
          style: { fill: DEFCON_INFO[defconLevel].color }
        })),
        markerStyle: {
          initial: { r: 6, strokeWidth: 2, stroke: '#0d1117' },
          hover: { r: 8, strokeWidth: 3 }
        },
        labels: {
          markers: { render: m => m.name }
        }
      });

      Object.keys(COUNTRY_COLORS).forEach(code => {
        if (mapRef.current.regions[code]) {
          mapRef.current.regions[code].element.shape.setStyle('fill', COUNTRY_COLORS[code]);
        }
      });
    }

    const loadData = () => {
      setNews([
        { time: '11:30', source: 'OSINT', text: 'Multiple indicators of elevated activity in Middle East' },
        { time: '11:15', source: 'Reuters', text: 'Geopolitical risk premium rising in energy markets' },
        { time: '10:45', source: 'Bellingcat', text: 'New satellite imagery analysis of border region' }
      ]);

      const score = 35 + Math.floor(Math.random() * 40);
      setThreatScore(score);
      const level = score >= 80 ? 1 : score >= 60 ? 2 : score >= 40 ? 3 : score >= 20 ? 4 : 5;
      setDefconLevel(level);

      setIsLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeDefcon = DEFCON_INFO[defconLevel] || DEFCON_INFO[4];

  return (
    <div className="app-container">
      <div className={`loading ${!isLoading ? 'hidden' : ''}`}>
        <div className="loading-logo">PULSE</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>

      <header className="header">
        <div className="header-left">
          <div className="logo">PULSE</div>
          <div className="status"><span className="status-dot"></span>OPERATIONAL</div>
        </div>
        <div className="header-time">
          {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })} UTC
        </div>
      </header>

      <div className="defcon-bar">
        <span className="defcon-label">DEFCON STATUS</span>
        <div className="defcon-levels">
          {[1,2,3,4,5].map(l => (
            <div
              key={l}
              className={`defcon-level defcon-${l} ${defconLevel === l ? 'active' : ''}`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="defcon-info">
          <div className="defcon-name" style={{ color: activeDefcon.color }}>
            {activeDefcon.name}
          </div>
          <div className="defcon-desc">{activeDefcon.desc}</div>
        </div>
        <div className="threat-score">THREAT INDEX: {threatScore}</div>
      </div>

      <main className="main">
        <div className="grid">
          <article className="panel panel--wide">
            <header className="panel-header">
              <div className="panel-title">Global Situation Map</div>
              <span className="panel-badge live-data">LIVE</span>
            </header>
            <div className="panel-content">
              <div className="map-container">
                <div id="world-map" style={{ width: '100%', height: '520px' }}></div>
                <div className="map-overlay">
                  <div className="map-grid"></div>
                  <div className="map-scanline"></div>
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <header className="panel-header">
              <div className="panel-title">Priority Intelligence Feed</div>
            </header>
            <div className="panel-content">
              {news.map((item, i) => (
                <div key={i} className="feed-item">
                  <span className="feed-time">{item.time}</span>
                  <div className="feed-body">
                    <div className="feed-source">{item.source}</div>
                    <div className="feed-text">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </main>

      <style jsx global>{`
        :root {
          --bg-primary: #0a0c10;
          --bg-secondary: #0d1117;
          --bg-tertiary: #161b22;
          --bg-panel: #0d1117;
          --text-primary: #e6edf3;
          --text-secondary: #8b949e;
          --text-muted: #484f58;
          --accent-green: #3fb950;
          --accent-blue: #58a6ff;
          --accent-cyan: #39c5cf;
          --accent-yellow: #d29922;
          --accent-orange: #db6d28;
          --accent-red: #f85149;
          --border-color: #30363d;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          margin: 0;
        }

        .loading {
          position: fixed;
          inset: 0;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s;
        }

        .loading.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .loading-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: 0.5em;
          color: var(--accent-green);
          text-shadow: 0 0 30px rgba(63,185,80,0.5);
        }

        .loading-bar {
          width: 200px;
          height: 2px;
          background: var(--bg-tertiary);
          margin-top: 30px;
          overflow: hidden;
          border-radius: 1px;
        }

        .loading-fill {
          height: 100%;
          background: var(--accent-green);
          animation: load 2s ease-out forwards;
        }

        @keyframes load {
          0% { width: 0; }
          100% { width: 100%; }
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--accent-green);
        }

        .status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(63,185,80,0.1);
          border: 1px solid rgba(63,185,80,0.3);
          border-radius: 4px;
          font-family: 'JetBrains Mono';
          font-size: 0.7rem;
          color: var(--accent-green);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .defcon-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          padding: 12px 20px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
        }

        .defcon-label {
          font-family: 'JetBrains Mono';
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .defcon-levels {
          display: flex;
          gap: 4px;
        }

        .defcon-level {
          padding: 6px 14px;
          font-family: 'JetBrains Mono';
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 4px;
          opacity: 0.3;
          border: 1px solid transparent;
          transition: all 0.3s;
        }

        .defcon-level.active {
          opacity: 1;
          animation: defcon-pulse 2s infinite;
        }

        @keyframes defcon-pulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; }
          50% { box-shadow: 0 0 10px 2px currentColor; }
        }

        .defcon-1 { background: rgba(248,81,73,0.2); color: var(--accent-red); border-color: var(--accent-red); }
        .defcon-2 { background: rgba(219,109,40,0.2); color: var(--accent-orange); border-color: var(--accent-orange); }
        .defcon-3 { background: rgba(210,153,34,0.2); color: var(--accent-yellow); border-color: var(--accent-yellow); }
        .defcon-4 { background: rgba(88,166,255,0.2); color: var(--accent-blue); border-color: var(--accent-blue); }
        .defcon-5 { background: rgba(63,185,80,0.2); color: var(--accent-green); border-color: var(--accent-green); }

        .defcon-info {
          text-align: center;
        }

        .defcon-name {
          font-family: 'JetBrains Mono';
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .defcon-desc {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .threat-score {
          font-family: 'JetBrains Mono';
          font-size: 0.7rem;
          color: var(--text-muted);
          padding: 4px 10px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }

        .main {
          padding: 16px;
          max-width: 1800px;
          margin: 0 auto;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
        }

        .panel--wide {
          grid-column: span 2;
        }

        .panel {
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }

        .panel-title {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .panel-badge {
          padding: 2px 6px;
          background: var(--accent-red);
          color: #fff;
          font-family: 'JetBrains Mono';
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 3px;
          animation: pulse 1.5s infinite;
        }

        .panel-badge.live-data {
          background: var(--accent-cyan);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .map-container {
          position: relative;
          height: 520px;
          background: linear-gradient(180deg, #0d1520 0%, #080a0f 100%);
        }

        #world-map {
          width: 100%;
          height: 100%;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .map-scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(63,185,80,0.4) 50%, transparent 100%);
          animation: scan 6s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .map-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(63,185,80,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(63,185,80,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .feed-item {
          display: flex;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          border-left: 3px solid var(--accent-blue);
          transition: all 0.2s;
        }

        .feed-item:hover {
          background: var(--bg-tertiary);
        }

        .feed-time {
          font-family: 'JetBrains Mono';
          font-size: 0.7rem;
          color: var(--text-muted);
          flex-shrink: 0;
          width: 45px;
        }

        .feed-source {
          font-size: 0.7rem;
          color: var(--accent-blue);
          margin-bottom: 2px;
        }

        .feed-text {
          font-size: 0.8rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .error {
          background: rgba(248,81,73,0.1);
          border: 1px solid rgba(248,81,73,0.3);
          color: #f85149;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default App;
