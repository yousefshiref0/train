# 02 · Plan a teachable delivery

## Objectives
Deliver a working browser → API → relational database flow. Let students justify the junction table, inspect HTTP responses and diagnose errors before adding convenience features.

## MVP and priorities
| Priority | Features | Reason |
| --- | --- | --- |
| MVP | Add/view students, add/view courses, enroll students, view enrollments | Completes the primary client workflow and exposes relationships. |
| Additional, included in final app | Delete students, remove enrollments, assign grades | Useful but requires destructive-action decisions and additional validation. |
| Future | Search, course deletion, authentication, pagination | Not necessary to demonstrate the core journey. |

Grades and deletion are excluded from the first MVP because they add policy discussions and failure cases without being needed to register participation. They remain fully implemented in the final reference project.

## Development roadmap
1. Agree acceptance criteria and draw entities (0–30 minutes).
2. Create schema and initialize database (30–55).
3. Implement student routes, reuse prepared course routes, build enrollment JOIN (55–85).
4. Inspect prepared accessible markup and connect Fetch (85–110).
5. Run tests, demonstrate grade extension and assign challenges (110–120).

## Technical decisions
HTML/CSS/vanilla JS reveal browser fundamentals. Express handles routing and JSON. SQLite runs without a database service. better-sqlite3 makes short queries easy to follow. Its synchronous calls suit this small workshop, not every workload. SQL is explicit; no ORM hides keys or JOINs. Express serves frontend and API from one origin, so CORS is unnecessary.

## Assumptions
One local administrator, small datasets, unique student email, no retakes, decimal 0–100 grades and UTC stored timestamps. Node 24 LTS and dependency installation are prepared before class.

## Risks and mitigations
- Installation/native module failure: preflight installation on instructor and student machines; keep the tested lockfile.
- Running late: use prepared CSS/course router and switch to a verified checkpoint copy.
- Unsafe deletion: explain cascade and require UI confirmation; API callers still have direct deletion access.
- Input tampering: backend checks plus SQL constraints; frontend checks improve usability only.
- Scope creep: place new requests in the future backlog.

## Production evolution
Add authentication and authorization before public exposure, migrations with tracked schema versions, rate limiting, structured logging, backups and restore tests, audit records, observability, secure transport and deployment configuration. Paginate lists and assess synchronous database load. Keep secrets out of Git. These are discussion topics, not claims of production readiness.
