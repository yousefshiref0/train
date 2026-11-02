# 05 · REST API reference

Base URL: `http://localhost:3000`. Send `Content-Type: application/json` for POST/PATCH. IDs are positive safe integers. Collection GETs return arrays ordered newest ID first. Dates are SQLite UTC strings (`YYYY-MM-DD HH:MM:SS`). No authentication is implemented: use locally.

## Common errors
Every error uses `{ "error": { "message": "..." } }`, never a stack trace. All endpoints may return 500 for unexpected server failures. POST/PATCH malformed JSON returns 400; bodies larger than 32 KB return 400. Unknown paths return 404. Invalid URL IDs return 400. Missing DELETE targets return 404. Unsupported method/path combinations return 404 in this small app.

## GET /api/students
Purpose: list students. Body: none. Success: 200.
```json
[{"id":1,"name":"Sara Ali","email":"sara@example.com","created_at":"2026-11-02 10:00:00"}]
```
```sh
curl http://localhost:3000/api/students
```

## POST /api/students
Purpose: register a student. Body: name and email strings. Name is trimmed, required, maximum 100 characters; email is trimmed/lowercased, maximum 254 characters, must match a reasonable `name@domain.suffix` format, and is unique without case sensitivity. Extra fields are ignored. Format validation does not verify email ownership.
```sh
curl -i -X POST http://localhost:3000/api/students -H 'Content-Type: application/json' -d '{"name":"Sara Ali","email":"sara@example.com"}'
```
201 response:
```json
{"id":1,"name":"Sara Ali","email":"sara@example.com","created_at":"2026-11-02 10:00:00"}
```
Errors: 400 invalid name/email; 409 duplicate email (including a constraint collision).

## DELETE /api/students/:id
Purpose: delete a student and cascade their enrollments; courses remain. Body: none. Success: 204, empty body. Errors: 400 invalid ID; 404 absent student.
```sh
curl -i -X DELETE http://localhost:3000/api/students/1
```

## GET /api/courses
Purpose: list courses. Body: none. Success: 200.
```json
[{"id":1,"title":"Database Fundamentals","description":"Learn SQL."}]
```
```sh
curl http://localhost:3000/api/courses
```

## POST /api/courses
Purpose: create a course. Title must be a nonblank string up to 150 characters after trimming. Description is optional, defaults to an empty string, must be a string up to 2000 characters and is trimmed. Titles are not unique.
```sh
curl -i -X POST http://localhost:3000/api/courses -H 'Content-Type: application/json' -d '{"title":"Database Fundamentals","description":"Learn SQL."}'
```
201 response:
```json
{"id":1,"title":"Database Fundamentals","description":"Learn SQL."}
```
Errors: 400 invalid title/description.

## GET /api/enrollments
Purpose: list enrollment records, joining student and course details. Body: none. Success: 200.
```json
[{"id":1,"student_id":1,"student_name":"Sara Ali","course_id":1,"course_title":"Database Fundamentals","grade":null,"enrolled_at":"2026-11-02 10:00:00"}]
```
```sh
curl http://localhost:3000/api/enrollments
```

## POST /api/enrollments
Purpose: connect an existing student and course. Body IDs must be positive JSON integers (numeric strings are rejected). The student/course pair must be unique. New enrollment grade is NULL; use PATCH to assign a grade.
```sh
curl -i -X POST http://localhost:3000/api/enrollments -H 'Content-Type: application/json' -d '{"student_id":1,"course_id":1}'
```
201 response (raw enrollment; GET supplies names):
```json
{"id":1,"student_id":1,"course_id":1,"grade":null,"enrolled_at":"2026-11-02 10:00:00"}
```
Errors: 400 invalid IDs; 404 missing student/course; 409 repeated pair. A database foreign-key collision also becomes 404.

## DELETE /api/enrollments/:id
Purpose: remove an enrollment without removing its student/course. Body: none. Success: 204, empty body. Errors: 400 invalid ID; 404 absent enrollment.
```sh
curl -i -X DELETE http://localhost:3000/api/enrollments/1
```

## PATCH /api/enrollments/:id/grade
Purpose: assign/update a grade. Body: `grade` must be a finite JSON number between 0 and 100 inclusive; decimals allowed. Missing value, null, strings and booleans are rejected. This endpoint does not clear grades.
```sh
curl -i -X PATCH http://localhost:3000/api/enrollments/1/grade -H 'Content-Type: application/json' -d '{"grade":88.5}'
```
200 response:
```json
{"id":1,"student_id":1,"course_id":1,"grade":88.5,"enrolled_at":"2026-11-02 10:00:00"}
```
Errors: 400 invalid ID/grade; 404 absent enrollment.

## Status summary
| Status | Meaning |
| --- | --- |
| 200 | List or grade update succeeded. |
| 201 | Record created. |
| 204 | Deleted, no response body. |
| 400 | Invalid input or JSON. |
| 404 | Resource/reference not found. |
| 409 | Unique email/enrollment conflict. |
| 500 | Unexpected internal failure, safe client message. |

## Reproducible curl walkthrough
Use a fresh disposable database or substitute actual returned IDs. Seeded databases already contain Sara's email, so creating Sara there correctly returns 409. Create student and course, note their returned IDs, POST enrollment using those IDs, GET joined records, PATCH using the returned enrollment ID, then DELETE enrollment and student. IDs and timestamps in examples are illustrative. In Windows PowerShell use `curl.exe`; JSON quoting can differ, so use a JSON file with `--data-binary @request.json` if needed.
