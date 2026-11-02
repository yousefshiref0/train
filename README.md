# Training Center Management System

**Full Stack Development: From Planning to Production Concepts** — a complete local application and two-hour university workshop for beginner/intermediate developers.

Follow the journey from a spreadsheet-based client problem through requirements, MVP planning, relational design, REST endpoints, browser integration and automated tests. This is an educational MVP, not a production-ready administration service.

## Technologies and features
Node.js 24 LTS, Express, SQLite with better-sqlite3, HTML5, CSS3 and vanilla JavaScript/Fetch. No ORM, build step, frontend server, external API, cloud account, key or Docker required.

- Register/list students; validate unique case-insensitive emails; delete students with cascading enrollments.
- Create/list courses with optional descriptions.
- Enroll students, reject duplicates, view joined records and remove enrollments.
- Assign decimal grades from 0 to 100; distinguish ungraded NULL from zero.
- Responsive light dashboard with green accents, labeled forms, safe text rendering, loading/empty/error states and deletion confirmations.
- Parameterized SQL, relational constraints, safe centralized JSON errors and isolated API tests.

## Prerequisites
Install **Node.js 24 LTS** (npm included). Check `node --version` and `npm --version`. Use a terminal, editor and modern browser. The project is intended for macOS, Windows and Linux; this delivery was executed on macOS with Node 24.16.0. Other platforms were not executed here. better-sqlite3 uses a native addon; supported platforms typically use prebuilt binaries, otherwise a compiler toolchain may be required.

## Install and run
From the directory containing this README:
```sh
npm install
npm run seed
npm start
```
Open [http://localhost:3000](http://localhost:3000). Express serves both the dashboard and `/api` endpoints. Stop with Ctrl+C. Database tables and `data/training-center.sqlite` are created automatically. Run from this directory so relative configuration paths remain predictable.

For reproducible installation once the lockfile exists, use `npm ci`.

## Configuration
Optional: copy `.env.example` to `.env` using your editor or file manager. npm scripts load it with Node's built-in environment-file support; no dotenv dependency is needed.

| Variable | Default | Purpose |
| --- | --- | --- |
| PORT | 3000 | HTTP server port (1–65535). |
| DATABASE_PATH | project data/training-center.sqlite | SQLite file path; configured relative paths resolve from the working directory. |

No `.env` file is required. Node may print “.env not found. Continuing without it.”; defaults still work. Do not open the frontend via file://. Keep this unauthenticated demo on a trusted local machine; do not expose it publicly.

## Seed data
`npm run seed` adds Ahmed Mohamed, Sara Ali, Omar Hassan and Mariam Khaled, three courses and five enrollments. It runs in a transaction and is safe to repeat: existing sample students/enrollment pairs are preserved and matching course titles are reused. It does not reset grades or edit existing records. Course titles are not globally unique; the seed selects the earliest matching title. Deleting sample data and seeding again intentionally restores missing samples.

## Automated tests
```sh
npm test
```
The built-in Node test runner opens a separate temporary SQLite file, starts Express on port 0 (an OS-assigned free port), then closes the server/connection and removes the temporary directory. It never opens the normal application database. The suite covers CRUD, input validation, conflicts, missing resources, JOIN output, grade boundaries, database constraints, cascade deletion, malformed JSON and static files.

## Manual smoke test
1. Seed, start and check totals: 4 students, 3 courses, 5 enrollments.
2. Register a new email and refresh; it persists. Try the same email again for a conflict.
3. Add a course; select student/course and enroll. Repeat for a duplicate error.
4. Save grade 0, 88.5 or 100; reload. Try an invalid grade through curl to bypass HTML validation.
5. Remove an enrollment; delete the new student and check only their enrollments disappear.
6. Stop the server and press Refresh records to see network feedback, then restart.

## Project structure
```text
training-center/
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── .env.example
├── server.js
├── database.js
├── schema.sql
├── routes/
│   ├── students.js
│   ├── courses.js
│   └── enrollments.js
├── middleware/
│   └── errorHandler.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docs/
│   ├── 01-requirements.md
│   ├── 02-planning.md
│   ├── 03-system-architecture.md
│   ├── 04-database-design.md
│   ├── 05-api-documentation.md
│   ├── 06-workshop-guide.md
│   ├── 07-live-coding-guide.md
│   ├── 08-challenges.md
│   └── dashboard-preview.png
├── tests/
│   └── api.test.js
├── scripts/
│   └── seed.js
└── optional-solutions/
    └── README.md
```
`data/` and `node_modules/` are generated and ignored. `database.js` exports `getDatabase()` for the lazy application connection and `openDatabase(filename)` for explicit isolated connections. `server.js` exports `createApp(db)`, keeping listening and storage under caller control in tests. Route factories receive that connection; no extra service/repository layers are needed for this small project.

## API overview
| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | /api/students | List / create student. |
| DELETE | /api/students/:id | Delete student and their enrollments. |
| GET / POST | /api/courses | List / create course. |
| GET / POST | /api/enrollments | List joined records / enroll. |
| DELETE | /api/enrollments/:id | Remove enrollment. |
| PATCH | /api/enrollments/:id/grade | Assign numeric grade. |

Successful lists/updates return 200, creation 201 and deletion 204 with no body. Errors use `{ "error": { "message": "..." } }` and 400/404/409/500. See the API reference for exact request bodies and curl examples.

## Workshop documentation
1. [Client requirements and interview](docs/01-requirements.md)
2. [MVP and planning](docs/02-planning.md)
3. [Architecture and request lifecycle](docs/03-system-architecture.md)
4. [Database design and ERD](docs/04-database-design.md)
5. [API reference and curl](docs/05-api-documentation.md)
6. [Timed two-hour teaching guide](docs/06-workshop-guide.md)
7. [Checkpoint plan, preparation and recovery](docs/07-live-coding-guide.md)
8. [Student challenges](docs/08-challenges.md)

Optional instructor spoilers live separately in [optional-solutions](optional-solutions/README.md).

## Teaching sequence and preparation
Teach requirements → ERD → schema → connection → student routes → prepared course routes → enrollment POST/JOIN → HTML form → Fetch integration → tests and client change. Prepare CSS/HTML shell, dependency installation, course router, error middleware, seeds, test harness and complete reference before class. Write core SQL, database initialization, student/enrollment handlers, one form, Fetch helper/rendering and one assertion live. The workshop guide has exact times, outputs, questions, mistakes and transitions.

The ten Git checkpoints are **documented plans only**. No commits or tags were created. Prepare and verify each incremental stage before class; never tag the same final tree as ten different learning stages. The advanced grades challenge targets a pre-grades MVP, while this complete reference already includes grades.

## Troubleshooting
| Symptom | Check / fix |
| --- | --- |
| npm cannot resolve registry | Check Internet/proxy/DNS; installation needs npm registry access. |
| Native binding missing or ABI mismatch | Use Node 24 LTS, then npm ci under that version; install your platform's compiler tools only if prebuilt installation fails. |
| EADDRINUSE | Stop the other server or set another PORT in .env. |
| Database initialization fails | Check DATABASE_PATH and folder write permissions. |
| Table does not acquire a new column | CREATE IF NOT EXISTS is initialization, not migration; apply a versioned migration. Recreate only disposable demo data after stopping the server. |
| API says duplicate | Reuse existing records or choose a new email/pair; repeated seed does not reset data. |
| 404 for enrollment reference | GET students/courses and use real numeric IDs; do not assume IDs begin at 1. |
| Dashboard cannot connect | Start Express, visit its HTTP URL and press Refresh records; inspect Network tools. |
| API curl JSON fails on Windows | Use curl.exe and a JSON request file with --data-binary @request.json. |
| Tests cannot listen on localhost | Allow local HTTP server access in the execution environment; tests need no public network. |

## Limits and production discussion
No authentication/authorization, audit history, grade clearing, retakes, search, course deletion UI, pagination or production deployment setup. Student and enrollment deletion are permanent. Grade checks and foreign keys protect integrity, not access control. Synchronous database work and full-list refreshes are intentionally simple for small datasets.

Before deployment consider authentication, roles, rate limiting, security headers/HTTPS, validated configuration, structured logging, monitoring, schema migrations, backup/restore, privacy retention, deployment topology and load testing. Do not treat editing schema.sql as a production upgrade strategy.

## Validation in this delivery
Executed on Node 24.16.0/macOS: dependency installation succeeded; npm audit reported no vulnerabilities at installation time; npm test reported 19 passes (18 behavioral subtests plus their parent), zero failures. Seed ran twice and totals remained 4/3/5. npm start served port 3000. Browser checks verified loaded records, responsive narrow layout, duplicate email feedback and refresh. Cross-platform execution and production load testing were not performed.

Dependency references: [Express installation](https://expressjs.com/en/starter/installing.html), [better-sqlite3](https://www.npmjs.com/package/better-sqlite3).
