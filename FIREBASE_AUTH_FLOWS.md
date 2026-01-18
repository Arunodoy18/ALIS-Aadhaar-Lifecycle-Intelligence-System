# Firebase Authentication Flow Diagrams

## Frontend Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Visits /auth                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │  Check Authentication State     │
         │  subscribeToAuthChanges()       │
         └──────────┬──────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
   User Logged In?          No
        │                      │
       YES                     ▼
        │          ┌──────────────────────────┐
        │          │   Show Auth Form        │
        │          │  - Email/Password       │
        │          │  - Google Sign-In       │
        │          └────────┬─────────────────┘
        │                   │
        │          ┌────────┴────────┐
        │          │                 │
        │      Email/Password    Google OAuth
        │          │                 │
        │          ▼                 ▼
        │   ┌────────────┐   ┌──────────────┐
        │   │loginWithEmail│  │signInWithGoogle│
        │   │signupWithEmail│  └──────┬────────┘
        │   └──────┬─────┘          │
        │          │                 │
        │          └────────┬────────┘
        │                   │
        │          ┌────────▼──────────┐
        │          │ Firebase Auth SDK │
        │          │ Verifies Credentials│
        │          └────────┬──────────┘
        │                   │
        │          ┌────────▼──────────┐
        │          │  Success/Error    │
        │          └────────┬──────────┘
        │                   │
        │          ┌────────▼──────────┐
        │          │ Set User Token    │
        │          │ in Local Storage  │
        │          └────────┬──────────┘
        │                   │
        └───────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Redirect to /         │
        │ (Dashboard)          │
        └──────────────────────┘
```

## Backend API Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│              Client Makes Protected API Request              │
│              GET /api/user/profile                           │
│              Headers: {                                      │
│                Authorization: "Bearer <TOKEN>"               │
│              }                                               │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │   Express Server        │
                │   authMiddleware()      │
                └────────┬────────────────┘
                         │
                ┌────────▼──────────┐
                │ Extract Token     │
                │ from Header       │
                └────────┬──────────┘
                         │
                ┌────────▼──────────────┐
                │ Verify Token with     │
                │ Firebase Admin SDK    │
                │ verifyIdToken()       │
                └────────┬──────────────┘
                         │
            ┌────────────┴──────────────┐
            │                           │
         Valid                      Invalid
            │                           │
            ▼                           ▼
    ┌───────────────┐        ┌──────────────────┐
    │ Decode Token  │        │ Return 403 Error │
    │ Set req.user  │        │ "Unauthorized"   │
    └────┬──────────┘        └──────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Check Role      │
    │ (if needed)     │
    └────┬────────────┘
         │
    ┌────┴─────────┐
    │              │
 Authorized    Not Authorized
    │              │
    ▼              ▼
┌────────────┐  ┌──────────────────┐
│ Call Route │  │ Return 401 Error │
│ Handler    │  │ "Forbidden"      │
└────┬───────┘  └──────────────────┘
     │
     ▼
┌──────────────────┐
│ Process Request  │
│ Return Data      │
└──────────────────┘
```

## Google OAuth Flow

```
┌──────────────────────────────────┐
│ User Clicks "Sign in with Google"│
└────────────┬─────────────────────┘
             │
             ▼
  ┌────────────────────────┐
  │ signInWithGoogle()     │
  │ Opens Google OAuth     │
  │ Popup Window           │
  └────────┬───────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │ User Grants Permissions  │
  │ (Google Popup)           │
  └────────┬─────────────────┘
           │
    ┌──────┴──────┐
    │             │
  Grant        Deny
    │             │
    ▼             ▼
┌──────┐   ┌─────────────┐
│      │   │ Show Error  │
│      │   │ Try Again   │
│      │   └─────────────┘
│      │
└──┬───┘
   │
   ▼
┌──────────────────────────┐
│ Firebase Receives Token  │
│ from Google              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Create/Update Firebase   │
│ User Account             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Generate Firebase ID     │
│ Token                    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Store Token in           │
│ Local Storage            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Redirect to Dashboard    │
└──────────────────────────┘
```

## User Management Flow

```
┌────────────────────────────────────────────────────┐
│              Admin Creates New User               │
│              POST /api/admin/create-user          │
│              Body: {                              │
│                email: "user@example.com",        │
│                password: "password123"            │
│              }                                    │
└──────────────┬──────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Authenticate Admin   │
    │ Verify Auth Token    │
    └────────┬─────────────┘
             │
    ┌────────▼──────────┐
    │ Check Admin Role  │
    └────────┬──────────┘
             │
      ┌──────┴──────┐
      │             │
   Admin          Not Admin
      │             │
      ▼             ▼
 ┌──────────┐   ┌──────────────┐
 │Continue  │   │Return 403    │
 │          │   │"Forbidden"   │
 └────┬─────┘   └──────────────┘
      │
      ▼
 ┌──────────────────────┐
 │ createUser()         │
 │ Firebase Admin SDK   │
 └────────┬─────────────┘
          │
   ┌──────▼──────┐
   │             │
Success       Error
   │             │
   ▼             ▼
┌────────┐   ┌──────────────┐
│Set Role│   │Return Error  │
│(optional)  │              │
└────┬───┘   └──────────────┘
     │
     ▼
┌──────────────┐
│Return UID &  │
│User Details  │
└──────────────┘
```

## Token Refresh Flow

```
┌────────────────────────────────────────────┐
│ User Makes API Request with Old Token      │
└───────────────┬──────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ Verify Token     │
        │ (Expired?)       │
        └────┬──────┬──────┘
             │      │
         Valid    Expired
             │      │
             ▼      ▼
        ┌────────┐ ┌──────────────────┐
        │Process │ │ Firebase Auto    │
        │Request │ │ Refreshes Token  │
        │        │ │ (Client-side)    │
        └────────┘ └────────┬─────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ New Token      │
                  │ Generated      │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Retry Request  │
                  │ with New Token │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Request        │
                  │ Succeeds       │
                  └────────────────┘
```

## Legend

```
┌────────┐    = Process/Function
│ Action │
└────────┘

   ──▶   = Flow direction
   │
   ▼     = Next step

  ◇      = Decision point
 ╱ ╲
```

---

**These diagrams illustrate how authentication flows through your ALIS application.**

For more details, see:
- Frontend flow: Check `frontend/src/lib/auth.ts`
- Backend flow: Check `security/firebase-auth/authMiddleware.js`
- Example routes: Check `backend/api/routes/authExamples.js`
