# 08 · Client changes: choose your challenge

Use a copy of your workshop code. The final reference includes grades and student/enrollment deletion; course deletion and search are intentionally left for students. Optional solution notes are in the separate `optional-solutions/` directory; do not open them before attempting a challenge.

## Beginner · Find a student quickly
**Problem:** the administrator has too many student records to scan.

**Requirements:** add a labeled student search input. Filter names and emails without case sensitivity; allow clearing the search; preserve safe DOM rendering and deletion behavior. This can be frontend-only for the small dataset.

**Hints:** retain the fetched student array separately from its filtered view. Use `trim().toLowerCase()`, `includes()` and an input event listener. Do not send an HTTP request on every keystroke for this version.

**Expected behavior:** searching “SARA” finds Sara, searching “@example” matches emails, an unmatched query shows “No matching students”, clearing restores the full list. Counts should clearly represent either totals or filtered totals.

**Acceptance criteria:** search by name/email, whitespace-only search shows everyone, empty results are understandable, search remains applied after refresh/mutations, keyboard operation works and text is rendered safely.

## Intermediate · Delete a course
**Problem:** an obsolete course must be removed from the catalog.

**Requirements:** add DELETE /api/courses/:id; use the same ID validation/error shape as other deletes; return 204 or 404, with 400 for invalid IDs. Add a confirmation button, refresh course selectors and enrollment records after deletion.

**Foreign-key impact:** the existing course foreign key uses ON DELETE CASCADE. Deleting a course removes its enrollments and their grades, but never students. No schema change is needed for that policy. Ask the client first: an alternative policy would reject deletion when enrollments exist and require a different SQL constraint/route behavior.

**Hints:** compare the student delete route. Use parameters and check changes, not a select-only assumption. Explain the cascade in the confirmation message.

**Expected behavior:** deleting an enrolled course removes it and its enrollment rows, while student records remain.

**Acceptance criteria:** 204/400/404 paths tested; UI warns of affected records; API constraints enforce cascade; deleted course disappears from dropdown; students and unrelated courses/enrollments survive.

## Advanced · Add student grades across the stack
**Starting point:** use the proposed pre-grades stage 09 once prepared, or an instructor-provided MVP copy without grade PATCH/UI. The complete reference already solves this requirement; do not implement it twice. To practice the database change too, start from a copy whose enrollments table has no grade column.

**Problem:** the client now wants one numeric result per student's course enrollment.

**Database requirements:** grade is REAL, NULL when ungraded, otherwise numeric 0–100; store it in enrollments. In a database without this field, plan a versioned migration rather than editing CREATE IF NOT EXISTS and expecting existing tables to change. For example, SQLite can add a nullable checked column with ALTER TABLE; if the field already exists, do not run ADD COLUMN again. Preserve records and back up before migration.

**API requirements:** add PATCH /api/enrollments/:id/grade with a JSON number. Reject missing/null/string/boolean/out-of-range values; use Number.isFinite; return 200 updated row, 400 invalid value/ID and 404 missing enrollment. Include grade in enrollment GET. Keep parameterized SQL.

**Frontend requirements:** add labeled numeric inputs, min/max and decimal support, Save action, clear ungraded display and status feedback. Convert nonempty input to a number; zero must remain visible. Do not rely on HTML validation as backend protection.

**Hints:** model Sara enrolled in two courses with different grades. Decide whether grade clearing is a separate requirement; the reference API does not allow clearing to null.

**Expected behavior:** 0, 88.5 and 100 persist and survive reload; ungraded is distinct from zero; -1, 101 and a string “90” are rejected by the API.

**Acceptance criteria:** schema integrity, parameterized update, GET output, UI persistence and isolated API tests all agree. No duplicate grade stored on students/courses. Explain how a retake requirement would require reconsidering the unique pair.
