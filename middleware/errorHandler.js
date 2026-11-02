function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
function resourceId(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) {
    throw httpError(400, 'ID must be a positive integer.');
  }
  return Number(value);
}
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let message = status < 500 ? error.message : 'An unexpected server error occurred.';
  if (error.type === 'entity.parse.failed') { status = 400; message = 'Request body must be valid JSON.'; }
  if (error.type === 'entity.too.large') { status = 400; message = 'Request body is too large.'; }
  // Constraints remain the final defense, even if another request inserted first.
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') { status = 409; message = 'This email or enrollment already exists.'; }
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') { status = 404; message = 'Student or course does not exist.'; }
  if (['SQLITE_CONSTRAINT_CHECK', 'SQLITE_CONSTRAINT_NOTNULL'].includes(error.code)) {
    status = 400; message = 'Data violates a database validation rule.';
  }
  if (status >= 500) console.error(error);
  res.status(status).json({ error: { message } });
}
module.exports = { httpError, resourceId, errorHandler };
