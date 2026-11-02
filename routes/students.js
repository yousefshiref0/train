const express = require('express');
const { httpError, resourceId } = require('../middleware/errorHandler');
module.exports = function studentsRoutes(db) {
  const router = express.Router();
  router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM students ORDER BY id DESC').all()));
  router.post('/', (req, res) => {
    const { name, email } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) throw httpError(400, 'Name is required (maximum 100 characters).');
    if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw httpError(400, 'A valid email is required (maximum 254 characters).');
    const result = db.prepare('INSERT INTO students (name, email) VALUES (?, ?)').run(name.trim(), email.trim().toLowerCase());
    res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid));
  });
  router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM students WHERE id = ?').run(resourceId(req.params.id));
    if (!result.changes) throw httpError(404, 'Student not found.');
    res.status(204).end();
  });
  return router;
};
