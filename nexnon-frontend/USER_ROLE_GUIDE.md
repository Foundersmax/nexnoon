# User Role Differentiation Guide

## Overview
Nexnoon now supports two distinct user roles: **Students** and **Instructors**. This guide explains how they differ and what features each role has access to.

---

## Role Selection During Signup

### New Signup Flow
When users create an account, they select their role:

1. **Student Role**
   - Icon: Graduation Cap 🎓
   - Description: "Learn new skills"
   - Purpose: For learners who want to enroll in and attend classes

2. **Instructor Role**
   - Icon: Users Group 👥
   - Description: "Teach & inspire"
   - Purpose: For experts who want to teach and create live classes

---

## Profile Differences

### Student Profile
**Visual Identity:**
- Avatar gradient: Blue to Gray (`from-[#889dd1] to-gray-400`)
- Badge: Gray background with "Student" label and book icon

**Statistics Displayed:**
- Enrolled Classes: 2
- Completed: 1
- Hours Learned: 12
- Certificates: 1

**Navigation:**
- "My Classes" → View enrolled classes
- No teaching-specific features

---

### Instructor Profile
**Visual Identity:**
- Avatar gradient: Blue gradient (`from-[#889dd1] to-[#7a8ec2]`)
- Badge: Blue background with "Instructor" label and users icon

**Statistics Displayed:**
- Active Classes: 5
- Total Students: 342
- Total Earnings: $8.5K
- Avg Rating: 4.9★

**Quick Actions Section:**
- Create Class → Navigate to teach page
- My Classes → Manage created classes
- Earnings → View revenue dashboard

**Navigation:**
- "Manage Classes" → Manage teaching schedule
- Access to instructor-only features

---

## Authentication System

### Data Structure
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor'; // Key differentiator
}
```

### Signup Function
```typescript
signup(email, password, name, role: 'student' | 'instructor')
```

### Login Function
- Currently defaults to 'student' role
- **TODO:** Backend should return the user's actual role from database

---

## Backend Integration Points

### Required API Endpoints

1. **POST /auth/signup**
   ```json
   {
     "email": "user@example.com",
     "password": "********",
     "name": "John Doe",
     "role": "student" | "instructor"
   }
   ```

2. **POST /auth/login**
   ```json
   Response: {
     "user": {
       "id": "123",
       "email": "user@example.com",
       "name": "John Doe",
       "role": "instructor"
     },
     "token": "jwt_token_here"
   }
   ```

3. **GET /user/profile**
   - Should include role in response
   - Return role-specific statistics

---

## Future Enhancements

### Recommended Features

1. **Role-Based Dashboards**
   - Redirect students to `/my-classes` after login
   - Redirect instructors to `/teach` or instructor dashboard

2. **Permission System**
   - Prevent students from accessing `/teach` features
   - Restrict class creation to instructors only

3. **Role Switching**
   - Allow users to have both roles
   - Add toggle between student/instructor views

4. **Enhanced Analytics**
   - Students: Learning progress, course recommendations
   - Instructors: Revenue analytics, student engagement metrics

---

## Visual Differences Summary

| Feature | Student | Instructor |
|---------|---------|------------|
| **Avatar Color** | Blue to Gray | Blue Gradient |
| **Badge Color** | Gray | Blue (#889dd1) |
| **Stats Section** | Learning Stats | Teaching Stats |
| **Quick Actions** | None | Create, Manage, Earnings |
| **Primary Focus** | Enrolled Classes | Teaching Dashboard |

---

## Testing the Roles

### To Test Student Account:
1. Go to `/signup`
2. Select "Student" role (graduation cap icon)
3. Complete signup
4. Navigate to `/profile` → See learning stats

### To Test Instructor Account:
1. Go to `/signup`
2. Select "Instructor" role (users icon)
3. Complete signup
4. Navigate to `/profile` → See teaching stats and quick actions

---

## Notes for Backend Team

- Store `role` field in user database table
- Validate role on signup (must be 'student' or 'instructor')
- Return role in login/authentication responses
- Consider adding role validation middleware for protected routes
- Implement role-based permissions for API endpoints

---

**Last Updated:** January 2026
