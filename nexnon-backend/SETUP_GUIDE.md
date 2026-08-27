# Nexnoon Backend Setup Guide

This guide will walk you through setting up MongoDB, Stripe, Email (SMTP), and Zoom integrations for the Nexnoon backend.

---

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- (Optional) Stripe account for payments
- (Optional) Email service account (Gmail, SendGrid, Mailgun, etc.)
- (Optional) Zoom account with developer access

---

## 🗄️ 1. MongoDB Setup

### Option A: Local MongoDB

**Install MongoDB:**

- **Windows**: Download from [mongodb.com/download](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB installation guide](https://www.mongodb.com/docs/manual/installation/)

**Start MongoDB:**

```bash
# Windows (as Administrator)
net start MongoDB

# macOS/Linux
mongod
```

**Update `.env`:**

```env
MONGODB_URI=mongodb://localhost:27017/nexnon
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**:
   - Choose free tier (M0)
   - Select your region
   - Click "Create Cluster"
3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `nexnon-admin` (or your choice)
   - Password: Generate a secure password
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
4. **Whitelist IP Address**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server IP only
5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `nexnon`

**Update `.env`:**

```env
MONGODB_URI=mongodb+srv://nexnon-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nexnon?retryWrites=true&w=majority
```

### Verify MongoDB Connection

After starting the backend (`pnpm dev`), you should see:

```
MongoDB connected
Nexnon API running on http://localhost:4000
```

If you see connection errors, check:

- MongoDB is running (local) or cluster is active (Atlas)
- Connection string is correct
- IP is whitelisted (Atlas)
- Username/password are correct

---

## 💳 2. Stripe Payment Integration

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification (email, phone, business details)

### Step 2: Get API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click "Developers" → "API keys"
3. You'll see:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) - for frontend
   - **Secret key** (starts with `sk_test_` or `sk_live_`) - for backend

### Step 3: Test Mode vs Live Mode

- **Test Mode**: Use `sk_test_...` keys (default)
  - No real charges
  - Use test card numbers: `4242 4242 4242 4242`
  - Any future expiry date, any CVC
- **Live Mode**: Use `sk_live_...` keys (production)
  - Real charges
  - Requires account verification

### Step 4: Update `.env`

```env
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

**Note**: The backend works in **demo mode** if `STRIPE_SECRET_KEY` is empty. Enrollments will still work, but no real payments will be processed.

### Step 5: (Optional) Webhook Setup

For handling payment events (refunds, disputes, etc.):

1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)

**Update `.env`:**

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 6: Test Payment Flow

1. Start backend: `pnpm dev`
2. Create a test user and class
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check Stripe Dashboard → "Payments" to see test transactions

---

## 📧 3. Email Configuration (SMTP)

The backend uses Nodemailer to send emails for:

- Email verification (signup)
- Password reset
- (Future) Class notifications

### Option A: Gmail (Easiest for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Nexnoon Backend"
   - Copy the 16-character password

**Update `.env`:**

```env
EMAIL_FROM="Nexnoon <your-email@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### Option B: SendGrid (Recommended for Production)

1. **Sign up**: [sendgrid.com](https://sendgrid.com) (free tier: 100 emails/day)
2. **Create API Key**:
   - Go to "Settings" → "API Keys"
   - Click "Create API Key"
   - Name: "Nexnoon Backend"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the key

**Update `.env`:**

```env
EMAIL_FROM="Nexnoon <noreply@nexnon.com>"
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option C: Mailgun

1. **Sign up**: [mailgun.com](https://www.mailgun.com) (free tier: 5,000 emails/month)
2. **Get SMTP credentials** from dashboard

**Update `.env`:**

```env
EMAIL_FROM="Nexnoon <noreply@your-domain.com>"
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

### Option D: AWS SES

1. **Set up AWS SES** in your AWS account
2. **Verify email/domain**
3. **Get SMTP credentials** from SES console

**Update `.env`:**

```env
EMAIL_FROM="Nexnoon <noreply@your-domain.com>"
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Demo Mode (No Email)

If SMTP is not configured, the backend will:

- Log email attempts to console
- Still allow signup/login
- Skip sending actual emails

**To test without email:**

- Leave `SMTP_HOST` empty in `.env`
- Check console logs when users sign up

---

## 🎥 4. Zoom Integration (Optional)

Zoom integration automatically creates meeting links when instructors add sessions to classes.

### Step 1: Create Zoom Account

1. Go to [zoom.us](https://zoom.us) and sign up (free tier works)
2. Complete account setup

### Step 2: Create Server-to-Server OAuth App

1. Go to [marketplace.zoom.us/develop/create](https://marketplace.zoom.us/develop/create)
2. Choose "Server-to-Server OAuth"
3. **App Information**:
   - App name: "Nexnoon Live Classes"
   - Company name: Your company
   - Developer email: Your email
4. **App Credentials**:
   - After creation, you'll get:
     - **Account ID** (starts with `...`)
     - **Client ID** (starts with `...`)
     - **Client Secret** (copy immediately, shown only once)
5. **Scopes**: Enable:
   - `meeting:write:admin`
   - `meeting:write`
6. **Activate App**: Click "Activate" button

### Step 3: Update `.env`

```env
ZOOM_ACCOUNT_ID=xxxxxxxxxxxxx
ZOOM_CLIENT_ID=xxxxxxxxxxxxx
ZOOM_CLIENT_SECRET=xxxxxxxxxxxxx
```

### Step 4: Test Zoom Integration

1. Start backend: `pnpm dev`
2. Create a class with a schedule
3. Check the `ClassSchedule` document in MongoDB - it should have:
   - `zoomLink`: Real Zoom meeting URL
   - `zoomMeetingId`: Meeting ID
   - `zoomPasscode`: Meeting password

### Demo Mode (No Zoom)

If Zoom credentials are not configured:

- Backend generates demo Zoom links
- UI still works with demo links
- No real meetings are created

---

## 🔐 5. JWT Secrets Setup

**IMPORTANT**: Generate secure random secrets for production!

### Generate Secrets

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**macOS/Linux:**

```bash
openssl rand -base64 32
```

Run this **twice** to get two different secrets:

1. One for `JWT_ACCESS_SECRET`
2. One for `JWT_REFRESH_SECRET`

**Update `.env`:**

```env
JWT_ACCESS_SECRET=your-generated-secret-here-base64-encoded
JWT_REFRESH_SECRET=your-other-generated-secret-here-base64-encoded
```

**For development**, you can use simple strings, but **never commit them to git**!

---

## ✅ 6. Final Setup Checklist

- [ ] MongoDB is running (local) or Atlas cluster is active
- [ ] `.env` file is created with all values filled
- [ ] JWT secrets are generated (use secure random strings)
- [ ] Stripe test keys are added (or left empty for demo mode)
- [ ] SMTP credentials are configured (or left empty for demo mode)
- [ ] Zoom credentials are added (or left empty for demo mode)
- [ ] Frontend URL is set correctly in `FRONTEND_URL`

---

## 🚀 7. Start the Backend

**Env:** Copy **`env.example`** to **`.env`** in `nexnon-backend` and set at least `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `FRONTEND_URL`.

```bash
cd nexnon-backend
npm install
npm run dev
```

You should see:

```
MongoDB connected
Nexnon API running on http://localhost:4000
  Health: http://localhost:4000/health
  API v1: http://localhost:4000/v1
```

Test the health endpoint:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

## 🧪 8. Testing Each Integration

### Test MongoDB

```bash
# Create a user via signup endpoint
curl -X POST http://localhost:4000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Check MongoDB:

```bash
# Using MongoDB shell
mongosh
use nexnon
db.users.find()
```

### Test Stripe

1. Create a class with a price
2. Enroll in the class with a test card
3. Check Stripe Dashboard → Payments

### Test Email

1. Sign up a new user
2. Check your email inbox (or SMTP provider logs)
3. For demo mode, check console logs

### Test Zoom

1. Create a class as instructor
2. Add a session with start/end times
3. Check the session document in MongoDB for `zoomLink`

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

- **Local**: Ensure MongoDB service is running
- **Atlas**: Check IP whitelist, verify connection string, check username/password

### Stripe Payment Fails

- Verify API key is correct (test vs live)
- Check Stripe Dashboard for error logs
- Ensure amount is in cents (backend handles this)

### Emails Not Sending

- Verify SMTP credentials
- Check spam folder
- For Gmail: Ensure app password is used (not regular password)
- Check console logs for SMTP errors

### Zoom Meetings Not Created

- Verify all three Zoom credentials are set
- Check Zoom app is activated
- Verify scopes are enabled
- Check console logs for API errors

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)

---

## 🔒 Security Notes

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use strong JWT secrets** in production
3. **Use environment-specific keys** (test vs live for Stripe)
4. **Restrict MongoDB access** (IP whitelist for Atlas)
5. **Use HTTPS** in production for all API calls
6. **Rotate secrets regularly** in production

---

**Need help?** Check the main `README.md` or review the code comments in each integration file.
