import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CesiumProvider } from 'resium';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import L from 'leaflet';

const DEFCON_INFO = {
  1: { name: 'COCKED PISTOL', desc: 'Maximum force readiness — Nuclear war imminent', color: '#f85149' },
  2: { name: 'FAST PACE', desc: 'Armed Forces ready to deploy and engage in 6 hours', color: '#db6d28' },
  3: { name: 'ROUND HOUSE', desc: 'Air Force ready to mobilize in 15 minutes', color: '#d29922' },
  4: { name: 'DOUBLE TAKE', desc: 'Increased intelligence watch and strengthened security', color: '#58a6ff' },
  5: { name: 'FADE OUT', desc: 'Lowest state of readiness — Normal peacetime', color: '#3fb950' }
};

// Mock/real data from tools (replace with real fetches)
const MOCK_POLYMARKET = [
  { title: "US strikes Iran by June 30?", odds: 53, volume: "61k", weight: 15 },
  // ... (add all from tool result)
];

const MOCK_MARKETS = {
  sp500: { value: '6,944.47', change: 0.26, label: 'S&P 500' },
  nasdaq: { value: '23,530.02', change: 0.25, label: 'NASDAQ' },
  dow: { value: '49,442.44', change: 0.60, label: 'DOW' },
  btc: { value: '$95,100.00', change: -1.00, label: 'BTC' }
};

const MOCK_COMMODITIES = {
  gold: { value: '4,595.40', change: -0.61, label: 'Gold' },
  oil: { value: '59.44', change: +0.42, label: 'Crude Oil' },
  vix: { value: '15.84', change: -5.43, label: 'VIX' },
  silver: { value: '88.537', change: -4.13, label: 'Silver' }
};

const MOCK_NEWS_WORLD = [
  { time: 'Now', source: 'WEF', text: 'Geoeconomic confrontation, interstate conflict and extreme weather emerge as top risks...' },
  // ... (add from web_search results)
];

const MOCK_NEWS_GOV = [
  { time: 'Now', source: 'Faces & Voices', text: 'From federal budget negotiations to evolving public health guidelines...' },
  // ... (add from results)
];

const MOCK_NEWS_TECH = [
  { time: 'Now', source: 'Reuters', text: 'AI themes to watch in 2026: Big funding, but not yet full IPO boom...' },
  // ... (add from results)
];

const MOCK_NEWS_INTEL = [
  { time: '12:45', source: '@visegrad24', text: 'Idiocracy is one of the greatest documentaries ever made!' },
  // ... (add all X posts from tool)
];

const CITIES = [
  { name: 'CARACAS', country: 'Venezuela', coords: [10.48, -66.87], type: 'critical', population: '2.9M', intel: 'Maduro ousted and on trial in US; regime change ongoing.', polymarket: 'Stable transition: 45%' },
  // ... (all from HTML)
];

function App() {
  const [data, setData] = useState({
    polymarket: MOCK_POLYMARKET,
    markets: MOCK_MARKETS,
    commodities: MOCK_COMMODITIES,
    news: {
      world: MOCK_NEWS_WORLD,
      gov: MOCK_NEWS_GOV,
      tech: MOCK_NEWS_TECH,
      intel: MOCK_NEWS_INTEL
    }
  });
  const [defconLevel, setDefconLevel] = useState(3);
  const [threatScore, setThreatScore] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [ships, setShips] = useState([]);
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    setIsLoading(false); // For demo; in real, fetch data
  }, []);

  const calculateDefcon = useMemo(() => {
    let ts = 0;
    data.polymarket.forEach(p => ts += (p.odds / 100) * p.weight);
    setThreatScore(ts);
    return ts >= 80 ? 1 : ts >= 60 ? 2 : ts >= 40 ? 3 : ts >= 20 ? 4 : 5;
  }, [data.polymarket]);

  useEffect(() => {
    setDefconLevel(calculateDefcon);
  }, [calculateDefcon]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <header className="header">
          <div className="logo">PULSE</div>
          <div className="status">
            <div className="status-dot"></div>
            OPERATIONAL
          </div>
          <div className="header-time"> {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC </div>
        </header>
        <div className="defcon-bar">
          <span className="defcon-label">DEFCON STATUS</span>
          <div className="defcon-levels">
            {[1,2,3,4,5].map(l => (
              <div className={`defcon-level defcon-${l} ${defconLevel === l ? 'active' : ''}`} key={l}>
                {l}
              </div>
            ))}
          </div>
          <div className="defcon-info">
            <div className="defcon-name" style={{ color: DEFCON_INFO[defconLevel].color }}>
              {DEFCON_INFO[defconLevel].name}
            </div>
            <div className="defcon-desc">{DEFCON_INFO[defconLevel].desc}</div>
          </div>
          <div className="threat-score">THREAT INDEX: {threatScore.toFixed(1)}</div>
        </div>
        <main className="main">
          {isLoading ? (
            <div className="loading">
              <div className="loading-logo">PULSE</div>
              <div className="loading-bar"><div className="loading-fill"></div></div>
            </div>
          ) : (
            <div className="grid">
              {/* Panels */}
              <article className="panel panel--wide">
                <header className="panel-header">
                  <div className="panel-title">Global Situation Map</div>
                </header>
                <div className="panel-content">
                  <CesiumProvider>
                    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {markers.map((m, i) => (
                        <Marker key={i} position={m.position}>
                          <Popup>{m.popup}</Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </CesiumProvider>
                </div>
              </article>
              {/* Add more panels like in HTML, using data */}
              {/* Example: Polymarket */}
              <article className="panel">
                <header className="panel-header">
                  <div className="panel-title">Polymarket Geopolitical Odds</div>
                </header>
                <div className="panel-content">
                  {data.polymarket.map(p => (
                    <div key={p.title}>
                      {p.title} - {p.odds}% ({p.volume})
                    </div>
                  ))}
                </div>
              </article>
              {/* Similar for markets, commodities, news categories */}
            </div>
          )}
        </main>
      </div>
    </DndProvider>
  );
}

export default App;
