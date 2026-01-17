const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=global+threats&apiKey=${process.env.NEWS_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/threats', async (req, res) => {
  try {
    const response = await axios.get(`https://www.abuseipdb.com/check/8.8.8.8/json?key=${process.env.ABUSEIPDB_KEY}&days=30`); // Example IP
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
