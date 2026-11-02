# 01 · Discover the client's problem

## Client scenario and problem statement
Nile Skills Training Center runs short technical courses. Its administrator copies student details into multiple spreadsheets. Duplicate emails, conflicting grade sheets and accidental deletions make it hard to answer “Who is enrolled in Database Fundamentals?” The owner wants one local web application for a single administrator to use during office hours.

## Stakeholders
- Owner: accurate records and affordable operation.
- Administrator: quick registration, enrollment and grade entry.
- Students: correct contact details and results; indirect users of this version.
- Instructor/developer: a clear, testable scope suitable for a two-hour workshop.

## Interview activity (pairs, 3 minutes)
Ask before proposing a framework. Have one student play the client.

| Developer question | Example client answer | Design consequence |
| --- | --- | --- |
| What identifies a student? Can emails repeat? | One email per student; case should not matter. | Case-insensitive unique email. |
| Can students take multiple courses? | Yes, and courses have multiple students. | Junction table. |
| What does a missing grade mean? | Not graded yet, which is different from zero. | Nullable grade. |
| What grading scale do you use? | Numeric 0–100, including decimals. | Number validation and SQL CHECK. |
| Can a student take the same course twice? | Not in this version. | Unique student/course pair. |
| What should deletion do? | Delete their enrollments too, after a warning. | Cascade and UI confirmation. |
| Will students sign in? | No, this is a local administrator demonstration. | Authentication deferred, not implied security. |
| Is email delivery required? | No. | Validate format only; no external service. |
| Should course titles be unique? | No; future cohorts may share titles. | No unique title rule. |
| Are grades editable or clearable? | Editable; clearing a recorded grade can wait. | PATCH accepts a number, not null. |

## Functional requirements and acceptance criteria
| ID | User story / requirement | Acceptance criterion |
| --- | --- | --- |
| F1 | As an administrator, I register students to retain their contact details. | Valid name/email returns 201 and appears in the list; missing/invalid data returns 400; repeated email returns 409. |
| F2 | I create courses so they can receive enrollments. | Required title and optional description persist and appear after refresh. |
| F3 | I enroll a student so I can track participation. | Existing IDs create one enrollment; repeat pair returns 409; absent student/course returns 404. |
| F4 | I view enrollment records so I can answer attendance questions. | Each row shows student, course, nullable grade and date using JOIN data. |
| F5 | I assign grades so I can record results. | Numeric 0–100 is saved; strings and out-of-range values return 400. |
| F6 | I remove enrollments to correct registrations. | Removal returns 204; subsequent removal returns 404. |
| F7 | I delete students to remove their records. | Confirmation precedes deletion; student and their enrollments disappear; courses remain. |

## Non-functional requirements
Readable JavaScript with separate routes; parameterized SQL; database integrity even outside the UI; consistent safe JSON errors; persistent local SQLite; keyboard-accessible responsive forms; no cloud, keys or build step; isolated repeatable API tests. Small workshop datasets should refresh promptly; no unmeasured performance SLA is claimed.

## Scope
A completed educational administrator dashboard for students, courses, enrollments and grades. See the planning document for the smaller live-coded MVP.

## Out of scope
Login, roles, payments, email, attendance, course schedules, multiple centers, retakes, audit history, deployment and production security controls. Ask students which excluded feature would change the schema most and why.
