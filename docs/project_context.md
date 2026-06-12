# Healthcare Frontend - Mental Wellness Platform

Document Version: 1.0

Last Updated: 2026-05-03

Project Status: Active development

## Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. Technology Stack](#2-technology-stack)
- [3. Application Architecture](#3-application-architecture)
- [4. Core Features](#4-core-features)
- [5. Data Flow & State Management](#5-data-flow--state-management)
- [6. API Integration](#6-api-integration)
- [7. Performance Optimizations](#7-performance-optimizations)
- [8. Refactoring Guidelines/Coding Standards](#8-refactoring-guidelinescoding-standards)
- [9. Component Reference](#9-component-reference)
- [10. Service Layer](#10-service-layer)
- [11. Known Issues & Solutions](#11-known-issues--solutions)
- [12. Deployment & Development](#12-deployment--development)
- [13. Appendix: File Reference](#13-appendix-file-reference)
- [14. Refactoring/ Migration History](#14-refactoring-migration-history)

## 1. Executive Summary

- Project Overview

  A React-based single-page frontend that connects patients and licensed mental-health practitioners for discovery, booking, payment, and real-time video consultations. Intended consumers are web users (patients and doctors) and the backend API maintained separately.

- Key Capabilities

  - User registration and JWT-based authentication for two roles: `patient` and `doctor` (role-based routing and protection).
  - Therapist discovery (search + filter by specialization/gender).
  - Appointment booking with an appointment-hold mechanism to prevent double-booking during payments.
  - Cashfree payment gateway integration (checkout + payment status flow).
  - Video consultations via Twilio Video (session creation, token retrieval, join/leave flows).
  - Doctor availability management (set weekly availability, list slots).
  - Patient and doctor dashboards with appointment and payment lists.

- Current Metrics

  - Application bundle/build size: TBD
  - Active users: TBD
  - Average response latency to backend: TBD
  - Cache hit rate (client): None implemented / TBD
  - Deployment targets: Vercel (configured), Docker artifacts (Dockerfile present)

## 2. Technology Stack

```yaml
frontend:
  framework: React
  framework_version: "^19.1.0"             # package.json
  language: JavaScript (ESM)
  runtime: Node.js (recommend >=16)          # README recommends Node.js v16+
  package_manager: npm

build_and_dev:
  bundler: Vite
  vite_version: "^6.3.5"
  dev_server: vite dev

ui:
  css_framework: Tailwind CSS
  tailwind_version: "^4.1.10"
  component_library: MUI (@mui/material) v7.2.0

http_client:
  axios: "^1.10.0"

video:
  twilio_video_sdk: "^2.32.0"

payments:
  cashfree_js: "@cashfreepayments/cashfree-js@^1.0.5"

tooling:
  linter: ESLint
  eslint_version: "^9.25.0"
  test_runner: TBD
  ci: TBD

auth:
  mechanism: JWT (token persisted in `localStorage` under key `user`)

os_shell:
  recommended_dev_shell: TBD
```

Key libraries (from `package.json`):

- React ^19.1.0
- Vite ^6.3.5
- Axios ^1.10.0
- TailwindCSS ^4.1.10
- @mui/material ^7.2.0
- @cashfreepayments/cashfree-js ^1.0.5
- twilio-video ^2.32.0
- date-fns ^4.1.0

## 3. Application Architecture

### Directory Structure (annotated)

Root -- repo root (frontend project)

```
.
├── public/                      # Static assets delivered as-is (images, manifest)
├── src/                         # Application source code
│   ├── api/                     # Service layer: `api.js` barrel re-exporting modular feature APIs
│   ├── assets/                  # Logos, illustrations, and global images
│   ├── components/              # Global shared components
│   │   ├── common/              # Layout structural wrappers (Navbar, SEO, ProtectedRoute)
│   │   └── ui/                  # Atomic presentation components (Button, Input, Alert, Spinner)
│   ├── config/                  # Global application configuration (SEO, constants)
│   ├── context/                 # React Context providers (AuthContext.jsx)
│   ├── features/                # Domain-driven feature modules (Screaming Architecture)
│   │   ├── appointments/        # Appointment cards, booking forms, availability settings
│   │   ├── auth/                # Login, registration, forgot/reset password, TOTP setup
│   │   ├── billing/             # Patient payment histories, checkout integrations, status pills
│   │   ├── dashboard/           # Doctor dashboard, patient dashboard, profile settings
│   │   ├── user-journey/        # Onboarding / how-it-works walk-through guides
│   │   └── video/               # Twilio video consults, preview dialogs
│   ├── hooks/                   # Global reusable React hooks
│   ├── pages/                   # Global templates and marketing pages (Home, About, Contact)
│   ├── services/                # Central services (Axios client base configuration)
│   ├── styles/                  # CSS modules and global styles
│   ├── utils/                   # Utility functions (dateTime, mediaUtils, validation)
│   ├── App.jsx                  # Router and top-level route protection
│   └── main.jsx                 # React entry point
├── package.json
├── vite.config.js
├── jsconfig.json                # Configured path aliasing (@/* -> src/*)
├── README.md
└── docs/                        # long-term project docs
```

Note: Git ignore details not available in repo snapshot; common items such as `node_modules/` and `.env` are likely ignored (TBD).

### Design Patterns (observed)

- Feature-Based Organization (Screaming Architecture): Domain files are co-located in `src/features/` (e.g., `features/auth/`, `features/appointments/`), separating pages, components, and local APIs by feature.

- Path Aliasing: Uses Vite-configured `@/` path aliasing resolving to `src/` to prevent relative import clutter (`../../..`).

- Service Layer: Modularized API functions are kept near their respective feature folders, and re-exported via `src/api/api.js` (barrel file) for compatibility. Core client is in `src/services/apiClient.js`.

- Context Provider: `AuthContext.jsx` implements React Context to hold authentication state (user + loading) and exposes `login`/`logout`. Used across the app via `useAuth()`.

- Lazy-loading / Code-splitting: `React.lazy()` is used in `App.jsx` to lazy-load page components — reduces initial bundle size and enables route-level splitting.

- Protected-Route Pattern: `PrivateRoute`, `PublicOnlyRoute` and role checks (`user.role`) are implemented in `App.jsx` to enforce authorization at route level.

If other architecture patterns exist (Repository, Factory, Redux, etc.) they are not present in the frontend snapshot and are marked TBD.

## 4. Core Features

Each sub-section below documents the major user-facing features observed in the codebase.

### 4.1 Authentication (Patients & Doctors)

- Purpose: Allow accounts for `patient` and `doctor` with JWT authentication and optional TOTP.

- Entry component/route:
  - `GET /login` -> `LoginForm` (route `/login` in `App.jsx`)
  - `GET /register` -> `RegisterForm` (route `/register`)

- Fields/inputs (TBD exact fields on forms):
  - Typical: `email` (string, required), `password` (string, required)
  - Registration: `name`, `email`, `password`, role selector (doctor/patient) — exact fields: TBD

- Step-by-step user flow:
  1. User opens `/login` or `/register`.
  2. On login/register submission, UI calls corresponding `api.js` functions: `loginUser()` or `registerUser()`.
  3. Successful response includes user data and token; `AuthContext.login()` stores user and `token` in `localStorage` under key `user`.
  4. Routes guarded by `PrivateRoute`/`PublicOnlyRoute` check `useAuth()`.

- Business rules:
  - Role-based redirects: `doctor` -> DoctorDashboard; others -> PatientDashboard (see `Dashboard` in `App.jsx`).
  - TOTP flows supported: `loginWithTOTP`, `setupTOTP`, `confirmTOTP`, `disableTOTP` exist in `api.js`.

- Persistence keys:
  - `localStorage.user` holds the serialized user object (includes `token` and `role`).

- Code snippets (non-obvious logic):

```javascript
// axios interceptor (src/api/api.js)
axios.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

```javascript
// AuthContext (src/context/AuthContext.jsx)
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) setUser(JSON.parse(storedUser));
  setLoading(false);
}, []);
const login = (userData) => {
  const userWithDefaults = {...userData, loginMethod: userData.loginMethod || 'PASSWORD'};
  setUser(userWithDefaults);
  localStorage.setItem("user", JSON.stringify(userWithDefaults));
};
```

### 4.2 Therapist Discovery

- Purpose: Allow patients to search and filter therapists by specialization/gender.

- Entry component/route: `/find-therapist` -> `FindTherapistPage` (lazy-loaded in `App.jsx`).

- Inputs: search query `q`, specialization, gender filter — handled by `fetchDoctorsSearch(q)` and `fetchDoctorsBySpecialization(specialization, gender)` in `api.js`.

- Flow: UI calls `fetchDoctorsSearch`/`fetchDoctorsBySpecialization` -> backend returns list -> UI renders list (cards), click navigates to doctor's profile (`DoctorProfileDashboard`).

### 4.3 Appointment Booking

- Purpose: Book appointments with availability checks and appointment-hold during payment.

- Entry component/route: `BookAppointment` component (used on booking flows, route context depends on navigation from therapist profile or dashboards).

- Fields/inputs: patientId, doctorId, date (YYYY-MM-DD), startTime (HH:MM), reason — described in `createAppointmentHold` JSDoc.

- Step-by-step flow (observed):
  1. User selects a slot (via `fetchDoctorAvailableSlots(doctorId, date)`).
  2. UI calls `createAppointmentHold(holdData)` to reserve slot (server returns hold reference e.g., "hold_xxx").
  3. On hold success, UI initiates payment flow using payment APIs and Cashfree checkout.
  4. On successful payment callback, backend confirms and finalizes appointment.

- Persistence: appointment hold reference is transient (sent to payment initiation); confirmed appointments retrieved via `fetchPatientAppointments` / `fetchDoctorAppointments`.

### 4.4 Payments (Cashfree)

- Purpose: Securely accept payments and finalize appointment bookings.

- Entry component/route: Payment components under `src/features/billing/components/` and routes `/payment-success`, `/payment-failure`, `/payment-pending`, `/payment-status`.

- Flow (observed):
  1. `createAppointmentHold` -> receive hold id.
  2. `initiatePaymentWithHold(paymentData)` sends hold + customer details to backend which returns payment session id.
  3. `cashfreeCheckout` (src/features/billing/components/cashfree.js) loads Cashfree SDK and calls checkout with `paymentSessionId`.
  4. Payment result handled via success/failure callbacks and status checked via `getPaymentStatus(orderId)`.

- Notable implementation details:
  - `cashfree.js` caches the `cashfree` instance (singleton) via `initializeCashfree()`.
  - `cashfree.js` has a `verifyPayment` function that calls a relative `/api/payment/verify/:sessionId` endpoint — this may not use `VITE_BACKEND_BASE_URL` (see Known Issues).

### 4.5 Video Consultations (Twilio)

- Purpose: Provide real-time video consultations for scheduled appointments.

- Entry component/route: `/video-preview/:appointmentId/:userType` -> `VideoCallPreviewPage`; `/video-call/:appointmentId/:userType/:userId` -> `VideoCallPage`.

- Flow: frontend calls `createVideoSession(appointmentId)` or `getVideoSession(appointmentId)` and then requests a Twilio token via `getVideoToken(appointmentId, userType, userId)` to join the room.

## 5. Data Flow & State Management

### AuthContext (src/context/AuthContext.jsx)

- Purpose: Global authentication state and helpers.

- State shape (JS object literal):

```javascript
{
  user: null | {
    role: string,      // 'doctor' | 'patient' | ...
    userId: number|string,
    token: string,
    loginMethod?: string
    // ...other fields returned by backend
  },
  loading: boolean
}
```

- Exported functions (from the context API):

```js
/**
 * login(userData: Object): void
 * - userData: object containing token, role, userId etc.
 */

/**
 * logout(): void
 */
```

- ASCII data-flow diagram:

```
User form submit
    |
    v
call api.loginUser()  ---> backend (auth)  ---> returns { user, token }
    |
    v
AuthContext.login(userData) -> localStorage.setItem('user')
    |
    v
React components using useAuth() re-render (routes, navbar visibility)
```

### Other stores/contexts

- No other React Contexts or Redux stores were found in the snapshot except `AuthContext.jsx`. Any additional client-side stores are TBD.

## 6. API Integration

- Base URLs per environment:
  - `VITE_BACKEND_BASE_URL` (primary; required for `src/api/api.js` via `import.meta.env.VITE_BACKEND_BASE_URL`). Example in README: `https://health-care-7oam.onrender.com/api` as one sample value.

- Auth endpoints (observed in `src/api/api.js` and README):
  - `POST ${baseURL}/auth/doctor/register` - register doctor
  - `POST ${baseURL}/auth/patient/register` - register patient
  - `POST ${baseURL}/auth/login/password?userType=...` - login with password
  - `POST ${baseURL}/auth/login/totp?userType=...` - login with TOTP
  - `POST ${baseURL}/auth/totp/setup` - setup TOTP
  - `POST ${baseURL}/auth/totp/confirm` - confirm TOTP
  - `POST ${baseURL}/auth/totp/disable` - disable TOTP

- Endpoint summary (grouped by domain) — examples from `src/api/api.js`:

Appointments:
- `POST /appointments/hold` - create appointment hold
- `GET /appointments/doctor/{id}` - fetch doctor appointments (paged)
- `GET /appointments/patient/{id}` - fetch patient appointments (paged)
- `DELETE /appointments/{id}` - cancel appointment
- `PUT /appointments/{id}` - reschedule appointment
- `GET /appointments/availability/{doctorId}?date=` - available slots

Availability:
- `POST /availability/{doctorId}` - set weekly availability
- `GET /availability/{doctorId}` - get availability
- `DELETE /availability/{doctorId}/{slotId}` - delete slot

Doctors:
- `GET /doctor/search?q=` - search doctors
- `GET /doctor/filter?...` - filter by specialization/gender
- `GET /doctor/{id}` - fetch doctor profile

Profiles:
- `GET /patient/profile` - fetch patient profile
- `PUT /patient/profile` - update patient profile
- `GET /doctor/profile` - fetch doctor profile (current)
- `PUT /doctor/profile` - update doctor profile

Video Calls:
- `POST /video-call/session/{appointmentId}`
- `GET /video-call/session/{appointmentId}`
- `GET /video-call/token/{appointmentId}`
- `POST /video-call/end/{appointmentId}`

Payments:
- `POST /payments/initiate` - create payment session (with hold)
- `GET /payments/status/{orderId}` - check status
- `GET /payments/payment-details/{patientId}` - payment history (paged & filterable)

- Sample request/response payloads (derived from JSDoc and code comments):

Request: create appointment hold

```json
POST /appointments/hold
{
  "patientId": 123,
  "doctorId": 456,
  "date": "2026-05-10",
  "startTime": "10:00",
  "reason": "consultation"
}
```

Expected (JSDoc-derived) response:

```json
"hold_abc123"  // string hold ID (the API returns hold id or hold object — exact server shape TBD)
```

Request: initiate payment

```json
POST /payments/initiate
{
  "appointmentHoldReference": "hold_abc123",
  "customerId": "patient-123",
  "customerPhone": "9999999999",
  "customerEmail": "user@example.com",
  "amount": 500
}
```

Response: (payment session wrapper) — shape TBD but `cashfree` session id is expected and used by `cashfreeCheckout`.

- Response transformations and conventions:
  - `src/api/api.js` returns `res.data` for all helper functions (no further normalization layer present).
  - `axios.interceptors.request` injects `Authorization: Bearer <token>` when `localStorage.user.token` is present.

- Caching strategy:
  - No explicit client-side caching (no TTL, no in-flight dedup implemented in `api.js`).
  - Server-side paging supported (page, size) for appointment/payment lists.

- Error handling conventions:
  - API functions generally `await axios...` and return `res.data`.
  - Errors thrown by axios propagate to callers (no global error normalization middleware in current snapshot).

## 7. Performance Optimizations

Observed optimizations implemented in code:

- Lazy-loading / Code-splitting
  - What: Use of `React.lazy()` for page components in `App.jsx`.
  - Why: Reduce initial bundle size and load pages on demand.
  - Code: see lazy imports at top of `src/App.jsx`.
  - Measured result: TBD

- Single-instance Cashfree initialization
  - What: `cashfree` SDK instance cached in `src/features/billing/components/cashfree.js` via `initializeCashfree()` (singleton pattern).
  - Why: Avoid reloading SDK multiple times and reduce network/work.
  - Code sample: present in `cashfree.js`.
  - Measured result: TBD

- Axios request interceptor
  - What: Adds `Authorization` header centrally to reduce duplicate header handling.
  - Why: Centralized auth header management.
  - Code: `apiClient.interceptors.request.use(...)` in `src/services/apiClient.js`.
  - Measured result: TBD

Not implemented or not observed (explicitly): request deduplication, batching, optimistic updates, virtualization, centralized TTL caching. Those items appear as opportunities for improvement.

## 8. Refactoring Guidelines/Coding Standards

No explicit coding standards document was found in the repository snapshot. The repository does include ESLint and uses JSDoc in `src/api/api.js`. The table below separates observed practices and recommended rules; where the team's rule is unknown, it is marked `TBD`.

1. Comments / JSDoc
   - Rule: Use JSDoc for public service functions (observed in `src/api/api.js`).
   - Bad:

```javascript
// no docs
export const fetchDoctor = () => axios.get('/doctor/1');
```

   - Good:

```javascript
/**
 * Fetch doctor by id
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const fetchDoctor = async (id) => { ... }
```

2. Naming & Modern Syntax (observed)
   - Rule: Functional components, named exports where appropriate, arrow functions used across files.
   - Bad: long anonymous default exports without clear names (TBD examples)
   - Good: named function components, e.g., `const Dashboard = () => {}` and `export default App;`

3. Linting
   - Rule: Use ESLint (present). Exact config: `eslint.config.js` exists — follow that file.

4. Dead code & debug logs
   - Rule: Remove console.debug and commented-out legacy code before merge (TBD: team policy). Observed console.error usage in `cashfree.js` and should be handled appropriately in production.

Full, authoritative coding standards are TBD (no CODE_OF_CONDUCT or CONTRIBUTING file with style rules was found).

## 9. Component Reference

Below are the key components discovered in the snapshot. This is a curated list; the Appendix contains a fuller file index.

- `src/App.jsx`
  - Purpose: Top-level router, route protection, lazy-loading of pages, and conditional navbar rendering (hides navbar on video call pages).
  - Key features: `PrivateRoute`, `PublicOnlyRoute`, role-based redirection (`Dashboard` chooses doctor vs patient view).
  - Props: none (top-level component)
  - Internal state: none (relies on `useAuth()`)
  - Styling: Tailwind classes; uses `LoadingSpinner` from `components/ui`.

- `src/main.jsx`
  - Purpose: React entry point that mounts `App` to `#root`.

- `src/context/AuthContext.jsx`
  - Purpose: Authentication context provider (state: `user`, `loading`).
  - Exports: `AuthProvider`, `useAuth()`.

- `src/api/api.js`
  - Purpose: Centralized API client and exported service functions.
  - Exports: `registerUser`, `loginUser`, `createAppointmentHold`, `fetchDoctorAppointments`, `fetchPatientAppointments`, `cancelAppointment`, `rescheduleAppointment`, `fetchDoctorAvailableSlots`, `setDoctorAvailability`, `fetchDoctorAvailability`, `deleteAvailabilitySlot`, `fetchDoctorsSearch`, `fetchDoctorsBySpecialization`, `fetchPatientProfile`, `fetchDoctorProfile`, `fetchDoctorProfileById`, `updatePatientProfile`, `updateDoctorProfile`, `createVideoSession`, `getVideoSession`, `getVideoToken`, `endVideoSession`, `initiatePaymentWithHold`, `getPaymentStatus`, `fetchPatientPayments`.

- `src/features/billing/components/cashfree.js`
  - Purpose: Cashfree SDK wrapper (initialize SDK, checkout helper, success/failure handlers, payment verification helper).
  - Notable caveats: `verifyPayment` uses a relative `/api/payment/verify/:sessionId` path (see Known Issues).

- `src/pages/*` and `src/features/*/pages/*`
  - Purpose: Top-level pages wired into routing in `App.jsx`.

For full file-by-file descriptions see the Appendix.

Primary service modules: `src/features/*/api/*.js` (aggregated by `src/api/api.js`).

- Purpose: Encapsulate backend HTTP interactions and present promise-returning functions to UI.

- Exported functions & JSDoc (summary — canonical definitions live in `src/api/api.js`):

  - `registerUser(data, type)` - registers doctor or patient
  - `loginUser(email, password, type)` - login via password
  - `forgotPasswordPatient(email)`, `forgotPasswordDoctor(email)`, `resetPassword(token,newPassword)`
  - `loginWithTOTP(email, code, userType)`, `setupTOTP()`, `confirmTOTP(secret, code)`, `disableTOTP()`
  - Appointment functions: `createAppointmentHold(holdData)`, `fetchDoctorAppointments(doctorId, params)`, `fetchPatientAppointments(patientId, params)`, `cancelAppointment(appointmentId)`, `rescheduleAppointment(appointmentId, date, startTime, endTime)`, `fetchDoctorAvailableSlots(doctorId, date)`
  - Availability functions: `setDoctorAvailability(doctorId, availabilityArray)`, `fetchDoctorAvailability(doctorId)`, `deleteAvailabilitySlot(doctorId, slotId)`
  - Doctors lookup: `fetchDoctorsSearch(q)`, `fetchDoctorsBySpecialization(specialization, gender)`
  - Profiles: `fetchPatientProfile()`, `fetchDoctorProfile()`, `fetchDoctorProfileById(doctorId)`, `updatePatientProfile(data)`, `updateDoctorProfile(data)`
  - Video: `createVideoSession(appointmentId)`, `getVideoSession(appointmentId)`, `getVideoToken(appointmentId, userType, userId)`, `endVideoSession(appointmentId)`
  - Payments: `initiatePaymentWithHold(paymentData)`, `getPaymentStatus(orderId)`, `fetchPatientPayments(patientId, options)`

- Cache configuration: None observed (no TTL or in-memory cache configuration present in `api.js`).

- Response normalization helpers: None centralized; callers receive `res.data` directly.

## 11. Known Issues & Solutions

| Issue | Root cause | Workaround / Fix |
|---|---|---|
| `cashfree.verifyPayment` uses a relative `/api/payment/verify/:sessionId` path while `src/api/api.js` is based on `VITE_BACKEND_BASE_URL` | Inconsistent use of absolute base URL vs relative path (mix of `fetch('/api/...')` and `axios` + env baseURL) | Fix: change `verifyPayment` to use `import.meta.env.VITE_BACKEND_BASE_URL` or call `initiatePaymentWithHold`/`getPaymentStatus` via `api.js`. Short-term: ensure dev proxy maps `/api` to backend. |
| Lack of client-side caching or in-flight dedup results in repeated calls when UI re-renders (observed for appointment/payment lists) | No caching layer implemented in `api.js` | Fix: implement request memoization or in-flight dedup (e.g., use react-query or a simple internal request map). |
| No global error normalization middleware; many `api.js` functions let axios errors bubble | APIs rely on caller to handle errors; inconsistent handling can surface to users | Fix: add error-transform helper and central axios response interceptor to normalize error payloads. |

## 12. Deployment & Development

- Local dev setup (copy-paste):

```bash
# clone and install
npm install

# start dev server (Vite)
npm run dev

# build for production
npm run build

# lint
npm run lint
```

- Environment variables (frontend):

  - `VITE_BACKEND_BASE_URL` - Base URL for backend API (required)
  - `VITE_TWILIO_ACCOUNT_SID` - Twilio credentials (optional)
  - `VITE_TWILIO_AUTH_TOKEN` - Twilio credentials (optional)
  - `VITE_CASHFREE_APP_ID` - Cashfree integration id (optional/production)
  - `VITE_CASHFREE_ENVIRONMENT` - `PRODUCTION` or `SANDBOX`

- Build commands: `npm run build` (Vite)

- Deployment targets & pipelines:
  - Vercel: `vercel.json` present and README documents Vercel-based deployment steps.
  - Docker: `Dockerfile` and `docker-compose.yml` present (frontend Docker deployment is possible but CI pipelines absent/TBD).

- Database migration commands: frontend-only; none defined (TBD in backend repository).

- Tests / linters / type checks:
  - Linter: `npm run lint` (ESLint). ESLint config present at `eslint.config.js`.
  - Tests: No test runner or test scripts present in `package.json` (TBD).

## 13. Appendix: File Reference

Alphabetical index of important files (snapshot):

- [src/App.jsx](src/App.jsx#L1) — Router, route protection, lazy-loaded pages.
- [src/main.jsx](src/main.jsx#L1) — React entry point, mounts `App`.
- [src/api/api.js](src/api/api.js#L1) — Centralized API client and exported service functions.
- [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L1) — Auth React Context provider; stores `user` in `localStorage`.
- [src/features/billing/components/cashfree.js](src/features/billing/components/cashfree.js#L1) — Cashfree SDK wrapper and helpers.
- [src/features/auth/components/LoginForm.jsx](src/features/auth/components/LoginForm.jsx#L1) — (component) Login form (lazy-loaded).
- [src/features/auth/components/RegisterForm.jsx](src/features/auth/components/RegisterForm.jsx#L1) — (component) Registration form.
- [src/features/dashboard/pages/DoctorDashboard.jsx](src/features/dashboard/pages/DoctorDashboard.jsx#L1) — Doctor dashboard page.
- [src/features/appointments/pages/DoctorAvailabilityPage.jsx](src/features/appointments/pages/DoctorAvailabilityPage.jsx#L1) — Doctor availability management page.
- [src/features/dashboard/pages/PatientDashboard.jsx](src/features/dashboard/pages/PatientDashboard.jsx#L1) — Patient dashboard page.
- [src/features/appointments/components/BookAppointment.jsx](src/features/appointments/components/BookAppointment.jsx#L1) — Booking UI.
- [src/features/appointments/pages/FindTherapistPage.jsx](src/features/appointments/pages/FindTherapistPage.jsx#L1) — Therapist discovery page.
- [src/features/video/pages/VideoCallPage.jsx](src/features/video/pages/VideoCallPage.jsx#L1) — Video call page.
- [vite.config.js](vite.config.js#L1) — Vite configuration.
- [README.md](README.md#L1) — Project README and quickstart instructions.

Files not listed above should be consulted directly in the `src/features` and `src/components` trees for implementation details.

## 14. Refactoring/ Migration History

The repository snapshot contains a `README` section that lists release notes. Below are the release notes copied from README (as the source-of-truth in this frontend snapshot):

- v1.3.0
  - Refactored entire project structure to Screaming Feature-Based Architecture (co-locating APIs, components, and pages inside domain folders under `src/features/`).
  - Configured `@/*` path aliasing in Vite config and JSConfig to resolve relative import clutter.
  - Formulated centralized base Axios client in `src/services/apiClient.js` with modular feature-based API endpoints.
  - Fixed various ESLint errors and warnings to make `npm run lint` pass successfully.

- v1.2.0
  - Payment history and enhanced UI
  - Centralized date-time utilities with IST formatting
  - Enhanced pagination & UX for payments

- v1.1.0
  - Cashfree payment gateway integration
  - Appointment hold system

- v1.0.0
  - Initial release: Authentication, appointment booking, video call integration, responsive design

For detailed per-commit refactors, commit history and changelog files are not available in the local snapshot (TBD). To populate a full migration history, run:

```bash
git log --pretty=oneline --abbrev-commit -n 50
```

and copy the resulting commit messages into this file.

---

Notes and action items (recommended next steps):

1. Replace relative `fetch('/api/...')` in `src/features/billing/components/cashfree.js` with `import.meta.env.VITE_BACKEND_BASE_URL` to ensure consistent base URL handling.
2. Add a client-side data fetching/cache library (react-query or SWR) to provide caching, in-flight dedup, and better error handling.
3. Add a `CONTRIBUTING.md` or `CODE_STYLE.md` to capture coding standards (JSDoc, ESLint rules, commit message format).
4. Add unit & integration tests and a CI job to run lint/tests on PRs.

TBD: Where the README or source code did not provide explicit facts (metrics, exact form fields, CI config, test runner), this document intentionally uses `TBD` rather than guessing. For any `TBD` item, run the recommended git and environment checks or consult the backend repository to complete the record.
