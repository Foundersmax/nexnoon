# Nexnoon API Integration Guide

This guide explains the production-ready API architecture implemented for the Nexnoon platform.

## 📁 Project Structure

```
src/
├── config/
│   └── env.ts                    # Environment configuration
├── types/
│   └── api.ts                    # TypeScript type definitions
├── lib/
│   └── api/
│       ├── client.ts             # Axios instance with interceptors
│       ├── services/
│       │   ├── auth.service.ts   # Authentication API calls
│       │   └── class.service.ts  # Class/Course API calls
│       └── index.ts              # API exports
├── hooks/
│   └── api/
│       ├── useAuth.ts            # Auth React Query hooks
│       └── useClasses.ts         # Class React Query hooks
└── providers/
    └── QueryProvider.tsx          # React Query Provider
```

## 🔧 Configuration

### Environment Variables

Copy **`env.example`** to **`.env`** in the project root and set:

```env
# API Configuration (local backend)
VITE_API_BASE_URL=http://localhost:4000/v1

# Zoom SDK (optional - for live classes)
VITE_ZOOM_SDK_KEY=
VITE_ZOOM_SDK_SECRET=
```

### Configuration File

The `src/config/env.ts` file centralizes all environment variables:

```typescript
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1',
  API_TIMEOUT: 30000,
  // ... other config
};
```

## 🌐 API Client

### Axios Instance

Located in `src/lib/api/client.ts`, the API client is configured with:

- **Base URL**: Configured from environment variables
- **Timeout**: 30 seconds default
- **Request Interceptors**: Automatically adds authentication token
- **Response Interceptors**: Handles errors and token refresh

### Authentication Flow

1. **Token Storage**: Tokens are stored in `localStorage`
2. **Auto-Refresh**: Expired tokens are automatically refreshed
3. **Logout on Failure**: Users are redirected to login if refresh fails

```typescript
// Tokens are automatically attached to all requests
apiClient.get('/classes'); // Authorization header added automatically
```

## 📦 Type Definitions

All API types are defined in `src/types/api.ts`:

### Core Types
- `APIResponse<T>`: Standard API response wrapper
- `PaginatedResponse<T>`: Paginated data response
- `APIError`: Error structure

### Domain Types
- `User`: User data model
- `Class`: Course/class data model  
- `Enrollment`: Student enrollment
- `Payment`: Payment transactions
- `Material`: Course materials
- `Assignment`: Assignments and submissions
- `Review`: Course reviews
- `Notification`: User notifications
- `Certificate`: Completion certificates

## 🔌 API Services

### Auth Service (`auth.service.ts`)

Handles all authentication operations:

```typescript
import { authService } from '@/lib/api';

// Login
const authData = await authService.login({ email, password });

// Signup
const authData = await authService.signup({ email, password, firstName, lastName });

// Get current user
const user = await authService.getCurrentUser();

// Update profile
const updatedUser = await authService.updateProfile({ firstName: 'John' });

// Password reset
await authService.requestPasswordReset({ email });
await authService.confirmPasswordReset({ token, newPassword });
```

### Class Service (`class.service.ts`)

Handles all class/course operations:

```typescript
import { classService } from '@/lib/api';

// Get classes
const classes = await classService.getClasses({ page: 1, pageSize: 10 });

// Get single class
const classData = await classService.getClass(classId);

// Create class (instructor)
const newClass = await classService.createClass({
  title: 'React Mastery',
  description: '...',
  category: 'Development',
  // ...
});

// Enroll in class
const enrollment = await classService.enrollInClass({ classId });

// Get schedule
const schedule = await classService.getClassSchedule(classId);

// Add review
const review = await classService.createReview({
  classId,
  rating: 5,
  comment: 'Great class!',
});
```

## 🪝 React Query Hooks

### Auth Hooks (`useAuth.ts`)

```typescript
import { 
  useLogin, 
  useSignup, 
  useCurrentUser,
  useLogout,
  useUpdateProfile 
} from '@/hooks/api/useAuth';

function LoginPage() {
  const login = useLogin();
  
  const handleLogin = async (credentials) => {
    await login.mutateAsync(credentials);
    // Automatically handles success/error states
  };
  
  return (
    <button onClick={() => handleLogin({ email, password })} disabled={login.isPending}>
      {login.isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}

function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{user?.fullName}</div>;
}
```

### Class Hooks (`useClasses.ts`)

```typescript
import { 
  useClasses,
  useClass,
  useMyClasses,
  useMyEnrollments,
  useEnrollInClass,
  useCreateClass,
} from '@/hooks/api/useClasses';

function ClassesPage() {
  const { data, isLoading, error } = useClasses({ page: 1, pageSize: 10 });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading classes</div>;
  
  return (
    <div>
      {data?.data.map(cls => (
        <div key={cls.id}>{cls.title}</div>
      ))}
    </div>
  );
}

function ClassDetailPage({ id }) {
  const { data: classData, isLoading } = useClass(id);
  const enroll = useEnrollInClass();
  
  const handleEnroll = () => {
    enroll.mutate({ classId: id });
  };
  
  return (
    <button onClick={handleEnroll} disabled={enroll.isPending}>
      {enroll.isPending ? 'Enrolling...' : 'Enroll Now'}
    </button>
  );
}
```

## 🎯 Usage Examples

### Example 1: Login Component

```typescript
import { useLogin } from '@/hooks/api/useAuth';
import { useNavigate } from 'react-router';

function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login.mutateAsync({
        email: e.target.email.value,
        password: e.target.password.value,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is automatically handled and toasted
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 2: Class List with Filters

```typescript
import { useClasses } from '@/hooks/api/useClasses';
import { useState } from 'react';

function ClassList() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  
  const { data, isLoading, error } = useClasses({
    page,
    pageSize: 12,
    filters: category !== 'all' ? { category } : undefined,
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Categories</option>
        <option value="development">Development</option>
        <option value="design">Design</option>
      </select>
      
      <div className="grid">
        {data?.data.map(cls => (
          <ClassCard key={cls.id} class={cls} />
        ))}
      </div>
      
      <Pagination
        page={page}
        totalPages={data?.pagination.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

### Example 3: Create Class Form

```typescript
import { useCreateClass } from '@/hooks/api/useClasses';
import { useNavigate } from 'react-router';

function CreateClassForm() {
  const createClass = useCreateClass();
  const navigate = useNavigate();
  
  const handleSubmit = async (formData) => {
    try {
      const newClass = await createClass.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        totalSessions: parseInt(formData.totalSessions),
      });
      
      navigate(`/class/${newClass.id}`);
    } catch (error) {
      // Error handled automatically
    }
  };
  
  return <ClassForm onSubmit={handleSubmit} loading={createClass.isPending} />;
}
```

## 🔐 Authentication State Management

The `AuthContext` should be updated to use the API:

```typescript
// src/contexts/AuthContext.tsx
import { useCurrentUser } from '@/hooks/api/useAuth';

export function AuthProvider({ children }) {
  const { data: user, isLoading } = useCurrentUser();
  
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 🚀 Production Deployment Checklist

### Before Going Live:

1. **Environment Variables**
   - [ ] Set production API URL
   - [ ] Configure Zoom SDK keys (if using)
   - [ ] Set up error tracking (Sentry, etc.)

2. **API Configuration**
   - [ ] Update timeout values for production
   - [ ] Configure retry logic
   - [ ] Set up rate limiting headers

3. **Security**
   - [ ] Implement HTTPS only
   - [ ] Add CSRF protection
   - [ ] Validate all input data
   - [ ] Sanitize user-generated content

4. **Performance**
   - [ ] Enable React Query DevTools only in development
   - [ ] Configure appropriate cache times
   - [ ] Implement pagination for large lists
   - [ ] Add loading skeletons

5. **Error Handling**
   - [ ] Test error scenarios
   - [ ] Implement user-friendly error messages
   - [ ] Set up error logging
   - [ ] Add fallback UI for failed states

6. **Testing**
   - [ ] Test API integration with mock server
   - [ ] Test authentication flow
   - [ ] Test error handling
   - [ ] Test offline scenarios

## 📊 API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

## 🛠 Backend API Requirements

Your backend should implement these endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `PATCH /auth/profile` - Update profile
- `POST /auth/refresh` - Refresh token
- `POST /auth/password/reset` - Request password reset
- `POST /auth/password/reset/confirm` - Confirm password reset
- `POST /auth/verify-email` - Verify email
- `POST /auth/verify-email/resend` - Resend verification

### Classes
- `GET /classes` - List classes (with pagination)
- `GET /classes/:id` - Get class details
- `POST /classes` - Create class (instructor)
- `PATCH /classes/:id` - Update class (instructor)
- `DELETE /classes/:id` - Delete class (instructor/admin)
- `POST /classes/:id/deletion-request` - Request deletion
- `GET /classes/:id/schedule` - Get class schedule
- `POST /classes/:id/schedule` - Add session
- `PATCH /classes/:id/schedule/:sessionId` - Update session
- `DELETE /classes/:id/schedule/:sessionId` - Delete session
- `GET /classes/my` - Get my classes (instructor)
- `GET /classes/search` - Search classes
- `GET /classes/category/:category` - Get classes by category

### Enrollments
- `POST /enrollments` - Enroll in class
- `GET /enrollments/my` - Get my enrollments
- `GET /classes/:id/enrollments` - Get class enrollments
- `DELETE /enrollments/:id` - Drop class

### Reviews
- `GET /classes/:id/reviews` - Get class reviews
- `POST /reviews` - Create review
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

## 💡 Best Practices

1. **Always use TypeScript types** for type safety
2. **Use React Query hooks** instead of raw API calls
3. **Handle loading and error states** in all components
4. **Implement optimistic updates** for better UX
5. **Use query key factories** for cache invalidation
6. **Add retry logic** for failed requests
7. **Implement proper error boundaries**
8. **Log errors** in production
9. **Test API integration** thoroughly
10. **Document API changes** as they occur

## 🤝 Contributing

When adding new API endpoints:

1. Add types to `src/types/api.ts`
2. Create service in `src/lib/api/services/`
3. Create React Query hooks in `src/hooks/api/`
4. Update this documentation
5. Add examples of usage

## 📞 Support

For questions or issues with the API integration, please check:
- Backend API documentation
- React Query documentation
- Axios documentation
- TypeScript handbook

---

**Last Updated**: January 28, 2026
**Version**: 1.0.0
**Maintainer**: Nexnoon Development Team
