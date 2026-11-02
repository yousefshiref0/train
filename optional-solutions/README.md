# Optional instructor solution notes · spoilers

These notes are separate from student-facing challenge instructions. They are implementation outlines, not automatically applied patches.

## Search
Keep `allStudents` and `searchText` state in script.js. In loadRecords assign allStudents, then call renderStudents with a filtered array. On the labeled search input's input event update searchText and re-render. Filter with `[student.name, student.email].some(value => value.toLowerCase().includes(searchText.trim().toLowerCase()))`. Distinguish no students from no matches. Keep the existing textContent renderer and total count semantics.

## Course deletion
Import resourceId and httpError in routes/courses.js. Before returning the router, add:
```js
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM courses WHERE id = ?')
    .run(resourceId(req.params.id));
  if (!result.changes) throw httpError(404, 'Course not found.');
  res.status(204).end();
});
```
In renderCourses add a danger button with confirmation mentioning enrollment/grade loss. Use runAction to call DELETE and refresh all lists. Add isolated tests for the cascade and students surviving it.

## Grades
The completed schema.sql, enrollment PATCH handler, renderEnrollments grade form and grade integration tests are the reference solution. For a pre-grades schema, an illustrative one-time migration is:
```sql
ALTER TABLE enrollments ADD COLUMN grade REAL
CHECK(grade IS NULL OR (typeof(grade) IN ('integer', 'real') AND grade BETWEEN 0 AND 100));
```
Track that migration's version and apply it once; the complete reference already has grade, so do not execute this there. Copy the final route/UI only after implementing and testing your own version.
