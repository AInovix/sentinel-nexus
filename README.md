# Sentinel Nexus

A simplified global monitoring dashboard mimicking a defense app. Built with React (frontend) and Node/Express (backend) using free APIs.

## Setup Instructions
1. Local Run:
- Install Node.js locally.
- Clone repo.
- `cd frontend && npm install && npm start` (runs on http://localhost:3000).
- `cd backend && npm install && node server.js` (runs on http://localhost:5000).

2. Deployment: See deploy/vercel.json for config. Deploy to Vercel by importing this GitHub repo.

## Structure
- frontend/: React app.
- backend/: Express server.
- docs/: Diagrams (empty for now).
- deploy/: Deployment configs.

## APIs (All Keyless Except X)
- Maps: OpenStreetMap.
- News: BBC RSS (keyless).
- Threats: MalwareBazaar (keyless).
- Weather: Open-Meteo (keyless).
  
## X Alerts
Now uses official keyless embed from publish.twitter.com (no token needed).  
Displays public timeline (e.g., @BBCBreaking for breaking global news/alerts).  
To change: Go to https://publish.twitter.com/, enter profile URL (e.g., https://twitter.com/BBCBreaking), customize, copy code, and update the embed HTML in App.js.
