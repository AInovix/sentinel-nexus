const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const parseString = require('xml2js').parseString;
const NodeCache = require('node-cache');

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 min

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Batched endpoint for perf
app.get('/api/dashboard', async (req, res) => {
  try {
    const [news, threats, xAlerts, weather] = await Promise.all([
      getNews(),
      getThreats(),
      getXAlerts(),
      getWeather(req.query.lat || 0, req.query.lon || 0)
    ]);
    res.json({ news, threats, xAlerts, weather });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

async function getNews() {
  const cacheKey = 'news';
  let data = cache.get(cacheKey);
  if (data) return data;

  const rssUrl = 'http://feeds.bbci.co.uk/news/world/rss.xml';
  const response = await axios.get(rssUrl);
  let items = [];
  parseString(response.data, (err, result) => {
    if (!err) {
      items = result.rss.channel[0].item.map(i => ({
        title: i.title[0],
        description: i.description[0],
        link: i.link[0]
      }));
    }
  });
  cache.set(cacheKey, items);
  return items;
}

async function getThreats() {
  const cacheKey = 'threats';
  let data = cache.get(cacheKey);
  if (data) return data;

  // MalwareBazaar recent samples (keyless POST)
  const response = await axios.post('https://mb-api.abuse.ch/api/v1/', new URLSearchParams({ query: 'get_recent', selector: 'time', limit: 5 }));
  const threats = response.data.data || [];
  cache.set(cacheKey, threats);
  return threats;
}

async function getXAlerts() {
  const cacheKey = 'xAlerts';
  let data = cache.get(cacheKey);
  if (data) return data;

  const query = 'global threats OR security alerts';
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=5&tweet.fields=created_at,text`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
  });
  const alerts = response.data.data || [];
  cache.set(cacheKey, alerts);
  return alerts;
}

async function getWeather(lat, lon) {
  const cacheKey = `weather_${lat}_${lon}`;
  let data = cache.get(cacheKey);
  if (data) return data;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await axios.get(url);
  data = response.data;
  cache.set(cacheKey, data);
  return data;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
