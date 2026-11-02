const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { openDatabase } = require('../database');
const { createApp } = require('../server');

test('REST API integration with an isolated temporary database', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'training-center-test-'));
  const db = openDatabase(path.join(directory, 'test.sqlite'));
  const server = createApp(db).listen(0, '127.0.0.1');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); db.close(); await rm(directory, { recursive: true, force: true }); });
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(url, method = 'GET', body) {
    const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, data: response.status === 204 ? null : await response.json() };
  }
  let student, course, enrollment;
  await t.test('create student', async () => {
    const result = await request('/api/students', 'POST', { name: ' Sara Ali ', email: 'SARA@example.com' });
    assert.equal(result.status, 201); student = result.data;
    assert.equal(student.name, 'Sara Ali'); assert.equal(student.email, 'sara@example.com'); assert.ok(student.created_at);
  });
  await t.test('get students', async () => { const result = await request('/api/students'); assert.equal(result.status, 200); assert.equal(result.data[0].id, student.id); });
  await t.test('reject invalid student data', async () => {
    for (const body of [{}, { name: ' ', email: 'a@b.com' }, { name: 'Sara', email: 'invalid' }, { name: 42, email: 'a@b.com' }, null]) assert.equal((await request('/api/students', 'POST', body)).status, 400);
  });
  await t.test('reject duplicate emails including case differences', async () => { assert.equal((await request('/api/students', 'POST', { name: 'Other', email: 'Sara@Example.com' })).status, 409); });
  await t.test('create and get course; reject invalid course', async () => {
    const result = await request('/api/courses', 'POST', { title: 'SQL' }); assert.equal(result.status, 201); course = result.data; assert.equal(course.description, '');
    assert.equal((await request('/api/courses')).data.length, 1);
    assert.equal((await request('/api/courses', 'POST', { title: '' })).status, 400);
    assert.equal((await request('/api/courses', 'POST', { title: 'SQL', description: 4 })).status, 400);
  });
  await t.test('create enrollment and verify JOIN', async () => {
    const result = await request('/api/enrollments', 'POST', { student_id: student.id, course_id: course.id }); assert.equal(result.status, 201); enrollment = result.data; assert.equal(enrollment.grade, null);
    const joined = (await request('/api/enrollments')).data[0]; assert.equal(joined.student_name, 'Sara Ali'); assert.equal(joined.course_title, 'SQL'); assert.ok(joined.enrolled_at);
  });
  await t.test('reject duplicate enrollment even for simultaneous submissions', async () => {
    const results = await Promise.all([1, 2].map(() => request('/api/enrollments', 'POST', { student_id: student.id, course_id: course.id })));
    results.forEach(result => { assert.equal(result.status, 409); assert.equal(typeof result.data.error.message, 'string'); });
  });
  await t.test('reject nonexistent student', async () => { assert.equal((await request('/api/enrollments', 'POST', { student_id: 9999, course_id: course.id })).status, 404); });
  await t.test('reject nonexistent course', async () => { assert.equal((await request('/api/enrollments', 'POST', { student_id: student.id, course_id: 9999 })).status, 404); });
  await t.test('reject invalid enrollment IDs', async () => { assert.equal((await request('/api/enrollments', 'POST', { student_id: '1', course_id: 1 })).status, 400); });
  await t.test('update grade including boundaries and decimals', async () => {
    for (const grade of [0, 88.5, 100]) { const result = await request(`/api/enrollments/${enrollment.id}/grade`, 'PATCH', { grade }); assert.equal(result.status, 200); assert.equal(result.data.grade, grade); }
  });
  await t.test('reject invalid grade', async () => {
    for (const grade of [-1, 101, '80', null, true, '', Infinity]) assert.equal((await request(`/api/enrollments/${enrollment.id}/grade`, 'PATCH', { grade })).status, 400);
    assert.equal((await request(`/api/enrollments/${enrollment.id}/grade`, 'PATCH', {})).status, 400);
  });
  await t.test('delete enrollment', async () => { assert.equal((await request(`/api/enrollments/${enrollment.id}`, 'DELETE')).status, 204); assert.deepEqual((await request('/api/enrollments')).data, []); });
  await t.test('delete student cascades enrollments', async () => {
    await request('/api/enrollments', 'POST', { student_id: student.id, course_id: course.id });
    assert.equal((await request(`/api/students/${student.id}`, 'DELETE')).status, 204);
    assert.deepEqual((await request('/api/enrollments')).data, []); assert.equal(db.prepare('SELECT count(*) AS n FROM enrollments').get().n, 0);
    assert.equal((await request('/api/courses')).data.length, 1);
  });
  await t.test('404 for nonexistent resources and routes', async () => {
    for (const [url, method, body] of [['/api/students/9999', 'DELETE'], ['/api/enrollments/9999', 'DELETE'], ['/api/enrollments/9999/grade', 'PATCH', { grade: 50 }], ['/api/unknown', 'GET']]) assert.equal((await request(url, method, body)).status, 404);
  });
  await t.test('invalid ID and malformed JSON return safe errors', async () => {
    assert.equal((await request('/api/students/1abc', 'DELETE')).status, 400);
    const response = await fetch(base + '/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: { message: 'Request body must be valid JSON.' } });
  });
  await t.test('database enforces foreign keys, uniqueness, grade checks', () => {
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
    assert.throws(() => db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(9999, course.id), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
    const id = db.prepare('INSERT INTO students (name, email) VALUES (?, ?)').run('Test', 'test@example.com').lastInsertRowid;
    assert.throws(() => db.prepare('INSERT INTO enrollments (student_id, course_id, grade) VALUES (?, ?, ?)').run(id, course.id, 101), { code: 'SQLITE_CONSTRAINT_CHECK' });
  });
  await t.test('static frontend is served by Express', async () => {
    for (const url of ['/', '/style.css', '/script.js']) { const response = await fetch(base + url); assert.equal(response.status, 200); assert.ok((await response.text()).length > 100); }
  });
});
