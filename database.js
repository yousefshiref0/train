const Database = require('better-sqlite3');
const fs = require('node:fs');
const path = require('node:path');

// Each call opens and initializes its own connection, including test connections.
function openDatabase(filename = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'training-center.sqlite')) {
  let db;
  try {
    if (filename !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
    db = new Database(filename);
    db.pragma('foreign_keys = ON');
    db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    return db;
  } catch (error) {
    if (db) db.close();
    throw new Error('Could not initialize SQLite database. Check its path and permissions.', { cause: error });
  }
}

// Lazy access prevents importing the server in tests from opening the normal database.
let connection;
function getDatabase() {
  if (!connection) connection = openDatabase();
  return connection;
}
module.exports = { openDatabase, getDatabase };
