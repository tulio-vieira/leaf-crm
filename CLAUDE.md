## Project info

This repository holds the files for the Leaf CRM project. Leaf CRM is a web platform for managing leads, sales, payments, customers and more.

## Language & Currency
- All user-facing text (frontend labels, buttons, error messages, form fields, table headers, etc.) must be in **Brazilian Portuguese**.
- Currency is displayed and entered as **Brazilian Real** (R$ 80,00 format) on the frontend. Internally, prices are stored as integer cents (`PriceCents` field).
- Entity terminology: Leads (Leads), Users (Usuários), Roles (Cargos).


## Core Features
- The platform allows us to manage Leads. We can view leads in either a list (`/leads`) or kanban board (`/boards/:id`).
- Granular permission-based authorization controls access to all API endpoints. Each user can have one Role that stores their permissions.

### Boards and Leads — Kanban Model
- A **Board** represents a sales funnel. It has a `name`, optional `description`, and a fixed ordered list of **columns** (stages), defined at creation time.
- A **Lead** belongs to exactly one Board (`boardId`) and sits in one column (`columnIdx` — a zero-based index into `board.columns`).
- Deleting a Board cascades and deletes all its Leads.
- `BoardDetail` (`/boards/:id`) loads the board and all its leads in parallel, then renders `BoardKanban`.
- `BoardKanban` uses `react-kanban-kit` to display leads grouped by column. Cards are draggable; dropping a card into a new column immediately calls `PUT /api/leads/{id}` to persist the new `columnIdx`. The update is applied optimistically to local state and reverted (via `onRefresh`) if the API call fails.
- Lead cards are clickable and navigate to `/leads/:id`.
- `listAllLeads({ boardId })` in `leadService.ts` fetches up to 100 leads for a given board without pagination — used for the kanban view. For paginated list views, use `listLeads(params)` instead.


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
- Board: a sales funnel with a name, optional description, and an ordered list of Column stages (stored as JSON via `OwnsMany(...).ToJson()`). Validation: at least 1 column, unique column names.
- Lead: belongs to a Board (`BoardId` FK) and a column position (`ColumnIdx`, 0-based index into `Board.Columns`). Fields: Name, Description, BoardId, ColumnIdx, CreatedAt, ModifiedAt, ChangedBy. Cascade delete from Board.


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


## Frontend Entity Management Pattern

Every new manageable entity (e.g. Lead, Board, Customer) must follow this structure. The **Leads** implementation (`LeadScreen`, `LeadDetail`, `LeadForm`, `LeadList`, `LeadListItem`, `leadService.ts`) is the canonical reference.

### 1. Domain type
Add the entity interface to `src/models/Domain.ts`.

### 2. Service file — `src/services/entityService.ts`
Export typed async functions: `listEntities`, `getEntity`, `createEntity`, `updateEntity`, `deleteEntity`. All return `APIResponse<T>` (from `backendService.ts`). Catch errors and return `{ errMsg }`.

### 3. Component files — `src/components/Entity/`

**`EntityForm.tsx`**
- Props: `entity?: Entity, onSuccess: () => void, onCancel: () => void`
- Always rendered as an **open MUI Dialog** — the caller conditionally renders the component, not the modal.
- Owns `PageState` for submission loading/error and any auxiliary fetches (e.g. dropdowns).
- If `entity` prop is present → update mode; otherwise → create mode.

**`EntityList.tsx`**
- Props: `items: Entity[], hasNextPage: boolean, onChanged: () => void`
- Dumb component: renders a MUI `Table` inside a `Paper`, maps items to `EntityListItem`, and renders `<PageSwitcher hasNextPage={hasNextPage} />` below.

**`EntityListItem.tsx`**
- Props: `entity: Entity, onChanged: () => void`
- One `<TableRow>`. Owns its own delete state (`PageState` + `<ConfirmDialog>`) and edit state (`showEditForm` boolean + `<EntityForm>`). Calls `onChanged()` after a successful delete or update.

### 4. Page files — `src/pages/`

**`EntityScreen.tsx`**
- State: `PageState<PagedResponse<Entity>>` for the list, `refreshKey: number`, `showCreateForm: boolean`, and any auxiliary state needed for filter dropdowns.
- Effects: fetch entities on `[searchParams, refreshKey]` change (extract `page` and filter params from `searchParams`); fetch auxiliary data (e.g. dropdown sources) on mount.
- Renders (top to bottom): page title + "Novo X" button → `<QueryFilters>` → loading/error/list.
- Mutations increment `refreshKey` to trigger a re-fetch.

**`EntityDetail.tsx`**
- Fetches entity by `useParams` id; owns `PageState<Entity>`.
- Shows all fields in a `Paper`. Top-right: Edit button (opens `EntityForm`) and Delete button (opens `ConfirmDialog`).
- Successful delete navigates back to the list route.
- Successful edit re-fetches the entity.

### 5. Routing & navigation
- Add `/entity` and `/entity/:id` as `<PrivateRoute>` entries in `src/App.tsx`.
- Add a nav item to the `navItems` array in `src/components/Layout.tsx`.

### 6. Key rules
- Use `PageState<T>` (from `src/models/PageState.ts`) instead of separate `isLoading`/`errMsg`/`data` states.
- All list screens must use `<QueryFilters>` for filters and `<PageSwitcher>` for pagination.
- Use `<ConfirmDialog>` for all destructive actions.
- All user-facing strings must be in **Brazilian Portuguese**.


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
