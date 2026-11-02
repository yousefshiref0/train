# 06 · Two-hour practical workshop

**Full Stack Development: From Planning to Production Concepts**

Target: mixed beginner/intermediate students. Students type, predict, run and inspect throughout; keep explanations to brief prompts while coding. This is about 108 minutes of hands-on activity, including interviews, ERD drawing, SQL and debugging. The complete reference is provided; nobody must type the full CSS in class.

## Preparation
Install Node 24 LTS, run `npm install`, `npm test`, `npm run seed`, and `npm start` before the room opens. Students need a terminal, editor and browser. Prepare dependency lockfile, CSS, HTML shell, course router, error middleware, seed script and tests. Keep a separate complete reference folder. Use the checkpoint plan in [07](07-live-coding-guide.md); named tags do not yet exist.

| Time | Activity |
| --- | --- |
| 0–15 min | Client Requirements and MVP |
| 15–30 min | ERD and Database Planning |
| 30–45 min | SQL Schema |
| 45–55 min | Database Connection |
| 55–70 min | Students API |
| 70–85 min | Enrollments API and JOIN |
| 85–95 min | Frontend Overview |
| 95–110 min | Frontend API Integration |
| 110–120 min | Testing and Challenge |

## 0–15 · Client Requirements and MVP
- **Objective:** turn a spreadsheet complaint into testable behavior.
- **Explain (1 minute):** a feature starts with a user's problem, not a library choice.
- **Live work:** pairs conduct the interview in 01; write three user stories and acceptance criteria in `docs/01-requirements.md`; mark the six MVP features in 02. No application code yet.
- **Expected output:** agreed unique email, many-to-many enrollment and deferred grades/deletion.
- **Ask:** “Can Sara take two courses? What happens if the same email is entered twice?”
- **Common mistake:** assuming retakes or student login without asking.
- **Debug:** replace vague “easy to use” with an observable successful registration.
- **Transition:** underline nouns to find entities.

## 15–30 · ERD and Database Planning
- **Objective:** model relationships before coding.
- **Explain (1 minute):** an enrollment connects a student to a course.
- **Live work:** draw the ERD in 04. Write `students(id, name, email)`, `courses(id, title, description)`, `enrollments(id, student_id, course_id)` and add timestamp/grade fields.
- **Expected output:** two one-to-many relationships and a unique student/course pair.
- **Ask:** “Where does Sara's grade for SQL belong? Is zero the same as ungraded?”
- **Common mistake:** storing a list of course IDs in one student column.
- **Debug:** use two students and two courses to test whether the diagram supports every pairing.
- **Transition:** translate each entity into CREATE TABLE.

## 30–45 · SQL Schema
- **Objective:** make invalid relationships impossible to store.
- **Explain (1 minute):** constraints protect data even when the UI is bypassed.
- **Code live:** `schema.sql`: students, courses, enrollments, keys, timestamp defaults, unique pair and grade CHECK. Use the complete file as the copy target; beginners type the students table, then adapt the others.
```sql
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
This abbreviated teaching snippet illustrates the pattern; use the full reference schema for all checks.
- **Expected output:** a valid schema file; at the next stage it creates three empty tables.
- **Ask:** “Which constraint prevents duplicate enrollment? What does CASCADE remove?”
- **Common mistake:** omitting the comma before a table-level UNIQUE constraint.
- **Debug:** inspect SQLite's error location; compare one table at a time. Re-running CREATE IF NOT EXISTS does not migrate old tables.
- **Transition:** open a connection and execute this file.

## 45–55 · Database Connection
- **Objective:** initialize persistent storage from Node.
- **Explain (30 seconds):** SQLite is a file, but foreign keys must be enabled per connection.
- **Code live:** core of `openDatabase()` in `database.js`; use the prepared try/catch and directory creation around it.
```js
const db = new Database(filename);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
return db;
```
- **Run:** `node -e "const db=require('./database').getDatabase(); console.log(db.pragma('foreign_keys')); db.close()"`.
- **Expected output:** foreign_keys equals 1; database file appears under data/.
- **Ask:** “Why use __dirname for schema.sql? Why should tests use another path?”
- **Common mistake:** executing schema from the wrong working directory.
- **Debug:** check file path, permissions and Node version; do not delete valued data.
- **Transition:** expose database rows through HTTP.

## 55–70 · Students API
- **Objective:** create and retrieve a resource.
- **Explain (1 minute):** request validation comes before SQL; database uniqueness remains authoritative.
- **Code live:** `createApp()` wiring in `server.js`, GET and POST handlers in `routes/students.js`. Reuse prepared centralized error middleware; defer DELETE to the final reference.
```js
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM students ORDER BY id DESC').all());
});
// Inside POST, after validating strings:
const result = db.prepare('INSERT INTO students (name, email) VALUES (?, ?)')
  .run(name.trim(), email.trim().toLowerCase());
```
- **Run:** `npm start`; use student curl examples in 05 with a fresh email.
- **Expected output:** 201 created, 200 list, 400 invalid email, 409 duplicate.
- **Ask:** “Can the browser's required attribute protect this endpoint from curl?”
- **Common mistake:** missing express.json(), sending strings instead of JSON, or interpolating SQL.
- **Debug:** check Network/body, content type and server terminal. Mount the prepared course router and create a course before the enrollment stage.
- **Transition:** two resources now exist; connect them.

## 70–85 · Enrollments API and JOIN
- **Objective:** persist a relationship and return useful display data.
- **Explain (1 minute):** IDs link records; JOIN retrieves names without copying them.
- **Code live:** POST and GET in `routes/enrollments.js`, including ID checks and existence checks. Copy prepared delete/grade handlers only after the MVP works.
```sql
SELECT e.id, s.name AS student_name, c.title AS course_title, e.grade
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id;
```
Use the full route query to include IDs and timestamps for the UI.
- **Expected output:** 201 for enrollment, joined array on GET, 409 on repeat, 404 for unknown IDs.
- **Ask:** “Why are both the pre-check and foreign-key constraint useful?”
- **Common mistake:** missing JOIN conditions, causing a Cartesian product.
- **Debug:** SELECT each table independently; verify actual IDs, not assumed IDs.
- **Transition:** render this JSON in the browser.

## 85–95 · Frontend Overview
- **Objective:** understand forms and DOM output locations.
- **Explain (30 seconds):** the browser never connects directly to SQLite.
- **Code live:** one form in `public/index.html`, then use the prepared remaining markup and `style.css`. Add labels, required/type attributes and the status element.
```html
<label for="student-name">Full name</label>
<input id="student-name" name="name" required maxlength="100">
```
- **Expected output:** the responsive dashboard loads at `/`; refresh and form events are connected next.
- **Ask:** “Why does the script use defer? What happens without a label?”
- **Common mistake:** selectors not matching element IDs, or opening HTML via file://.
- **Debug:** serve through Express at localhost:3000; inspect browser console and static file requests.
- **Transition:** replace static records with API responses.

## 95–110 · Frontend API Integration
- **Objective:** complete the browser → API → SQL → browser loop.
- **Explain (1 minute):** Fetch transport failures and HTTP errors are different.
- **Code live:** `apiRequest`, student form submit, GET student list rendering and enrollment POST in `public/script.js`. Use prepared renderers/action helpers for other sections.
```js
const response = await fetch('/api/students');
const students = await response.json();
const name = document.createElement('strong');
name.textContent = students[0]?.name || 'No students yet';
```
Then replace this small demo with the full helper, `response.ok` check and render functions from the reference. Use `preventDefault`, async/await and JSON.stringify for POST.
- **Expected output:** records persist after refresh; duplicate enrollment displays an error; buttons disable during requests.
- **Ask:** “What if the server stops? Why use textContent for a student's name?”
- **Common mistake:** forgetting await or trying response.json() after a 204 deletion.
- **Debug:** inspect Network and console, restart server, press Refresh records; never blindly retry a saved mutation after a refresh failure.
- **Transition:** prove behavior beyond a successful click.

## 110–120 · Testing and Challenge
- **Objective:** verify failures and introduce a changing client requirement.
- **Explain (30 seconds):** repeatable tests use their own data and port.
- **Code live:** one invalid-input assertion in `tests/api.test.js`; walk through temporary database and listen(0). Run the prepared suite with `npm test`.
```js
assert.equal((await request('/api/students', 'POST', {})).status, 400);
```
This snippet belongs inside the test's existing request-helper scope.
- **Expected output:** tests pass; app database remains unchanged. Demonstrate final grade PATCH, zero vs NULL, and deletion cascade.
- **Ask:** “Which layers change if the client requests grades? What is still missing for public deployment?”
- **Common mistake:** tests connecting to data/training-center.sqlite.
- **Debug:** verify openDatabase receives a temporary filename; use test failure name and HTTP response to isolate the layer.
- **Transition:** assign a difficulty level from 08, using the pre-grades checkpoint for the advanced challenge. Finish by tracing one request across all layers with students.
