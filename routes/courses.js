const express = require('express');
const { httpError } = require('../middleware/errorHandler');
module.exports = function coursesRoutes(db) {
  const router = express.Router();
  router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM courses ORDER BY id DESC').all()));
  router.post('/', (req, res) => {
    const { title, description = '' } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 150) throw httpError(400, 'Title is required (maximum 150 characters).');
    if (typeof description !== 'string' || description.length > 2000) throw httpError(400, 'Description must be text (maximum 2000 characters).');
    const result = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)').run(title.trim(), description.trim());
    res.status(201).json(db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid));
  });
  return router;
};
