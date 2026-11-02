const express = require('express');
const { httpError, resourceId } = require('../middleware/errorHandler');
module.exports = function enrollmentsRoutes(db) {
  const router = express.Router();
  router.get('/', (req, res) => {
    res.json(db.prepare(`SELECT e.id, e.student_id, s.name AS student_name,
      e.course_id, c.title AS course_title, e.grade, e.enrolled_at
      FROM enrollments e JOIN students s ON s.id = e.student_id
      JOIN courses c ON c.id = e.course_id ORDER BY e.id DESC`).all());
  });
  router.post('/', (req, res) => {
    const { student_id, course_id } = req.body || {};
    if (!Number.isSafeInteger(student_id) || student_id < 1 || !Number.isSafeInteger(course_id) || course_id < 1) throw httpError(400, 'Student and course IDs must be positive integers.');
    if (!db.prepare('SELECT id FROM students WHERE id = ?').get(student_id)) throw httpError(404, 'Student not found.');
    if (!db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id)) throw httpError(404, 'Course not found.');
    const result = db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(student_id, course_id);
    res.status(201).json(db.prepare('SELECT * FROM enrollments WHERE id = ?').get(result.lastInsertRowid));
  });
  router.patch('/:id/grade', (req, res) => {
    const id = resourceId(req.params.id);
    const { grade } = req.body || {};
    if (typeof grade !== 'number' || !Number.isFinite(grade) || grade < 0 || grade > 100) throw httpError(400, 'Grade must be a finite number between 0 and 100.');
    const result = db.prepare('UPDATE enrollments SET grade = ? WHERE id = ?').run(grade, id);
    if (!result.changes) throw httpError(404, 'Enrollment not found.');
    res.json(db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id));
  });
  router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM enrollments WHERE id = ?').run(resourceId(req.params.id));
    if (!result.changes) throw httpError(404, 'Enrollment not found.');
    res.status(204).end();
  });
  return router;
};
