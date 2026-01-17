# Sentinel Nexus

A simplified global monitoring dashboard mimicking a defense app. Built with React (frontend) and Node/Express (backend) using free APIs.

## Setup Instructions
1. Sign up for free API keys:
   - NewsAPI.org: https://newsapi.org/ (for news feeds).
   - AbuseIPDB: https://www.abuseipdb.com/register (for threat data).
2. In backend/.env, add your keys:
NEWS_API_KEY=your_newsapi_key
ABUSEIPDB_KEY=your_abuseipdb_key
text(Create .env via GitHub web, but note: .env won't be committed if you add it to .gitignore).

3. Local Run:
- Install Node.js locally.
- Clone repo.
- `cd frontend && npm install && npm start` (runs on http://localhost:3000).
- `cd backend && npm install && node server.js` (runs on http://localhost:5000).

4. Deployment: See deploy/vercel.json for config. Deploy to Vercel by importing this GitHub repo.

## Structure
- frontend/: React app.
- backend/: Express server.
- docs/: Diagrams (empty for now).
- deploy/: Deployment configs.

## APIs
- Maps: OpenStreetMap.
- News: NewsAPI.org.
- Weather: Open-Meteo.
- Threats: AbuseIPDB.
