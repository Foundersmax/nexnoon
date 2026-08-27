# Nexnoon – Live Online Learning Platform

Full-stack app: **nexnon-backend** (Node/Express/MongoDB) + **nexnon-frontend** (React/Vite).

## Quick start

1. **See [RUN.md](./RUN.md)** for:
   - Env setup (copy `env.example` → `.env` in both apps)
   - Run order: MongoDB → backend → frontend
   - Ports: backend **4000**, frontend **5173**
   - API base URL: `http://localhost:4000/v1`

2. **Backend:** `cd nexnon-backend` → copy `env.example` to `.env` → `npm install` → `npm run dev`  
3. **Frontend:** `cd nexnon-frontend` → copy `env.example` to `.env` → `npm install` → `npm run dev`  
   (Windows: `Copy-Item env.example .env`; Mac/Linux: `cp env.example .env`)  
4. Open **http://localhost:5173**

## Production

- Backend: set `NODE_ENV=production`, strong JWT secrets, production `MONGODB_URI`, `FRONTEND_URL`.
- Frontend: set `VITE_API_BASE_URL` to your API URL, `VITE_ENABLE_DEMO_MODE=false`.
- Details and checklist: **[RUN.md](./RUN.md)**.
