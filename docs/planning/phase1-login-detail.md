# Phase 1: Login Page - Detailed Implementation Plan

**Phase:** 1 of 7  
**Estimated Time:** 30 minutes  
**Goal:** Create authentication entry point  
**Dependencies:** Phase 0 (Scaffold must be complete)

---

## Overview

Phase 1 implements the login page - the authentication gateway for the application. This is a NEW page (no HTML equivalent exists in the prototype), so we design it using the established dark theme from the design system.

**Key Features:**
- Centered login form with email/password fields
- JWT token storage via Zustand auth store
- Automatic redirect to `/dashboard` on success
- Prevent access if already logged in

---

## Files to Create (2 files)

### File 1: API Module - Auth

**File:** `src/api/auth.ts`  
**Location:** `app/frontend/src/api/auth.ts`  
**Purpose:** Authentication API functions - login endpoint communication

**Content Responsibility:**
- Define `login(credentials)` function
- POST to `/auth/login` endpoint
- Return typed response with JWT + user data
- Handle error responses

**Relationships:**
| Direction | Relationship |
|-----------|--------------|
| **Imports from** | `client.ts` (axios instance) |
| **Used by** | `LoginPage.tsx`, potentially password reset features |
| **Calls** | `client.post('/auth/login', credentials)` |

**TypeScript Interfaces to Define:**
```typescript
interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    user: {
      id: number
      email: string
      role: string
    }
  }
}
```

---

### File 2: Page - Login

**File:** `src/pages/LoginPage.tsx`  
**Location:** `app/frontend/src/pages/LoginPage.tsx`  
**Purpose:** Login page UI + authentication flow logic

**Content Responsibility:**
- Render centered login form (dark themed)
- Email input field
- Password input field (masked)
- Submit button with loading state
- Error message display
- Form validation (basic: required fields)
- On submit: call `auth.login()`, store in `authStore`, redirect to `/dashboard`
- Redirect to `/dashboard` if already authenticated

**Relationships:**
| Direction | Relationship |
|-----------|--------------|
| **Imports from** | `../api/auth.ts` (login function) |
| **Imports from** | `../store/authStore.ts` (Zustand store for saving JWT) |
| **Imports from** | `react-router-dom` (`useNavigate`, `Navigate` for redirects) |
| **Imports from** | `../components/common/LoadingSpinner` (optional loading state) |
| **Used by** | `App.tsx` (router configuration) |
| **Redirects to** | `/dashboard` on success |
| **Prevents access if** | `authStore.token` exists (already logged in) |

**Component Structure:**
```
LoginPage
├── Container (centered, full-screen dark background)
├── Card (elevated surface)
│   ├── Header (logo + title)
│   ├── Form
│   │   ├── Email Input
│   │   ├── Password Input
│   │   └── Submit Button
│   └── Error Message (conditional)
└── Loading State (during submit)
```

**State Management:**
```typescript
// Local state
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)

// Global state (Zustand)
const { token, login } = useAuthStore()
```

---

## Directory Structure After Phase 1

```
app/frontend/src/
├── api/
│   ├── client.ts          # [Phase 0] Axios instance
│   └── auth.ts            # [Phase 1 - NEW] Auth API
├── store/
│   └── authStore.ts       # [Phase 0] Zustand auth store
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx    # [Phase 0]
│   │   └── AppLayout.tsx  # [Phase 0]
│   └── common/
│       ├── LoadingSpinner.tsx  # [Phase 0]
│       └── ErrorMessage.tsx    # [Phase 0]
├── pages/
│   └── LoginPage.tsx      # [Phase 1 - NEW] Login page
├── App.tsx                # [Phase 0] - UPDATE to add Login route
├── main.tsx               # [Phase 0]
└── index.css              # [Phase 0]
```

---

## Route Configuration (Update to App.tsx)

Add to `App.tsx` router configuration:

```typescript
// Public route
<Route path="/login" element={<LoginPage />} />

// Protected routes wrapper
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  {/* ... other protected routes */}
</Route>

// Redirect root to dashboard (if logged in) or login
<Route path="/" element={<Navigate to="/dashboard" replace />} />
```

---

## Design Specification

**Layout:**
- Full-screen dark background (`--color-bg: #0f1117`)
- Centered card (max-width: 400px)
- Card styling: `background: var(--color-surface)`, border-radius, shadow

**Form Elements:**
- Inputs: dark themed, focus ring with `--color-accent`
- Button: filled with `--color-accent`, hover state
- Typography: Inter font, CSS variable based

**No HTML Source:**
This page doesn't exist in the HTML prototype. Design from scratch using:
- CSS variables from `index.css`
- Dark theme consistent with sidebar
- Form patterns similar to modals in `groups.html`

---

## API Integration

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "admin@techno.com",
  "password": "..."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@techno.com",
      "role": "admin"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Flow:**
1. User submits form
2. Call `login({ email, password })` from `auth.ts`
3. On success: `authStore.login(token, user)`
4. Redirect to `/dashboard`
5. On error: Display error message in form

---

## Testing Checklist

- [ ] Form renders with email and password fields
- [ ] Submit button is disabled while loading
- [ ] Error message displays on failed login
- [ ] Successful login stores JWT in Zustand + localStorage
- [ ] Redirect to `/dashboard` after successful login
- [ ] Already logged-in users are redirected away from `/login`
- [ ] Design matches dark theme (CSS variables)

---

## Dependencies on Phase 0

| Phase 0 File | Required For |
|--------------|--------------|
| `src/api/client.ts` | `auth.ts` needs axios instance |
| `src/store/authStore.ts` | `LoginPage.tsx` needs to store JWT |
| `src/index.css` | Design tokens for styling |
| `src/components/common/LoadingSpinner.tsx` | Optional loading state |

**DO NOT start Phase 1 until Phase 0 is complete.**

---

*Phase 1 Ready for Implementation*
