# 03 · Follow one request

## Responsibilities
The user operates the browser. Frontend HTML supplies structure, CSS controls layout and JavaScript validates forms, sends Fetch requests and renders data. Express validates untrusted input, applies rules and selects status codes. SQLite persists records and enforces keys and constraints. These boundaries separate concerns without introducing extra layers.

```mermaid
flowchart TD
  U[User] --> B[Browser]
  B --> F[Frontend: HTML + CSS + JavaScript]
  F -->|HTTP requests / JSON| A[Express backend]
  A -->|Parameterized SQL| D[(SQLite database)]
  D -->|Rows| A
  A -->|HTTP status + JSON| F
```

## REST and JSON
Resources have URLs: GET reads a collection, POST creates a record, PATCH changes a grade and DELETE removes a record. A successful create returns 201, a deletion returns 204 without a body, and validation errors return a JSON error envelope. JSON carries values, not executable code; numeric IDs and grades are sent as numbers.

```mermaid
sequenceDiagram
  actor User
  participant UI as Browser frontend
  participant API as Express API
  participant DB as SQLite
  User->>UI: Submit student form
  UI->>API: POST /api/students (JSON)
  API->>API: Validate name and email
  API->>DB: INSERT with bound parameters
  DB-->>API: New ID or constraint error
  API-->>UI: 201 student JSON or 400/409 error
  UI->>API: GET /api/students
  API->>DB: SELECT students
  DB-->>API: Rows
  API-->>UI: 200 JSON array
  UI-->>User: Render safe text or error message
```

## Enrollment flow
```mermaid
flowchart TD
  A[Select student and course] --> B[POST enrollment JSON]
  B --> C{Positive integer IDs?}
  C -->|No| D[400 error]
  C -->|Yes| E{Both records exist?}
  E -->|No| F[404 error]
  E -->|Yes| G[INSERT enrollment]
  G --> H{Unique pair?}
  H -->|No| I[409 error]
  H -->|Yes| J[201 created]
  J --> K[GET enrollments with JOIN]
  K --> L[Render names, title and grade]
```

## Why the browser does not open SQLite
The browser is untrusted and cannot safely hold server filesystem access or enforce shared rules. A backend controls database access and validates every request. Hiding a button does not authorize an action. In production the backend also authenticates and authorizes callers.

## Debugging exercise
Open browser Network tools, submit a form and inspect method, URL, JSON body, status and response. Trace that request into a route, then its SQL statement. A Fetch promise does not reject just because HTTP returned 400: the request helper must check `response.ok`.
