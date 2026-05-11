## Project info

This repository holds the files for the Leaf CRM project. Leaf CRM is a web platform for managing leads, sales, payments, customers and more.

## Language & Currency
- All user-facing text (frontend labels, buttons, error messages, form fields, table headers, etc.) must be in **Brazilian Portuguese**.
- Currency is displayed and entered as **Brazilian Real** (R$ 80,00 format) on the frontend. Internally, prices are stored as integer cents (`PriceCents` field).
- Entity terminology: Leads (Leads), Users (Usuários), Roles (Cargos).


## Core Features
- The platform allows us to manage Leads. We can view leads in either a list or kanban board. TODO: add more documentation here.
- Granular permission-based authorization controls access to all API endpoints. Each user can have one Role that stores their permissions.


### Technologies Used
- .NET Core 9 API as backend API
- PostgreSQL as database
- React Vite as front-end


## Backend Design:
- MVC (Model View Controller)
- TODO: talk about error handling here: we use exceptions, etc.
- **Model configuration**: Prefer data annotations over Fluent API. Place `[ForeignKey]`, `[DeleteBehavior]`, and `[Index]` directly on model properties/classes (namespaces: `System.ComponentModel.DataAnnotations.Schema`, `Microsoft.EntityFrameworkCore`). Exception: `OwnsMany(...).ToJson()` for JSON-stored owned collections must remain in `OnModelCreating` — no data annotation equivalent exists.

## Backend Models:
- User: represents a user that can login and use the platform.
- Role: represents a set of permissions for a User. One Role per User (1:1). Fields: UserGuid (FK, PK), Permissions (semicolon-separated string), CreatedAt, ModifiedAt, ChangedBy (email of last editor).
- Leads: (TODO: add description)


### Wildcard Matching
The `WildcardMatcher` (`leaf-api/Authorization/WildcardMatcher.cs`) performs simple glob matching where `*` matches any sequence of characters. A permission with `*:read` grants access to `users:read`.

### RequirePermissionAttribute
`[RequirePermission("roles:read")]` on a controller action:
1. Reads all `"permission"` claims from the JWT
2. Returns 403 if no claim matches the resolved permission


### Admin API Endpoints
- `GET /api/users` — paginated list of all users with `hasRole` field (requires `roles:read`)
- `GET /api/roles` — list all roles (requires `roles:read`)
- `GET /api/roles/{userGuid}` — get role for a user (requires `roles:read`)
- `POST /api/roles` — create role, body: `{ userGuid, permissions }` (requires `roles:write`)
- `PUT /api/roles/{userGuid}` — update role, body: `{ permissions }` (requires `roles:write`)
- `DELETE /api/roles/{userGuid}` — delete role (requires `roles:write`)

### Frontend Admin Screen
`/admin` — protected route, two tabs:
- **Users** tab: read-only paginated list of all users
- **Roles** tab: form to assign/edit a role + list of all roles with edit/delete actions

## Frontend Design
- Logic for communicating with the backend API should be kept inside `leaf-frontend/src/services`.
- Please extend the patterns we are using. If you want to create a new one, ask for confirmation.
- We should attempt to keep our frontent react components simple and reusable. We should also aim to break down components between stateful ones and 'dumb' ones, if a component gets too large.
- **Styling**: We are using MaterialUI as the frontend UI package. We should always aim to use MaterialUI components wherever possible.
- The theme is on the darker side, but not too dark. The primary color is on the purple side and secondary should be on the cyan side. We are going for a modern look. Keep in mind this is a sales app.

## Frontend Querying
- Whenever querying for items, we should always keep use query params.
- The frontend queries always result in updates to the query params that are passed to the backed. We use query filter component for this.


## QueryFilters frontend component
It is a generic, reusable component that accepts a declarative `filterItems` config and handles the add-filter flow, applied-filter state, chip display, and query-string construction — so future query views can delegate all of this to one place.
Whenever we use frontend queries, we shoud use QueryFilters component. We should consider expanding QueryFilters if it doesn't suite our use cases.


## Authentication

The app uses JWT authentication with an HttpOnly cookie for the access token.

### How it works
- On login or token refresh (`POST /api/auth/login`, `POST /api/auth/refresh-token`), the backend sets an `access_token` HttpOnly cookie. The token is also returned in the JSON body for Postman/API testing.
- All frontend requests send the cookie automatically (axios is configured with `withCredentials: true`).
- The backend's JwtBearer middleware reads the token from the `access_token` cookie first. If absent, it falls back to the `Authorization: Bearer` header — preserving Postman compatibility.
- When the access token expires the backend returns HTTP 401 with `{ errorCode: "access_token_expired" }`. The frontend's `withRetry` in `backendService.ts` catches this, calls `refreshCreds()`, and retries the original request once.
- Logout (`POST /api/auth/logout`) clears the cookie server-side. The frontend cannot clear HttpOnly cookies directly.
- The refresh token is stored in `localStorage` and sent in the POST body to `auth/refresh-token`. It is not stored in a cookie.

### Cookie attributes
| Attribute | Value | Reason |
|---|---|---|
| `HttpOnly` | `true` | Prevents XSS access to the token |
| `SameSite` | `Lax` | Allows same-site cross-port requests (dev: frontend :9000 → API :7111) |
| `Secure` | `false` | Dev only — set `true` in production over HTTPS |
| `Domain` | (not set) | Omitted to avoid browser quirks with `Domain=localhost` |
| `Path` | `/` | Sent with all API requests |
| `Expires` | `AccessTokenExpiryMinutes` from `JWTOptions` | Mirrors the JWT lifetime |

### Frontend auth state
- `AuthContext` holds `username` and `email` in React state.
- `localStorage` persists `refreshToken`, `email`, and `username` across page reloads. On reload, the refresh token is used to silently obtain a new access token cookie on the first authenticated request (via the 401 → refresh → retry flow in `withRetry`).
- `backendAPI.setRefreshData()` loads email and refresh token from localStorage into the `BackendAPI` singleton at startup.
