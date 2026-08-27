# Demo Mode Guide

## Overview
Nexnoon now supports **Demo Mode** - allowing you to explore the full platform without authentication barriers!

---

## How Demo Mode Works

### Accessing Pages
✅ **No login required!** You can now access:
- `/profile` - View student or instructor profiles
- `/my-classes` - Browse classes dashboard
- All other pages work as before

### Demo Mode Indicator
When you're not logged in, you'll see:
- **Blue notification banner** on My Classes page
- **Demo Mode Toggle button** (bottom right) on Profile page

---

## Demo Mode Toggle

### Location
Look for the **floating blue button** in the bottom-right corner of the Profile page.

### Features
**Student Mode:**
- 🎓 Graduation cap icon
- Shows "Demo: Student"
- Displays learning statistics
- Gray/blue color scheme
- Focus on enrolled classes and progress

**Instructor Mode:**
- 👥 Users group icon
- Shows "Demo: Instructor"
- Displays teaching statistics
- Blue brand color scheme
- Shows earnings, students, and class management tools

### How to Switch Roles
1. Click the **Demo Mode** button (bottom-right)
2. Modal appears with two role options
3. Click **Student** or **Instructor**
4. Profile updates instantly!

---

## Page-Specific Behavior

### Profile Page (`/profile`)
**When Not Authenticated:**
- Shows demo user: "Demo User" (demo@nexnoon.com)
- Toggle button appears for role switching
- All features visible and interactive
- Changes reflect based on selected role

**When Authenticated:**
- Shows actual user data
- Demo toggle hidden
- Full functionality enabled

### My Classes Page (`/my-classes`)
**When Not Authenticated:**
- Blue banner: "Demo Mode: You're viewing sample data"
- Shows sample enrolled/upcoming/completed classes
- All tabs work normally
- Title changes based on user role:
  - Student: "My Learning"
  - Instructor: "My Teaching Classes"

**When Authenticated:**
- No demo banner
- Shows actual user's classes
- Full interaction enabled

---

## Testing the Flow

### Test Student Experience
1. Navigate to `/profile` (without logging in)
2. See student view by default
3. Note:
   - "Student" badge
   - Learning statistics (2 enrolled, 1 completed, 12 hours, 1 certificate)
   - Gray color scheme
4. Click "My Classes" button → See student learning dashboard

### Test Instructor Experience
1. Navigate to `/profile` (without logging in)
2. Click the **Demo Mode** toggle button
3. Select **Instructor**
4. Note:
   - "Instructor" badge
   - Teaching statistics (5 classes, 342 students, $8.5K earnings, 4.9★ rating)
   - Blue brand color scheme (#889dd1)
   - Quick Actions section appears
5. Click "My Classes" → See "My Teaching Classes" title

### Test Complete Signup Flow
1. Navigate to `/signup`
2. Select role (Student or Instructor)
3. Fill in details
4. After signup → User is authenticated
5. Navigate to `/profile` → See real user data
6. Demo toggle is hidden

---

## Visual Differences

### Student Profile
```
Avatar: Blue → Gray gradient
Badge: Gray with book icon
Stats: Learning-focused
- Enrolled Classes
- Completed
- Hours Learned
- Certificates
Quick Actions: None
```

### Instructor Profile
```
Avatar: Blue gradient
Badge: Blue with users icon
Stats: Teaching-focused
- Active Classes
- Total Students
- Total Earnings
- Avg Rating
Quick Actions: Create Class, My Classes, Earnings (blue themed)
```

---

## Benefits of Demo Mode

✅ **No barriers** - Explore without signing up
✅ **Full experience** - See all features and layouts
✅ **Easy testing** - Switch roles instantly
✅ **Professional** - Clear indicators that it's demo mode
✅ **Conversion-friendly** - "Sign up" prompts encourage registration

---

## For Developers

### Code Changes Made

**1. Profile Page (`/src/app/pages/Profile.tsx`)**
- Removed authentication gate
- Added demo user with role state
- Added DemoModeToggle component
- Conditional rendering based on isAuthenticated

**2. My Classes Page (`/src/app/pages/MyClasses.tsx`)**
- Removed authentication gate
- Added demo mode banner
- Role-aware title changes

**3. Demo Mode Toggle (`/src/app/components/DemoModeToggle.tsx`)**
- New component for role switching
- Modal with visual role selection
- Only visible when not authenticated

**4. Auth Context (`/src/contexts/AuthContext.tsx`)**
- Updated signup to accept role parameter
- Role stored in user object

---

## Notes

- Demo data is **frontend-only** and resets on page refresh
- When authenticated, demo mode is disabled
- Role selection in signup is saved to backend (when integrated)
- Current role in demo mode is page-specific (not global)

---

**Last Updated:** January 2026
