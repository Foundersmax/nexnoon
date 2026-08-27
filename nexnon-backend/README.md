## Nexnon Backend (Node.js + MongoDB + Stripe + Email + Zoom)

This folder contains a production-ready backend implementation for the Nexnon front-end app.  
It matches the API contracts described in the front-end `API_INTEGRATION_GUIDE.md` and powers:

- **Authentication** (JWT access/refresh, email verification, password reset)
- **Classes & Schedules** (with Zoom links for live sessions)
- **Enrollments** (students joining classes)
- **Reviews** (course ratings & comments)
- **Payments via Stripe** (for class enrollments)

### 1. Tech Stack

- **Runtime**: Node.js (Express)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (access + refresh tokens)
- **Payments**: Stripe Payment Intents
- **Email**: Nodemailer (SMTP)
- **Live classes**: Zoom Server-to-Server OAuth (with graceful fallback to demo links)

---

### 2. Project Structure

```text
nexnon-backend/
├── package.json
├── tsconfig.json
├── src/
│   ├── app.ts                 # Express app wiring & middlewares
│   ├── server.ts              # Server bootstrap & DB connection
│   ├── config/
│   │   ├── env.ts             # Environment variables
│   │   └── db.ts              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.ts            # JWT auth + role guard
│   │   └── errorHandler.ts    # Global error handler
│   ├── models/
│   │   ├── User.ts            # Users (student/instructor/admin)
│   │   ├── Class.ts           # Classes & ClassSchedule
│   │   ├── Enrollment.ts      # Enrollments
│   │   ├── Review.ts          # Reviews
│   │   └── Payment.ts         # Stripe payment records
│   ├── routes/
│   │   ├── auth.routes.ts     # /auth/*
│   │   ├── class.routes.ts    # /classes/*
│   │   ├── enrollment.routes.ts # /enrollments/*
│   │   └── review.routes.ts   # /reviews/*
│   └── utils/
│       ├── jwt.ts             # JWT helpers
│       ├── email.ts           # Email helpers (password reset, verify email)
│       └── zoom.ts            # Zoom meeting creation helper
```

---

### 3. Environment Variables

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

Create `.env` file in `nexnon-backend` (copy from `.env.example`):

```env
# Core
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/nexnon

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx        # from Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxx      # optional (for webhooks if you add them)

# Email (SMTP)
EMAIL_FROM="Nexnon <no-reply@nexnon.com>"
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass

# Frontend base URL (for links in emails)
FRONTEND_URL=http://localhost:5173

# Zoom (optional – enables real meeting creation)
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

If **Stripe**, **SMTP**, or **Zoom** variables are missing, the backend falls back to **demo-safe behavior**:

- Stripe missing → enrollments are marked as paid in “demo mode”
- SMTP missing → emails are logged/skipped instead of sent
- Zoom missing → auto-generated **demo Zoom links** are used

---

### 4. Quick Start

**Step 1: Install dependencies**

```bash
cd nexnon-backend
pnpm install        # or npm install / yarn
```

**Step 2: Configure environment**

```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values
# See SETUP_GUIDE.md for detailed instructions
```

**Step 3: Start the server**

```bash
pnpm dev            # or npm run dev
```

The API will be available at:

- `http://localhost:4000`
- Health check: `GET /health`

**📖 Need help setting up MongoDB, Stripe, Email, or Zoom?**  
See the comprehensive **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for step-by-step instructions.

In the front-end `.env`, point `VITE_API_BASE_URL` to this URL (matching the integration guide):

```env
VITE_API_BASE_URL=http://localhost:4000
```

---

### 5. API Overview (Aligned with Front-End Services)

All responses use the same envelope as documented in `API_INTEGRATION_GUIDE.md`:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "errors": []
}
```

#### 5.1 Authentication (`/auth`)

- **POST** `/auth/signup`  
  Body: `{ email, password, firstName, lastName, role? }`  
  Returns: `AuthResponse` (`user`, `token`, `refreshToken`).  
  Sends **email verification** mail.

- **POST** `/auth/login`  
  Body: `{ email, password }`  
  Returns: `AuthResponse`.

- **POST** `/auth/logout`  
  Stateless; front-end just drops tokens. Returns success.

- **POST** `/auth/refresh`  
  Body: `{ refreshToken }`  
  Returns: new `AuthResponse` with rotated tokens.  
  Used by front-end Axios interceptor.

- **GET** `/auth/me`  
  Auth: `Bearer <accessToken>`  
  Returns: current `User` profile.

- **PATCH** `/auth/profile`  
  Auth: `Bearer`  
  Body: partial user `{ firstName?, lastName?, avatar? }`  
  Returns: updated `User`.

- **POST** `/auth/password/reset`  
  Body: `{ email }`  
  Generates **reset token**, stores it on user, and emails reset link to `FRONTEND_URL`.

- **POST** `/auth/password/reset/confirm`  
  Body: `{ token, newPassword }`  
  Verifies token and updates password.

- **POST** `/auth/verify-email`  
  Body: `{ token }`  
  Marks email as verified.

- **POST** `/auth/verify-email/resend`  
  Auth: `Bearer`  
  Generates a new verification token and re-sends email.

These endpoints are consumed by the front-end `authService` and `useAuth` hooks.

---

#### 5.2 Classes & Schedules (`/classes`)

- **GET** `/classes`  
  Query: `page, pageSize, search`  
  Returns: `PaginatedResponse<Class>`.

- **GET** `/classes/search?q=...`  
  Query: `q, page, pageSize`  
  Returns: `PaginatedResponse<Class>`.

- **GET** `/classes/category/:category`  
  Returns: `PaginatedResponse<Class>` in a given category.

- **GET** `/classes/my`  
  Auth: Instructor  
  Returns: logged-in instructor’s classes (`PaginatedResponse<Class>`).

- **GET** `/classes/:id`  
  Returns: a single `Class`.

- **POST** `/classes`  
  Auth: Instructor  
  Body: `CreateClassRequest` (matching front-end type).
  - Creates new class with `status: "draft"`.
  - If `schedule` is provided, each session:
    - is stored in `ClassScheduleModel`
    - optionally gets a **Zoom meeting** created via `utils/zoom.ts`.

- **PATCH** `/classes/:id`  
  Auth: Instructor or Admin  
  Body: `UpdateClassRequest`.  
  Updates class data (including `status`).

- **DELETE** `/classes/:id`  
  Auth: Instructor or Admin  
  Deletes class and its schedule entries.

- **POST** `/classes/:id/deletion-request`  
  Auth: Instructor  
  Simplified: immediately archives the class (`status: "archived"`).

##### Schedules

- **GET** `/classes/:id/schedule`  
  Returns: `ClassSchedule[]` for that class.

- **POST** `/classes/:id/schedule`  
  Auth: Instructor  
  Body: `{ sessionNumber, title, description?, startTime, endTime }`
  - Creates a schedule entry.
  - Uses `createZoomMeeting()` to attach `zoomLink`, `zoomMeetingId`, and `zoomPasscode`.

- **PATCH** `/classes/:id/schedule/:sessionId`  
  Auth: Instructor  
  Partially updates a schedule entry.

- **DELETE** `/classes/:id/schedule/:sessionId`  
  Auth: Instructor  
  Deletes a schedule entry.

##### Class Enrollments & Reviews under `/classes`

- **GET** `/classes/:id/enrollments`  
  Auth: Instructor  
  Returns `PaginatedResponse<Enrollment>` for that class.

- **GET** `/classes/:id/reviews`  
  Returns `PaginatedResponse<Review>` for that class.

---

#### 5.3 Enrollments & Payments (`/enrollments`)

This aligns with `classService.enrollInClass` and `useEnrollInClass`.

- **POST** `/enrollments`  
  Auth: Student  
  Body: `EnrollmentRequest` `{ classId, paymentMethodId? }`  
  Behavior:
  - If `STRIPE_SECRET_KEY` and `paymentMethodId` exist:
    - Creates and confirms a Stripe Payment Intent.
    - Stores a `Payment` document with status `completed` or `pending`.
  - If Stripe is not configured:
    - Creates a **demo** `Payment` record with status `completed`.
  - Creates an `Enrollment` record and increments `Class.enrolledStudents`.
  - Returns the `Enrollment` object.

- **GET** `/enrollments/my`  
  Auth: Student  
  Returns `PaginatedResponse<Enrollment>` for the current user.

- **DELETE** `/enrollments/:id`  
  Auth: Student  
  Marks the enrollment as `status: "dropped"`.

---

#### 5.4 Reviews (`/reviews`)

These endpoints support `classService.createReview`, `updateReview`, and `deleteReview`.

- **POST** `/reviews`  
  Auth: Student  
  Body: `CreateReviewRequest` `{ classId, rating, comment? }`  
  Creates a review and **recomputes** the class `rating` and `reviewsCount`.

- **PATCH** `/reviews/:id`  
  Auth: Owner (same `userId`)  
  Body: `{ rating?, comment? }`  
  Updates an existing review.

- **DELETE** `/reviews/:id`  
  Auth: Owner  
  Deletes a review.

---

### 6. Zoom Integration Details

The `src/utils/zoom.ts` helper:

- If **Zoom env vars** are set, it:
  - Uses **Server-to-Server OAuth** to obtain an access token (`/oauth/token?grant_type=account_credentials`).
  - Creates meetings via `POST https://api.zoom.us/v2/users/me/meetings`.
  - Returns `join_url`, `id`, `password`, which are stored on `ClassSchedule`.

- If Zoom is **not configured**, it:
  - Returns a **static demo meeting** object so the UI still has a join link.

This is enough to power the front-end `LiveSession` page with **real Zoom links** once configured.

---

### 7. Email Flows

The `src/utils/email.ts` helper wraps Nodemailer:

- `sendEmail(to, subject, html)` – sends via your SMTP provider (or logs/skips if not configured).
- `buildPasswordResetEmail(token)` – generates a reset link pointing at `FRONTEND_URL`.
- `buildVerifyEmail(token)` – generates an email verification link at `FRONTEND_URL`.

These are used from `auth.routes.ts` for:

- Signup → send verify email
- Password reset request → send reset email

---

### 8. Stripe Payment Flow

1. Front-end collects payment details (e.g. card) and obtains a `paymentMethodId` using Stripe.js (to be added on the front end).
2. Front-end calls **POST** `/enrollments` with `{ classId, paymentMethodId }`.
3. Backend:
   - Creates & confirms a Stripe Payment Intent.
   - Stores result in `PaymentModel`.
   - Creates an `EnrollmentModel` record.
4. Front-end can then:
   - Redirect to `/enrollment-success/:id` page.
   - Use `useMyEnrollments` to show enrolled classes.

If Stripe is missing, the backend behaves as **demo mode**: it still creates enrollments and payments, but no real charge occurs.

---

### 9. Connecting to the Existing Front End

To connect:

1. Run MongoDB locally (e.g. `mongod` or Docker).
2. Configure `.env` in `nexnon-backend` and run `pnpm dev`.
3. In the front-end (`nexnon-front-end`):
   - Set `VITE_API_BASE_URL=http://localhost:4000`.
   - Ensure `AuthContext` uses `useCurrentUser` (already guided in `API_INTEGRATION_GUIDE.md`).
   - Replace demo/mock data gradually with React Query hooks (`useAuth`, `useClasses`, etc.).

This backend is intentionally modular, so you can later extend it with:

- Assignments & materials endpoints
- Notifications & analytics endpoints
- Webhooks (Stripe, Zoom) and background jobs

without breaking the existing contracts already used by the front end.
