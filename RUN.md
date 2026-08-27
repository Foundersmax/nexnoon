# Nexnoon – Run & Test (Local & Production-Ready)

This guide gets backend and frontend in sync so you can run and test locally, then go live.

---

## Ports

| Service   | Port | URL (local)                    |
|----------|------|---------------------------------|
| Backend  | 4000 | http://localhost:4000           |
| Frontend | 5173 | http://localhost:5173           |

API base URL for frontend: **http://localhost:4000/v1**

---

## 1. Prerequisites

- **Node.js** 18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- (Optional) Stripe, SMTP, Zoom for full features

---

## 2. Backend Setup

```bash
cd nexnon-backend
npm install
```

**Env:**

- Copy **`env.example`** to **`.env`** in the same folder.
- Edit `.env` and set at least:
  - `MONGODB_URI` (e.g. `mongodb://localhost:27017/nexnon` or Atlas URI)
  - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (use strong random strings in production)
  - `FRONTEND_URL=http://localhost:5173` for local dev

**Start:**

```bash
npm run dev
```

You should see:

- `MongoDB connected`
- `Nexnon API running on http://localhost:4000`
- `API v1: http://localhost:4000/v1`

**Check:** open http://localhost:4000/health → `{"success":true,"data":{"status":"ok"}}`

---

## 3. Frontend Setup

In a **new terminal**:

```bash
cd nexnon-frontend
npm install
```

**Env:**

- Copy **`env.example`** to **`.env`** in the same folder.
- For local backend, set:
  - `VITE_API_BASE_URL=http://localhost:4000/v1`
  - `VITE_ENABLE_DEMO_MODE=false` to use the real API
- (Optional) `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` for Stripe

**Start:**

```bash
npm run dev
```

Open http://localhost:5173 and use the app (login, signup, classes) against the backend.

---

## 4. Run Order (Local Test)

1. Start **MongoDB** (if local).
2. Start **backend**: `cd nexnon-backend && npm run dev`.
3. Start **frontend**: `cd nexnon-frontend && npm run dev`.
4. Use **http://localhost:5173** in the browser.

---

## 5. Env Files Summary

### Backend (nexnon-backend)

| Variable              | Required | Description |
|-----------------------|----------|-------------|
| `NODE_ENV`           | No       | `development` or `production` |
| `PORT`               | No       | Default `4000` |
| `MONGODB_URI`        | Yes      | MongoDB connection string |
| `JWT_ACCESS_SECRET`  | Yes      | Strong random secret (prod) |
| `JWT_REFRESH_SECRET` | Yes      | Strong random secret (prod) |
| `FRONTEND_URL`       | Yes      | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `STRIPE_SECRET_KEY`  | No       | Backend Stripe secret (or demo mode) |
| `STRIPE_WEBHOOK_SECRET` | No    | Stripe webhook signing secret |
| `EMAIL_FROM`, `SMTP_*` | No     | Email (optional) |
| `ZOOM_*`             | No       | Zoom (optional) |

Template: **`nexnon-backend/env.example`** → copy to **`nexnon-backend/.env`**.

### Frontend (nexnon-frontend)

| Variable                     | Required | Description |
|-----------------------------|----------|-------------|
| `VITE_API_BASE_URL`         | Yes*     | Backend API base, e.g. `http://localhost:4000/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No    | Stripe publishable key (frontend) |
| `VITE_ENABLE_DEMO_MODE`     | No       | `true` = mock data, `false` = real API |
| `VITE_ZOOM_*`, `VITE_AGORA_*` | No     | Live/video (optional) |

\* If `VITE_ENABLE_DEMO_MODE=true`, API URL is not used for core demo flows.

Template: **`nexnon-frontend/env.example`** → copy to **`nexnon-frontend/.env`**.

---

## 6. Production Checklist

- [ ] **Backend:** `NODE_ENV=production`, strong `JWT_*` secrets, production `MONGODB_URI`, `FRONTEND_URL` = production frontend URL.
- [ ] **Frontend:** `VITE_API_BASE_URL` = production API URL (e.g. `https://api.yourdomain.com/v1`), `VITE_ENABLE_DEMO_MODE=false`, `VITE_STRIPE_PUBLISHABLE_KEY` if using Stripe.
- [ ] **CORS:** Backend uses `FRONTEND_URL` as allowed origin in production.
- [ ] **Secrets:** Never commit `.env`; use `env.example` as the template only.
- [ ] **Stripe:** Backend has `STRIPE_SECRET_KEY` (and webhook secret if using webhooks); frontend has publishable key only.

---

## 7. API Endpoints (v1)

All API routes are under **`/v1`**:

- `GET /health` – health check (no `/v1`)
- `POST /v1/auth/signup`, `POST /v1/auth/login`, `GET /v1/auth/me`, etc.
- `GET /v1/classes`, `GET /v1/classes/:id`, etc.
- `POST /v1/enrollments`, etc.
- `GET /v1/reviews`, etc.

Frontend is configured to use `VITE_API_BASE_URL` (e.g. `http://localhost:4000/v1`) for all of these.

---

## 8. End-to-end flow: create class → enroll → pay

1. **Create live class (instructor)**  
   Sign up or log in as **instructor**, go to **Teach** or **Create Class**. Fill in title, description, category, level, price, duration, total sessions, and start date/time. On **Publish Class**, the frontend calls `POST /v1/classes`; the backend creates the class and, if Zoom env is set, creates Zoom meetings for each session.

2. **Browse / class detail**  
   **Browse** and **Class Detail** can load classes from the API. Class detail uses the class id in the URL; **Enroll** goes to `/payment/:id`.

3. **Payment / enrollment**  
   On **Payment**, the frontend loads the class by id from the API and shows price and summary. **Complete Payment** calls `POST /v1/enrollments` with `{ classId }`. With Stripe keys set, you can later add `paymentMethodId` for real charges; without it, the backend completes enrollment in demo mode.

4. **Live sessions**  
   Enrolled students see the class in **My Classes**. Session schedule and Zoom links (if configured) come from the backend class schedule.
