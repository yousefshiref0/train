const express = require('express');
const path = require('node:path');
const { getDatabase } = require('./database');
const { errorHandler, httpError } = require('./middleware/errorHandler');

function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use('/api/students', require('./routes/students')(db));
  app.use('/api/courses', require('./routes/courses')(db));
  app.use('/api/enrollments', require('./routes/enrollments')(db));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use((req, res, next) => next(httpError(404, 'Resource not found.')));
  app.use(errorHandler);
  return app;
}
if (require.main === module) {
  try {
    const db = getDatabase();
    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
    const server = createApp(db).listen(port, () => console.log(`Training Center: http://localhost:${port}`));
    server.on('error', error => { console.error('Server startup failed:', error.message); db.close(); process.exitCode = 1; });
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { createApp };
