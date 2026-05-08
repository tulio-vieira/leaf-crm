## Project info

This repository holds the files for the Logos project. Logos is a web platform for managing multiple healthcare providers (Clínicas).

## Language & Currency
- All user-facing text (frontend labels, buttons, error messages, form fields, table headers, etc.) must be in **Brazilian Portuguese**.
- Currency is displayed and entered as **Brazilian Real** (R$ 80,00 format) on the frontend. Internally, prices are stored as integer cents (`PriceCents` field).
- Entity terminology: Clínicas (Healthcare Providers), Agendamentos (Treatment Sessions), Pacientes (Patients), Autorizações de Convênio (Insurance Authorizations).

## Core Features
- The platform allows us to manage Agendamentos (TreatmentSessions) for Pacientes. Each Agendamento can either be related to an Autorização de Convênio (InsuranceAuthorization), or it can have a price, which indicates that it is sold directly to the patient. In the future we will be adding notifications based on these records.
- We can manage Pacientes, Agendamentos and Autorizações de Convênio for Clínicas.
- Granular permission-based authorization controls access to all API endpoints. Each user can have one Role that stores their permissions.


### Technologies Used
- .NET Core 9 API as backend API
- PostgreSQL as database
- React Vite as front-end


## Backend Design:
- MVC (Model View Controller)

## Backend Models:
- User: represents a user that can login and use the platform.
- Role: represents a set of permissions for a User. One Role per User (1:1). Fields: UserGuid (FK, PK), Permissions (semicolon-separated string), CreatedAt, ModifiedAt, ChangedBy (email of last editor).
- Provider (Clínica): represents a healthcare provider.
- Patient (Paciente): represents a patient. We can schedule Agendamentos for a Paciente.
- InsuranceAuthorization (Autorização de Convênio): represents an insurance authorization for a patient. Autorizações de Convênio are necessary for scheduling Agendamentos covered by health insurance.
- InsuranceAuthorizationSnapshot: Represents a previous state of an Autorização de Convênio.
- TreatmentSession (Agendamento): represents a treatment session for a Paciente inside a Provider. The Agendamento can either be paid by the patient directly or covered by health insurance (attached to an Autorização de Convênio).
- Notification: These are notifications about the platform. Notifications are always related to a Provider.

## Insurance Authorization Monitoring

InsuranceAuthorizations have an optional monitoring system that tracks three status conditions:

### Monitor Flags
Boolean fields (default `true`) that opt each authorization into status tracking:
- `MonitorExpired` — track whether the authorization has passed its expiration date
- `MonitorAboutToExpire` — track whether expiration is within 7 days
- `MonitorAboutToBeFull` — track whether fewer than 5 sessions remain

### Status Fields
Computed booleans set automatically when the corresponding monitor flag is enabled:
- `Expired = now > ExpiresAt`
- `AboutToExpire = ExpiresAt < now + 7 days`
- `AboutToBeFull = RemainingSessions < 5`

### How Statuses Are Updated
- **On save/update (validation)**: All three status fields are recomputed if their monitor flag is enabled.
- **Hangfire job — `InsuranceAuthExpiredJob`**: Runs periodically; finds active authorizations past their expiration date that haven't been flagged yet, sets `Expired = true`, and sends a notification to subscribed provider users.
- **Hangfire job — `InsuranceAuthAboutToExpireJob`**: Runs periodically; finds active authorizations expiring within 7 days that haven't been flagged yet, sets `AboutToExpire = true`, and sends a notification.
- **`AboutToBeFull` has no Hangfire job** — it is only updated via validation when a record is saved.

## Authorization System

### Permission Format
Permissions are stored as semicolon-separated strings in `Role.Permissions`. Each permission follows this format:
- `providers{<providerSlug>}.<resource>:<action>` — scoped to a specific provider
- `providers{*}.<resource>:<action>` — wildcard, matches any provider
- `roles:read` / `roles:write` — flat permissions for admin operations

### Wildcard Matching
The `WildcardMatcher` (`logos-api/Authorization/WildcardMatcher.cs`) performs simple glob matching where `*` matches any sequence of characters. A permission with `providers{*}.patients:read` grants access to `providers{my-clinic}.patients:read`.

### RequirePermissionAttribute
`[RequirePermission("providers{<providerSlug>}.patients:read")]` on a controller action:
1. Resolves `{providerSlug}` from route values, then query string, defaulting to `*`
2. Reads all `"permission"` claims from the JWT
3. Returns 403 if no claim matches the resolved permission

### Permission Mapping per Endpoint
| Endpoint | Required Permission |
|---|---|
| GET/POST /api/providers | `providers{<slug>}.read/write` (slug → `*` when absent) |
| GET/PUT/DELETE /api/providers/{slug} | `providers{<slug>}.read/write/delete` |
| GET/POST /api/providers/{providerSlug}/patients | `providers{<providerSlug>}.patients:read/write` |
| PUT/DELETE /api/providers/{providerSlug}/patients/{id} | `providers{<providerSlug>}.patients:write/delete` |
| GET/POST /api/providers/{providerSlug}/patients/{patientId}/insurance-authorizations | `providers{<providerSlug>}.insurance-authorization:read/write` |
| GET/POST/PUT /api/providers/{providerSlug}/patients/{patientId}/treatment-sessions | `providers{<providerSlug>}.treatment-sessions:read/write` |
| GET /api/list/patients | `providers{<providerSlug>}.patients:read` (providerSlug from query) |
| GET /api/list/insurance-authorizations | `providers{<providerSlug>}.insurance-authorizations:read` |
| GET /api/list/notifications | `providers{<providerSlug>}.notifications:read` |
| GET /api/list/treatment-sessions | `providers{<providerSlug>}.treatment-sessions:read` |
| GET/POST/PUT/DELETE /api/roles | `roles:read` / `roles:write` |
| GET /api/users | `roles:read` |

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
- For now we are keeping the frontend as simple as possible, with just raw HTML. We are going to add styles later.
- Logic for communicating with the backend API should be kept inside `logos-frontend/src/services`.
- Please extend the patterns we are using. If you want to create a new one, ask for confirmation.
- We should attempt to keep our frontent react components simple and reusable. We should also aim to break down components between stateful ones and 'dumb' ones, if a component gets too large.
- **Styling**: We are using MaterialUI as the frontend UI package. Custom styles should be kept to a minimum for now. We should always aim to use MaterialUI components wherever possible.

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
