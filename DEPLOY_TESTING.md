# Boss testing deployment

Use Vercel for the frontend, Render for the backend, and a separate MongoDB Atlas database for test data.

## Render backend

The repository includes `render.yaml`. After pushing these changes to your connected repository, create a Render Blueprint from it. It defines the backend service and generates the two JWT secrets. Enter your Atlas connection string and Vercel origin in Render when prompted. If you already created the backend service manually, update that service using the settings below instead of creating a duplicate.

Create a Node web service from this repository:

- Root directory: `nexnon-backend`
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm start`
- Health check: `/health`

Set these environment variables in Render, not in committed files:

| Variable | Value |
| --- | --- |
| NODE_ENV | production |
| MONGODB_URI | Your Atlas connection string, with a database user and test database |
| JWT_ACCESS_SECRET | A unique random secret |
| JWT_REFRESH_SECRET | A different unique random secret |
| FRONTEND_URL | Your exact Vercel origin, such as https://your-app.vercel.app (no trailing slash) |

Allow the backend's outbound addresses in Atlas Network Access. Render supplies PORT automatically.

## Vercel frontend

- Root directory: `nexnon-frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/v1`.
- Set `VITE_ENABLE_DEMO_MODE=false` to load persisted classes instead of the mock catalogue.
- Redeploy after changing these variables; Vite embeds them during the build.

The included vercel.json routes direct page visits back to the React app.

## Acceptance checks after deployment

1. Open the backend `/health` URL and confirm it responds.
2. Open and refresh `/browse`, `/categories`, and `/teach` directly on Vercel.
3. Register an instructor test account, create and publish a free test class.
4. In another browser profile, register a student and confirm the class appears.
5. Open the class, enroll, and check My Classes after refreshing and signing in again.
6. Check the instructor dashboard for the enrollment.

Local API integration tests pass for signup/login, class publishing, search, category counts, ownership checks, free enrollment, duplicate enrollment prevention, classroom access, notifications, and instructor dashboard data. Live deployment and browser workflow checks remain pending.

## Current test limitations

Use free classes and disposable test data for the initial review. Paid enrollment now rejects requests without a real configured payment method. The frontend does not yet collect a Stripe payment method, so use free classes for the initial test. Live meeting creation requires Zoom configuration. Password recovery, instructor approval, and several dashboard actions remain incomplete, as detailed in codebasestate.md. This is a test deployment, not a production-readiness sign-off.

Deployment references: https://render.com/docs/deploy-node-express-app and https://vercel.com/docs/rewrites

## Demo catalogue and Atlas transfer

Local setup now contains 17 published free courses, owned by Demo Teacher. Run `npm run seed:catalog` in the backend to create missing demo courses without duplicating existing ones. All 16 added courses have full detail content and three scheduled sessions; no Zoom meetings or payments are created.

To move the demo to Atlas, create an ignored `nexnon-backend/.env.deploy.local` file containing `ATLAS_DEMO_URI=<your Atlas URI with database nexnoon_demo>`. With local MongoDB running, execute `npm run demo:atlas -- --confirm-demo-import` from the backend. This copies only the two demo accounts, teacher-owned classes, schedules, and their enrollments. Existing records are preserved; account identity conflicts stop the import. Local demo passwords remain valid in Atlas. Do not commit this environment file.

Set Render MONGODB_URI to the same Atlas nexnoon_demo database. Set FRONTEND_URL to your Vercel origin, then set Vercel VITE_API_BASE_URL to the Render URL plus /v1 and redeploy the frontend. The import is manual, never part of normal application startup. It has not yet been run against Atlas.
