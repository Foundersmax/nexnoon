# Quick Start Guide

Get the Nexnoon backend running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd nexnon-backend
pnpm install
```

### 2. Create `.env` File

```bash
cp .env.example .env
```

### 3. Minimal `.env` Configuration (Demo Mode)

For quick testing, you only need MongoDB. Everything else can be empty:

```env
# Required: MongoDB
MONGODB_URI=mongodb://localhost:27017/nexnon

# Required: JWT Secrets (generate secure ones for production)
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production

# Optional: Leave empty for demo mode
STRIPE_SECRET_KEY=
SMTP_HOST=
ZOOM_ACCOUNT_ID=
```

### 4. Start MongoDB

**Local MongoDB:**

```bash
# Windows
net start MongoDB

# macOS/Linux
mongod
```

**Or use MongoDB Atlas (cloud):**

- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Copy connection string to `MONGODB_URI`

### 5. Start Backend

```bash
pnpm dev
```

You should see:

```
✅ MongoDB connected successfully
Nexnon API running on http://localhost:4000
```

### 6. Test It

```bash
# Health check
curl http://localhost:4000/health

# Create a test user
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## ✅ What Works in Demo Mode

- ✅ **Authentication** (signup, login, JWT tokens)
- ✅ **Classes** (create, list, update, delete)
- ✅ **Enrollments** (enroll in classes - no real payment)
- ✅ **Reviews** (rate and review classes)
- ✅ **Zoom Links** (demo links generated automatically)

## 🔧 Adding Real Integrations

When you're ready to add real services:

1. **Stripe Payments**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-2-stripe-payment-integration)
2. **Email (SMTP)**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-3-email-configuration-smtp)
3. **Zoom Meetings**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-4-zoom-integration-optional)

## 🐛 Troubleshooting

**MongoDB connection failed?**

- Ensure MongoDB is running: `mongod` (local) or cluster is active (Atlas)
- Check `MONGODB_URI` in `.env`

**Port 4000 already in use?**

- Change `PORT=4000` to another port in `.env`

**Need more help?**

- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- Check [README.md](./README.md) for API documentation
