# What the backend needs to build (brief for your developer)

**Purpose:** This is a **build checklist**—entities, fields, relationships, and behaviors the HOME-CELL web app depends on. It describes **what to create in the database and APIs**, not a copy of existing Swagger docs.

**Audience:** Backend engineer implementing models, migrations, permissions, and JSON APIs.

---

## 1. Domain overview

The product is a **hierarchy** for church / cell organization:

```
State (region)
  └── Area
        └── Zone
              └── Cell (home fellowship)
```

People (members, leaders) are referenced by **IDs** (usually user/account IDs you already have or will add).

The **web app** already calls authenticated JSON APIs for **State, Area, Zone, Cell** and **login/refresh**. Your job is to ensure the **data model supports this tree**, **FKs are consistent**, and **responses include the fields the UI shows** (e.g. denormalized names like `state_name` on an area).

---

## 2. Entities and fields to create

Use your own table names; below is the **logical model** the app expects in API responses.

### 2.1 `State`

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer PK | |
| `name` | string | Required; displayed everywhere |
| `state_pastor` | integer FK → User | Who pastors the state (user id) |
| `created_at` | datetime | Auto |

**Writes:** create/update need at least `name`, `state_pastor`.

---

### 2.2 `Area`

Belongs to one **State**.

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer PK | |
| `name` | string | Required |
| `state` | integer FK → State.id | Required |
| `area_leader` | integer FK → User | Required for the product rules |
| `created_at` | datetime | Auto |

**API read model:** the app shows `state_name` (string). Either **join in the serializer** or expose a nested state—**the list/detail responses must allow the UI to show the state name without extra round-trips.**

**Writes:** `name`, `state`, `area_leader`.

---

### 2.3 `Zone`

Belongs to one **Area** (and therefore indirectly to a **State**).

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer PK | |
| `name` | string | Required |
| `area` | integer FK → Area.id | Required |
| `zonal_leader` | integer FK → User | |
| `created_at` | datetime | Auto |

**API read model:** include **`area_name`** and **`state_name`** (strings) on list/detail so the UI can label rows without N+1 queries.

**Writes:** `name`, `area`, `zonal_leader`.

---

### 2.4 `Cell` (fellowship cell)

Belongs to one **Zone**.

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer PK | |
| `name` | string | Required |
| `address` | string | Physical location |
| `latitude` | string or decimal | App sends strings today |
| `longitude` | string or decimal | App sends strings today |
| `zone` | integer FK → Zone.id | Required |
| `cell_leader` | integer FK → User, nullable | Primary leader |
| `created_at` | optional | If you add it |

**API read model:** include **`zone_name`** (string) on detail/list if you can—**the UI uses it when present.**

**Writes:** `name`, `address`, `latitude`, `longitude`, `zone`, `cell_leader` (null allowed).

---

### 2.5 `User` (for leaders and login profile)

You likely already have a user model. The **web app** needs a **profile payload after login** (and for authorization) with at least:

| Field | Type | Notes |
|-------|------|--------|
| `id` | string (or int as string) | Stable id for client |
| `name` | string | Display name |
| `email` | string | |
| `role` | enum | See §4 |
| `unitId` | string | **Scope** the user operates in (e.g. current state id as string, or cell/zone id—**define one convention** and document it) |
| `unitName` | string | Human label (e.g. state name) for headers |
| `avatar` | string URL | Optional |

If login today only returns tokens, **extend** the login (or add `GET /me/`) so the SPA can render the dashboard and sidebar.

---

## 3. Relationships (constraints)

- Every **Area** must reference a valid **State**.
- Every **Zone** must reference a valid **Area**.
- Every **Cell** must reference a valid **Zone**.
- Leader fields (`state_pastor`, `area_leader`, `zonal_leader`, `cell_leader`) should reference **real users** (or be nullable where the product allows).

Enforce **on delete** behavior you prefer (restrict vs cascade); the UI assumes deletes can fail if children exist—return a clear `detail` message.

---

## 4. Roles (for permission rules)

The app filters navigation by **role**. Align your auth system with these **string** values (exact casing):

- `CELL_LEADER`
- `ZONAL_LEADER`
- `AREA_LEADER`
- `STATE_LEADER`
- `STATE_PASTOR`
- `ADMIN`

**Your developer should:** map each role to **who may CRUD** State / Area / Zone / Cell (you already hinted at “access restricted by role” in Swagger). Document the matrix for the team.

---

## 5. What you must expose (capabilities)

Not a duplicate of Swagger—this is the **minimum behavior** the product needs:

| Capability | Detail |
|------------|--------|
| **Login** | `POST /auth/login/` with JSON `{ "email", "password" }`. Issue `access` + `refresh` and return **user** in the same response when possible. |
| **JWT auth** | Support refresh endpoint used by the client (`POST /token/refresh/` with `{ "refresh" }` in this app). |
| **Login returns user** | Body should include **user profile** (§2.5), not only tokens. |
| **CRUD** | Full CRUD (or read + write where appropriate) for **State, Area, Zone, Cell** under `/auth/...` (or your chosen prefix), consistent with your existing API layout. |
| **List endpoints** | Return arrays with **enough denormalized labels** (`*_name` fields) for lists/tables. |
| **Integer IDs** | Prefer integer PKs for geographic entities; the app uses them in URLs and forms. |

---

## 6. Still needed for a complete product (Phase 2)

The UI has **screens** for these but **no live API** wired yet. Plan **models + REST** when you’re ready:

### Members

- Typical fields: identity, phone, address, **status** (e.g. NEW_CONVERT, MEMBER, WORKER, LEADER), **cell assignment**, **joined date**.
- CRUD + list + filter by cell/state as needed.

### New converts

- Registration data, **follow-up status**, **optional assigned cell**, notes, dates.

### Attendance

- Per report: **cell**, **date**, **totals**, **present member ids** (or a separate attendance line table), submitter, timestamps.

Your developer should design normalized tables (e.g. `AttendanceReport`, `AttendanceLine`) and expose APIs the frontend can bind to later.

---

## 7. Checklist you can paste into a ticket

- [ ] **State** table + FK to user for `state_pastor`
- [ ] **Area** table + FK to state + FK to user for `area_leader` + `state_name` in API responses
- [ ] **Zone** table + FK to area + FK to user for `zonal_leader` + `area_name` + `state_name` in API responses
- [ ] **Cell** table + FK to zone + nullable FK to user for `cell_leader` + optional `zone_name` in API responses
- [ ] **Login** returns **user** object with **role** + **unitId** / **unitName**
- [ ] **Refresh token** endpoint compatible with the SPA
- [ ] **Role-based rules** documented for who can create/edit/delete each level
- [ ] (Phase 2) Members, converts, attendance models and APIs

---

## 8. Related file in this repo

- [`API-SCHEMAS.md`](./API-SCHEMAS.md) — JSON shapes the **frontend** currently types against (useful for OpenAPI alignment). **This build spec** is the **work order**; the other file is **contract detail**.
