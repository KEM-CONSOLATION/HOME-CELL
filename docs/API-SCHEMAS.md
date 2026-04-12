# API schemas for HOME-CELL (backend reference)

> **Implementing the backend?** Start with **[BACKEND-BUILD-SPEC.md](./BACKEND-BUILD-SPEC.md)** — it describes **what to build** (entities, fields, relationships, checklist). **This file** is the **JSON contract** the app types against.

This document lists **request/response shapes** the web app expects. Paths are what the Next.js proxy forwards to your **base API URL** (often prefixed with `/api` on the server—align with your existing Swagger).

**Conventions**

- `Content-Type: application/json` for bodies.
- **Dates**: ISO 8601 strings (e.g. `2026-04-11T06:35:31.703Z`).
- **IDs**: integers for geographic/entity IDs unless noted.
- **Errors**: app reads `detail` (string or list) or `message` from JSON error responses; HTTP 401/403/419/498 trigger token refresh.

---

## 1. Authentication

### 1.1 Login

|                   |                                           |
| ----------------- | ----------------------------------------- |
| **Method / path** | `POST /auth/login/`                       |
| **Body**          | `{ "email": string, "password": string }` |
| **Success 200**   | See **TokenResponse** below               |

**TokenResponse**

```json
{
  "access": "string (JWT access token)",
  "refresh": "string (JWT refresh token)",
  "user": { "User object — see §8" }
}
```

The UI stores `access` / `refresh` and persists `user` when present. If `user` is omitted, the client sets `user` to `null` (you should return **user** for a good UX).

### 1.2 Refresh access token

|                   |                           |
| ----------------- | ------------------------- |
| **Method / path** | `POST /token/refresh/`    |
| **Body**          | `{ "refresh": "string" }` |
| **Success 200**   | `{ "access": "string" }`  |

---

## 2. States

Base collection path: `/auth/states/` (full URL on your server may be `/api/auth/states/`).

### 2.1 List states

|                  |                 |
| ---------------- | --------------- |
| **GET**          | `/auth/states/` |
| **Response 200** | `State[]`       |

**State (read)**

```json
{
  "id": 0,
  "name": "string",
  "created_at": "2026-04-11T06:35:31.703Z",
  "state_pastor": 0
}
```

### 2.2 Create state

|          |                 |
| -------- | --------------- |
| **POST** | `/auth/states/` |
| **Body** | **StateWrite**  |

**StateWrite**

```json
{
  "name": "string",
  "state_pastor": 0
}
```

**Response 200/201** | `State`

### 2.3 Retrieve / update / delete state

|                  |                                                                       |
| ---------------- | --------------------------------------------------------------------- |
| **GET**          | `/auth/states/{id}/`                                                  |
| **PUT**          | `/auth/states/{id}/` — body: **StateWrite** (full replace)            |
| **PATCH**        | `/auth/states/{id}/` — body: partial **StateWrite** (optional fields) |
| **DELETE**       | `/auth/states/{id}/`                                                  |
| **GET response** | `State`                                                               |

---

## 3. Areas

Base: `/auth/areas/`.

### 3.1 List areas

|                  |                |
| ---------------- | -------------- |
| **GET**          | `/auth/areas/` |
| **Response 200** | `Area[]`       |

**Area (read)**

```json
{
  "id": 0,
  "state_name": "string",
  "name": "string",
  "created_at": "2026-04-11T06:28:39.731Z",
  "state": 0,
  "area_leader": 0
}
```

### 3.2 Create area

|          |                |
| -------- | -------------- |
| **POST** | `/auth/areas/` |
| **Body** | **AreaWrite**  |

**AreaWrite**

```json
{
  "name": "string",
  "state": 0,
  "area_leader": 0
}
```

**Response** | `Area`

### 3.3 Single area CRUD

|            |                                             |
| ---------- | ------------------------------------------- |
| **GET**    | `/auth/areas/{id}/` → `Area`                |
| **PUT**    | `/auth/areas/{id}/` — body: **AreaWrite**   |
| **PATCH**  | `/auth/areas/{id}/` — partial **AreaWrite** |
| **DELETE** | `/auth/areas/{id}/`                         |

---

## 4. Zones

Base: `/auth/zones/`.

### 4.1 List zones

|                  |                |
| ---------------- | -------------- |
| **GET**          | `/auth/zones/` |
| **Response 200** | `Zone[]`       |

**Zone (read)**

```json
{
  "id": 0,
  "area_name": "string",
  "state_name": "string",
  "name": "string",
  "created_at": "2026-04-11T06:36:16.437Z",
  "area": 0,
  "zonal_leader": 0
}
```

### 4.2 Create zone

|          |                |
| -------- | -------------- |
| **POST** | `/auth/zones/` |
| **Body** | **ZoneWrite**  |

**ZoneWrite**

```json
{
  "name": "string",
  "area": 0,
  "zonal_leader": 0
}
```

### 4.3 Single zone CRUD

|            |                                             |
| ---------- | ------------------------------------------- |
| **GET**    | `/auth/zones/{id}/` → `Zone`                |
| **PUT**    | `/auth/zones/{id}/` — body: **ZoneWrite**   |
| **PATCH**  | `/auth/zones/{id}/` — partial **ZoneWrite** |
| **DELETE** | `/auth/zones/{id}/`                         |

---

## 5. Cells (fellowship cells)

Base: `/auth/cells/`.

### 5.1 List cells

|                  |                |
| ---------------- | -------------- |
| **GET**          | `/auth/cells/` |
| **Response 200** | `Cell[]`       |

**Cell (read)** — app accepts extra fields; these are required/used in UI:

```json
{
  "id": 0,
  "name": "string",
  "address": "string",
  "latitude": "string",
  "longitude": "string",
  "zone": 0,
  "zone_name": "string",
  "cell_leader": 0
}
```

Notes:

- `cell_leader` may be `null` if unassigned.
- `zone_name` is optional; shown in cell detail when present.

### 5.2 Create cell

|          |                |
| -------- | -------------- |
| **POST** | `/auth/cells/` |
| **Body** | **CellWrite**  |

**CellWrite**

```json
{
  "name": "string",
  "address": "string",
  "latitude": "string",
  "longitude": "string",
  "zone": 0,
  "cell_leader": null
}
```

(`cell_leader`: number or `null`.)

### 5.3 Single cell CRUD

|            |                                                                 |
| ---------- | --------------------------------------------------------------- |
| **GET**    | `/auth/cells/{id}/` → `Cell`                                    |
| **PUT**    | `/auth/cells/{id}/` — body: **CellWrite**                       |
| **PATCH**  | `/auth/cells/{id}/` — partial **CellWrite** (if you support it) |
| **DELETE** | `/auth/cells/{id}/`                                             |

---

## 6. User object (login & session)

Returned inside **TokenResponse** as `user`. The client expects:

**User**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "CELL_LEADER | ZONAL_LEADER | AREA_LEADER | STATE_LEADER | STATE_PASTOR | ADMIN",
  "unitId": "string",
  "unitName": "string",
  "avatar": "string (optional URL)"
}
```

- `unitId` / `unitName` are used for UI copy (e.g. “region”); **state switcher** matches `unitId` to `State.id` as a string when switching states.

---

## 7. Planned APIs (UI ready; not wired yet)

The app defines **target models** for future endpoints. Align naming/IDs with your DB.

### 7.1 Members

**Member**

```json
{
  "id": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "status": "NEW_CONVERT | MEMBER | WORKER | LEADER",
  "cellId": "string",
  "joinedAt": "string (ISO date)"
}
```

Suggested routes (example): `GET/POST /auth/members/`, `GET/PUT/PATCH/DELETE /auth/members/{id}/`.

### 7.2 New converts

**NewConvert**

```json
{
  "id": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "registeredAt": "string",
  "assignedCellId": "string",
  "followUpStatus": "PENDING | IN_PROGRESS | COMPLETED",
  "followUpNotes": "string"
}
```

### 7.3 Attendance

**AttendanceRecord**

```json
{
  "id": "string",
  "cellId": "string",
  "date": "string",
  "presentMemberIds": ["string"],
  "firstTimers": 0,
  "newConverts": 0,
  "totalAttendance": 0,
  "submittedBy": "string",
  "submittedAt": "string"
}
```

---

## 8. Hierarchy (reference)

```
State
  └── Area (state FK)
        └── Zone (area FK)
              └── Cell (zone FK)
```

Foreign keys in write payloads: `state`, `area`, `zone`, `area_leader`, `zonal_leader`, `cell_leader`, `state_pastor` are **integer user or entity IDs** as per your backend.

---

## 9. Source of truth in the repo

| Domain                               | TypeScript types                           |
| ------------------------------------ | ------------------------------------------ |
| States                               | `src/types/state.ts`                       |
| Areas                                | `src/types/area.ts`                        |
| Zones                                | `src/types/zone.ts`                        |
| Cells                                | `src/types/cell.ts`                        |
| User / Member / Attendance / Convert | `src/types/models.ts`                      |
| HTTP helpers                         | `src/lib/*-api.ts`, `src/lib/cells-api.ts` |
