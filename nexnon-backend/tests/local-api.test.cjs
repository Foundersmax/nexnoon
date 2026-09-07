const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');

// Never reads the configured Atlas URI or writes to the application's database.
const database = `nexnoon_integration_${crypto.randomBytes(8).toString('hex')}`;
Object.assign(process.env, {
  NODE_ENV: 'test', MONGODB_URI: `mongodb://127.0.0.1:27017/${database}`,
  JWT_ACCESS_SECRET: crypto.randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
  SMTP_HOST: '', SMTP_USER: '', STRIPE_SECRET_KEY: '',
  ZOOM_ACCOUNT_ID: '', ZOOM_CLIENT_ID: '', ZOOM_CLIENT_SECRET: '',
});
const app = require('../dist/app').default;

test('local instructor and student workflows use persisted backend data', async t => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.equal(mongoose.connection.name, database);
    assert.match(database, /^nexnoon_integration_[a-f0-9]{16}$/);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  const request = async (path, { method = 'GET', token, body } = {}) => {
    const response = await fetch(base + path, { method, headers: {
      'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  const signup = async (name, role) => {
    const result = await request('/v1/auth/signup', { method: 'POST', body: {
      firstName: name, lastName: 'Test', email: `${name.toLowerCase()}@example.invalid`, password: 'Local-test-password-2026!', role,
    } });
    assert.equal(result.status, 201);
    return result.body.data;
  };
  let instructor, other, student, classId;
  await t.test('database health and empty catalogue', async () => {
    assert.equal((await request('/health')).status, 200);
    assert.equal((await request('/v1/classes')).body.data.pagination.totalItems, 0);
  });
  await t.test('signup, login and profile persist', async () => {
    instructor = await signup('Instructor', 'instructor');
    other = await signup('Other', 'instructor');
    student = await signup('Student', 'student');
    const login = await request('/v1/auth/login', { method: 'POST', body: { email: 'student@example.invalid', password: 'Local-test-password-2026!' } });
    assert.equal(login.status, 200);
    assert.equal(login.body.data.user.id, student.user.id);
    assert.equal((await request('/v1/auth/me', { token: student.token })).body.data.email, 'student@example.invalid');
  });
  await t.test('publishing retains instructor details and content', async () => {
    const created = await request('/v1/classes', { method: 'POST', token: instructor.token, body: {
      title: 'Backend Integration Class', description: 'An instructor-created test class.', category: 'Development',
      level: 'Beginner', price: 0, duration: 60, totalSessions: 1, status: 'published',
      details: { overview: 'Full overview', instructorBio: 'Instructor biography', curriculum: [{ title: 'Module one', topics: ['Topic one'], project: 'Build a page' }], faqs: [{ question: 'What do I need?', answer: 'A browser' }] },
      learningOutcomes: ['Read persisted data'], prerequisites: ['A browser'], materials: ['Instructor notes'],
      schedule: [{ sessionNumber: 1, title: 'First Session', startTime: '2027-01-01T10:00:00.000Z', endTime: '2027-01-01T11:00:00.000Z' }],
    } });
    assert.equal(created.status, 201);
    classId = created.body.data.id;
    assert.match(classId, /^[a-f0-9]{24}$/);
    assert.equal(created.body.data.instructor.name, 'Instructor Test');
    const detail = (await request(`/v1/classes/${classId}`)).body.data;
    assert.equal(detail.details.overview, 'Full overview');
    assert.equal(detail.details.curriculum[0].project, 'Build a page');
    assert.equal(detail.details.faqs[0].answer, 'A browser');
    assert.deepEqual(detail.materials, ['Instructor notes']);
    assert.equal(detail.schedule.length, 1);
    assert.equal(detail.schedule[0].zoomPasscode, undefined);
  });
  await t.test('search, category lists and category counts use saved classes', async () => {
    assert.equal((await request('/v1/classes/search?q=Integration')).body.data.pagination.totalItems, 1);
    assert.equal((await request('/v1/classes/category/development')).body.data.data[0].id, classId);
    assert.equal((await request('/v1/data/categories')).body.data[0].count, 1);
    assert.equal((await request('/v1/classes/my', { token: instructor.token })).body.data.data[0].id, classId);
  });
  await t.test('class edits enforce ownership and persist', async () => {
    assert.equal((await request(`/v1/classes/${classId}`, { method: 'PATCH', token: other.token, body: { title: 'Hijacked' } })).status, 403);
    assert.equal((await request(`/v1/classes/${classId}`, { method: 'PATCH', token: instructor.token, body: { title: 'Updated Integration Class', details: { overview: 'Updated full overview', faqs: [] } } })).status, 200);
    assert.equal((await request(`/v1/classes/${classId}`)).body.data.title, 'Updated Integration Class');
    assert.equal((await request(`/v1/classes/${classId}`)).body.data.details.overview, 'Updated full overview');
    assert.deepEqual((await request(`/v1/classes/${classId}`)).body.data.details.faqs, []);
    assert.equal((await request(`/v1/data/class/${classId}`, { token: student.token })).status, 403);
  });
  await t.test('free enrollment is persisted and repeated requests do not duplicate it', async () => {
    const enroll = () => request('/v1/enrollments', { method: 'POST', token: student.token, body: { classId } });
    assert.equal((await enroll()).status, 201);
    assert.equal((await enroll()).status, 200);
    const mine = (await request('/v1/enrollments/my', { token: student.token })).body.data;
    assert.equal(mine.pagination.totalItems, 1);
    assert.ok(mine.data[0].id);
    assert.equal((await request(`/v1/classes/${classId}`)).body.data.enrolledStudents, 1);
    const classroom = await request(`/v1/data/class/${classId}`, { token: student.token });
    assert.equal(classroom.status, 200);
    assert.equal(classroom.body.data.sessions[0].zoomLink, '');
    assert.equal(classroom.body.data.enrollment.progress, 0);
  });
  await t.test('dashboard and notifications reflect actual enrollment', async () => {
    const dashboard = (await request('/v1/data/instructor', { token: instructor.token })).body.data;
    assert.equal(dashboard.students.length, 1);
    assert.equal(dashboard.students[0].name, 'Student Test');
    assert.equal(dashboard.payments.length, 0);
    assert.equal((await request('/v1/data/admin', { token: student.token })).status, 403);
    assert.equal((await request('/v1/notifications', { token: student.token })).body.data.pagination.totalItems, 1);
  });
  await t.test('paid classes cannot silently simulate payment', async () => {
    await request(`/v1/classes/${classId}`, { method: 'PATCH', token: instructor.token, body: { price: 50 } });
    const blocked = await request('/v1/enrollments', { method: 'POST', token: other.token, body: { classId } });
    assert.equal(blocked.status, 402);
    assert.equal((await request(`/v1/classes/${classId}`)).body.data.enrolledStudents, 1);
  });
});
