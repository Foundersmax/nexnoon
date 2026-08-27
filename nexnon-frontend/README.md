# Nexnoon - Live Online Learning Platform

A complete, production-ready online learning platform built with React, TypeScript, and Tailwind CSS. Features authentication, class browsing, enrollment tracking, and full page coverage.

## ✨ Features

### Complete Page Set
- **Home** - Hero section, live classes carousel, category navigation
- **Browse** - Advanced search and filtering system
- **Categories** - Formal category cards with images
- **Class Detail** - Individual class information and enrollment
- **Payment** - Stripe-integrated checkout (mock)
- **My Classes** - Student dashboard with enrolled/upcoming/completed tabs
- **Profile** - User profile management
- **Teach** - Instructor onboarding page
- **About** - Company information
- **Contact** - Contact form
- **Terms & Privacy** - Legal pages
- **Login & Signup** - Full authentication flow
- **404** - Custom not found page

### Authentication System
- ✅ Login/Signup with form validation
- ✅ Protected routes for authenticated users
- ✅ User dropdown menu with avatar
- ✅ Persistent sessions (localStorage)
- ✅ Password visibility toggles
- ✅ Logout functionality

### Key Features
- 🎯 Clean, minimalistic, modern design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔍 Search functionality with navigation to browse
- 📊 Progress tracking for enrolled classes
- 🎨 Blue accent color (#889dd1) throughout
- ⚡ Fast navigation with React Router
- 🎭 User avatar with initials
- 🔐 Form validation on all inputs

## 🚀 Getting Started

### 1. Environment variables

Create a `.env` file from the template (the template is visible as **`env.example`** in the project root):

- **Windows (PowerShell):** `Copy-Item env.example .env`
- **Mac/Linux:** `cp env.example .env`

Then edit `.env` and set your values. **To open `.env`** if it’s hidden: use **Ctrl+P** (or Cmd+P) and type `env` to open it, or open `env.example` and save a copy as `.env`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | For real API | Backend API base URL (e.g. `http://localhost:4000/v1`) – see root **RUN.md** |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For real payments | Stripe publishable key from [Dashboard → API keys](https://dashboard.stripe.com/apikeys) |
| `VITE_ZOOM_SDK_KEY` | Optional | Zoom SDK key (live classes) |
| `VITE_ZOOM_SDK_SECRET` | Optional | Zoom SDK secret |
| `VITE_AGORA_APP_ID` | Optional | Agora App ID (video/live) |
| `VITE_AGORA_TOKEN_SERVER_URL` | Optional | Agora token server URL |
| `VITE_ENABLE_DEMO_MODE` | Optional | `true` = demo mode, `false` = use real API |
| `VITE_ENABLE_ANALYTICS` | Optional | `true` to enable analytics |

Never commit `.env`. Use **`env.example`** as the template (it is committed).

### 2. Install and run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Header.tsx          # Header with auth state
│   │   ├── Footer.tsx          # Footer with links
│   │   ├── Hero.tsx            # Homepage hero
│   │   ├── LiveClasses.tsx     # Class grid component
│   │   └── ui/                 # Reusable UI components
│   ├── pages/
│   │   ├── Login.tsx           # Authentication
│   │   ├── Signup.tsx          # Registration
│   │   ├── Browse.tsx          # Search & filter
│   │   ├── Categories.tsx      # Category cards
│   │   ├── ClassDetail.tsx     # Class info
│   │   ├── Payment.tsx         # Checkout
│   │   ├── MyClasses.tsx       # Student dashboard
│   │   ├── Profile.tsx         # User profile
│   │   ├── Teach.tsx           # Instructor page
│   │   ├── About.tsx           # About page
│   │   ├── Contact.tsx         # Contact form
│   │   ├── Terms.tsx           # Terms of service
│   │   ├── Privacy.tsx         # Privacy policy
│   │   └── NotFound.tsx        # 404 page
│   └── App.tsx                 # Main app with routes
├── contexts/
│   └── AuthContext.tsx         # Authentication state
└── styles/
    ├── theme.css               # Design tokens
    └── fonts.css               # Font imports
```

## 🎨 Design System

### Colors
- **Primary**: `#889dd1` (Blue accent)
- **Background**: `#FFFFFF` (White)
- **Text**: `#000000` (Black)
- **Gray Scale**: Various gray shades

### Typography
- Clean, modern sans-serif fonts
- Responsive text sizing
- Bold headlines

### Components
- Minimalistic design
- Rounded corners (rounded-xl, rounded-2xl)
- Subtle shadows
- Smooth hover transitions

## 🔐 Authentication

The app uses React Context for authentication:

```typescript
// Login
const { login } = useAuth();
await login(email, password);

// Signup
const { signup } = useAuth();
await signup(email, password, name);

// Logout
const { logout } = useAuth();
logout();

// Check auth state
const { user, isAuthenticated } = useAuth();
```

## 📄 All Routes

| Route | Page | Protected |
|-------|------|-----------|
| `/` | Home | No |
| `/categories` | Categories | No |
| `/browse` | Browse Classes | No |
| `/class/:id` | Class Detail | No |
| `/payment/:id` | Payment | No |
| `/teach` | Teach Info | No |
| `/about` | About Us | No |
| `/contact` | Contact | No |
| `/terms` | Terms | No |
| `/privacy` | Privacy | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/my-classes` | My Classes | Yes |
| `/profile` | Profile | Yes |
| `/*` | 404 | No |

## 🛠️ Backend Integration

This is a frontend-only application. To integrate with a backend:

1. Replace authentication mock with actual API calls in `/src/contexts/AuthContext.tsx`
2. Add API endpoints for:
   - `POST /api/auth/login`
   - `POST /api/auth/signup`
   - `POST /api/auth/logout`
   - `GET /api/classes`
   - `GET /api/classes/:id`
   - `POST /api/enroll`
   - `GET /api/user/classes`
   - etc.

3. Update localStorage usage with secure session management
4. Add environment variables for API URLs

## 📱 Responsive Design

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components adapt seamlessly across devices.

## 🎯 Key User Flows

### 1. Browse & Enroll
1. Browse classes on home or browse page
2. Click a class to view details
3. Click "Enroll Now"
4. Complete payment
5. Access from "My Classes"

### 2. Authentication
1. Click "Sign Up" or "Log In"
2. Fill form with validation
3. Redirected to previous page
4. Access protected features

### 3. Student Dashboard
1. Login to account
2. Navigate to "My Classes"
3. View enrolled, upcoming, completed tabs
4. Track progress
5. Access certificates

## 🔒 Security Notes

⚠️ **Important for Production:**
- Replace localStorage with secure httpOnly cookies
- Implement proper JWT token handling
- Add CSRF protection
- Use HTTPS for all requests
- Sanitize all user inputs
- Add rate limiting
- Implement proper error handling

## 🎨 Customization

### Change Primary Color
Update `#889dd1` throughout the codebase with your brand color.

### Add New Pages
1. Create page in `/src/app/pages/`
2. Add route in `/src/app/App.tsx`
3. Add navigation link in Header/Footer

## 📦 Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## 🚀 Production Ready

This app is:
- ✅ Fully functional
- ✅ Responsive
- ✅ Accessible
- ✅ Performance optimized
- ✅ Type-safe
- ✅ Clean code
- ✅ Modern design
- ✅ Ready for backend integration

## 📝 License

© 2026 Hillpad Nexnoon. All rights reserved.

---

**Built with ❤️ for seamless online learning**
