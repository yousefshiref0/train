const $ = selector => document.querySelector(selector);
const statusBox = $('#status');
let loaded = false;
let busy = false;

async function apiRequest(url, options = {}) {
  let response;
  try {
    response = await fetch(`/api${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch { throw new Error('Cannot reach the server. Check your connection and try Refresh records.'); }
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Request failed.');
  return data;
}
function message(text, error = false) {
  statusBox.textContent = text;
  statusBox.classList.toggle('error', error);
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, action, className = 'secondary') {
  const node = element('button', text, className);
  node.type = 'button'; node.addEventListener('click', action);
  return node;
}
function setBusy(value) {
  busy = value;
  document.querySelectorAll('button').forEach(node => { node.disabled = value; });
  $('#enrollment-form button').disabled = value || !loaded || !$('#student-select').value || !$('#course-select').value;
}
async function loadRecords() {
  const [students, courses, enrollments] = await Promise.all([
    apiRequest('/students'), apiRequest('/courses'), apiRequest('/enrollments')
  ]);
  $('#student-count').textContent = students.length;
  $('#course-count').textContent = courses.length;
  $('#enrollment-count').textContent = enrollments.length;
  renderStudents(students); renderCourses(courses); renderEnrollments(enrollments);
  fillSelect($('#student-select'), students, 'name', 'Choose a student');
  fillSelect($('#course-select'), courses, 'title', 'Choose a course');
  loaded = true;
}
async function runAction(action) {
  if (busy) return;
  setBusy(true); message('Saving changes…');
  try {
    const success = await action();
    try { await loadRecords(); message(success); }
    catch (error) { message(`Change saved, but records could not refresh. ${error.message}`, true); }
  } catch (error) { message(error.message, true); }
  finally { setBusy(false); }
}
function fillSelect(select, records, field, prompt) {
  const selected = select.value;
  select.replaceChildren(new Option(records.length ? prompt : 'No records yet', ''));
  records.forEach(record => select.add(new Option(record[field], record.id)));
  if (records.some(record => String(record.id) === selected)) select.value = selected;
}
function renderStudents(students) {
  const container = $('#students'); container.replaceChildren();
  if (!students.length) container.append(element('p', 'No students yet. Register your first student above.', 'empty'));
  students.forEach(student => {
    const row = element('div', undefined, 'record'); const details = element('div');
    details.append(element('strong', student.name), element('p', student.email, 'muted'));
    row.append(details, button('Delete', () => {
      if (confirm(`Delete ${student.name} and all their enrollments?`)) runAction(async () => {
        await apiRequest(`/students/${student.id}`, { method: 'DELETE' }); return 'Student and their enrollments deleted.';
      });
    }, 'danger')); container.append(row);
  });
}
function renderCourses(courses) {
  const container = $('#courses'); container.replaceChildren();
  if (!courses.length) container.append(element('p', 'No courses yet. Add your first course above.', 'empty'));
  courses.forEach(course => {
    const row = element('div', undefined, 'record'); const details = element('div');
    details.append(element('strong', course.title), element('p', course.description || 'No description provided.', 'muted'));
    row.append(details); container.append(row);
  });
}
function renderEnrollments(enrollments) {
  const body = $('#enrollments'); body.replaceChildren();
  if (!enrollments.length) { const row = element('tr'); const cell = element('td', 'No enrollments yet. Choose a student and course above.', 'empty'); cell.colSpan = 5; row.append(cell); body.append(row); }
  enrollments.forEach(enrollment => {
    const row = element('tr'); row.append(element('td', enrollment.student_name), element('td', enrollment.course_title));
    const gradeCell = element('td'); const form = element('form', undefined, 'grade-form');
    const input = element('input'); input.type = 'number'; input.min = '0'; input.max = '100'; input.step = 'any'; input.required = true;
    input.value = enrollment.grade ?? ''; input.placeholder = '—'; input.setAttribute('aria-label', `Grade for ${enrollment.student_name} in ${enrollment.course_title}`);
    const save = element('button', 'Save', 'secondary'); save.type = 'submit';
    form.append(input, save); form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      runAction(async () => { await apiRequest(`/enrollments/${enrollment.id}/grade`, { method: 'PATCH', body: JSON.stringify({ grade: Number(input.value) }) }); return 'Grade updated.'; });
    }); gradeCell.append(form); row.append(gradeCell);
    const date = new Date(enrollment.enrolled_at.replace(' ', 'T') + 'Z');
    row.append(element('td', date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }), 'date'));
    const action = element('td'); action.append(button('Remove', () => {
      if (confirm(`Remove ${enrollment.student_name} from ${enrollment.course_title}?`)) runAction(async () => { await apiRequest(`/enrollments/${enrollment.id}`, { method: 'DELETE' }); return 'Enrollment removed.'; });
    }, 'danger')); row.append(action); body.append(row);
  });
}
for (const [selector, endpoint, success] of [['#student-form', '/students', 'Student registered.'], ['#course-form', '/courses', 'Course created.'], ['#enrollment-form', '/enrollments', 'Student enrolled.']]) {
  $(selector).addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (endpoint === '/enrollments') { data.student_id = Number(data.student_id); data.course_id = Number(data.course_id); }
    runAction(async () => { await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }); form.reset(); return success; });
  });
}
for (const select of ['#student-select', '#course-select']) $(select).addEventListener('change', () => setBusy(busy));
async function refresh() {
  if (busy) return;
  setBusy(true); message('Loading records…');
  try { await loadRecords(); message('Records are up to date.'); }
  catch (error) { message(error.message, true); }
  finally { setBusy(false); }
}
$('#refresh').addEventListener('click', refresh);
refresh();
