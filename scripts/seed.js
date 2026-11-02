const { getDatabase } = require('../database');
const db = getDatabase();
try {
  db.transaction(() => {
    const students = [ ['Ahmed Mohamed', 'ahmed@example.com'], ['Sara Ali', 'sara@example.com'], ['Omar Hassan', 'omar@example.com'], ['Mariam Khaled', 'mariam@example.com'] ];
    for (const student of students) db.prepare('INSERT INTO students (name, email) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').run(...student);
    const courses = [ ['Full Stack Development', 'Build web applications from browser to database.'], ['Database Fundamentals', 'Model relationships and write SQL queries.'], ['Introduction to Artificial Intelligence', 'Explore the foundations of intelligent systems.'] ];
    for (const course of courses) {
      if (!db.prepare('SELECT id FROM courses WHERE title = ?').get(course[0])) db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)').run(...course);
    }
    for (const [email, title, grade] of [ ['ahmed@example.com', courses[0][0], 92], ['sara@example.com', courses[0][0], null], ['omar@example.com', courses[1][0], 85], ['mariam@example.com', courses[2][0], null], ['sara@example.com', courses[1][0], 96] ]) {
      const student = db.prepare('SELECT id FROM students WHERE email = ?').get(email);
      const course = db.prepare('SELECT id FROM courses WHERE title = ? ORDER BY id LIMIT 1').get(title);
      db.prepare('INSERT INTO enrollments (student_id, course_id, grade) VALUES (?, ?, ?) ON CONFLICT(student_id, course_id) DO NOTHING').run(student.id, course.id, grade);
    }
  })();
  console.log('Seed complete. Sample students, courses and enrollments are ready; existing records were preserved.');
} catch (error) { console.error('Seed failed:', error.message); process.exitCode = 1; }
finally { db.close(); }
