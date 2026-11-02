# 07 · Live coding and checkpoint recovery

## Checkpoint status
This delivery contains the complete final application. **No checkpoint commits, branches or tags have been created.** The names below are a proposed plan, not commands you can successfully check out yet. A trustworthy checkpoint must be built and verified individually. Do not tag the final tree ten times: that would misrepresent progress.

## Working-stage plan
| Proposed tag | Files introduced/changed | Runnable behavior / verification gate |
| --- | --- | --- |
| 01-project-setup | package files, .gitignore, .env.example, minimal server.js | npm start serves a plain Express welcome response; no database routes yet. |
| 02-requirements-planning | docs/01, docs/02, architecture notes | Same runnable server; interview and MVP reviewed. |
| 03-database-schema | schema.sql, docs/04 | Server still runs; load schema into a disposable SQLite database and inspect tables with better-sqlite3. |
| 04-database-connection | database.js | Server runs; openDatabase(':memory:') creates tables and foreign_keys is 1. |
| 05-students-api | routes/students.js (GET/POST), error middleware, server mounts | Valid POST/GET work; bad email 400, duplicate 409. |
| 06-courses-api | routes/courses.js, server mount | Valid course POST/GET; bad title 400; students still work. |
| 07-enrollments-api | routes/enrollments.js (GET/POST), server mount | POST relationship, JOIN GET; duplicate 409, unknown reference 404. Grade column stays nullable but no grade PATCH yet. |
| 08-frontend | index.html, style.css, minimal script.js | Dashboard served with explicit “API integration next” message; form submits prevented and mutation controls disabled so it does not pretend to save. No grade controls yet. |
| 09-api-integration | full MVP script.js and corresponding HTML | Browser creates/lists students, courses and enrollments; loading, empty and error states work; no grade/deletion controls until their API exists. |
| 10-complete-application | delete routes, grade PATCH/UI, tests, seed, all docs | Complete reference; npm test and manual browser flow pass. |

The final tests target stage 10; earlier stages use their narrower gates above. Do not run final-stage tests against incomplete earlier APIs and describe those stages as broken. At stages 08/09 use markup matching only the available features.

## Preparing real snapshots later
Only after explicit permission to create Git commits/tags:
1. Use a separate instructor repository/directory. Leave this complete reference intact; do not reset or overwrite the user's existing history.
2. Build stage 01 from the minimal runnable server, install dependencies and verify its gate. Commit it and tag `01-project-setup`.
3. Add each stage incrementally, verify its listed behavior, then commit and tag the matching name. Keep tags local unless publishing is separately authorized.
4. Rehearse switching stages and reinstall with npm ci when dependency files change. Schema initialization is not a migration; use a separate disposable database per incompatible stage.

Do not paste commands that create tags before doing this work. The plan alone is not a snapshot generator.

## Moving between verified checkpoints
After real tags exist, check that your working tree is clean and save live work first. Create a new disposable folder/worktree per stage rather than discarding changes:
```sh
git worktree add --detach ../training-center-stage-05 05-students-api
cd ../training-center-stage-05
npm ci
npm start
```
Each worktree uses its own ignored data directory. Stop the other server or choose a different PORT in .env. A detached checkout is for demonstrating a stage; make a branch before doing work you want to retain. If you see “invalid reference”, the tags have not been prepared. Do not invent them on the spot.

## Recovery without Git tags
Before class, keep a tested copy named `training-center-reference` outside the live folder. If coding fails, stop the server, save student/instructor edits, open the reference copy, run npm ci, seed and start it. Explain the missed change using the corresponding route/file. Recover one file from a prepared copy only after saving your live version. Never delete a database or run git reset --hard as a classroom recovery shortcut.

## Prepare beforehand
- Node 24 LTS, package.json/package-lock.json and installed dependencies.
- README, requirements prompts, ERD and all workshop notes.
- CSS, HTML shell, course router, shared error handler, seed and full test harness.
- Full reference routes/renderers for pace recovery; final grade/deletion implementations.
- A working terminal, browser Network tools, sample curl commands and disposable database.

## Write live
- Client stories and MVP decisions.
- schema.sql (students first, then course/enrollment patterns).
- Core database.js initialization.
- server.js route wiring; students GET/POST and validation.
- Enrollments POST and JOIN GET.
- One labeled HTML form; Fetch helper, student rendering and submission; enrollment submission.
- One integration assertion, then run the full prepared suite.

## Pace control
Courses reuse the student pattern and are prepared to save time. CSS is read, not typed. Grade/deletion features are final-reference extensions. The advanced challenge starts from stage 09 or an instructor copy with grade functionality removed; it is not a request to duplicate code already present in the complete reference.
