import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

import 'leaflet/dist/leaflet.css';

function App() {
  const [news, setNews] = useState([]);
  const [threats, setThreats] = useState([]);
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const newsRes = await axios.get('/api/news');
      setNews(newsRes.data.articles || []);
      
      const threatsRes = await axios.get('/api/threats');
      setThreats(threatsRes.data || []);
      
      const weatherRes = await axios.get('/api/weather?lat=0&lon=0'); // Global example
      setWeather(weatherRes.data);
      
      // Simple markers from news (hardcoded locations for demo)
      const newMarkers = newsRes.data.articles.map((article, i) => ({
        position: [i * 10, i * 10], // Fake positions; in real, use geocoding
        popup: article.title
      }));
      setMarkers(newMarkers);

      // Run predictions
      predictThreats(newsRes.data.articles);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const predictThreats = async (articles) => {
    // Simple TF.js example: Load MobileNet and classify text (adapted for sentiment)
    // For real sentiment, use a proper model; this is a placeholder
    const model = await tf.loadLayersModel('https://tfhub.dev/google/tfjs-model/nnlm-en-dim50/2/default/1', { fromTFHub: true });
    const texts = articles.map(a => a.description || '');
    const predictions = await model.predict(tf.tensor2d(texts.map(t => t.split(' ')))); // Simplified
    const highThreat = predictions.dataSync().some(p => p > 0.5); // Fake threshold
    if (highThreat) {
      setAlertMessage('High threat detected!');
      if (Notification.permission === 'granted') {
        new Notification('Sentinel Alert', { body: 'High threat in news!' });
      }
    }
  };

  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((m, i) => (
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
        <h2>Threats</h2>
        <ul>
          {threats.map((t, i) => <li key={i}>{t.ipAddress} - {t.abuseConfidenceScore}% threat</li>)}
        </ul>
        <h2>Weather Alert</h2>
        <p>{weather ? `Temp: ${weather.current_weather.temperature}°C` : 'Loading...'}</p>
        {alertMessage && <p style={{ color: 'red' }}>{alertMessage}</p>}
      </div>
    </div>
  );
}

export default App;
