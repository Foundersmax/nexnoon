const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');

// Never reads the configured Atlas URI or writes to the application's database.
const database = `nexnoon_lifecycle_${crypto.randomBytes(8).toString('hex')}`;
const WEBHOOK_SECRET = 'test_webhook_secret_token';
Object.assign(process.env, {
  NODE_ENV: 'test', MONGODB_URI: `mongodb://127.0.0.1:27017/${database}`,
  JWT_ACCESS_SECRET: crypto.randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
  SMTP_HOST: '', SMTP_USER: '', STRIPE_SECRET_KEY: '',
  ZOOM_ACCOUNT_ID: '', ZOOM_CLIENT_ID: '', ZOOM_CLIENT_SECRET: '',
  ZOOM_MEETING_SDK_CLIENT_ID: 'test_meeting_sdk_client_id',
  ZOOM_MEETING_SDK_CLIENT_SECRET: 'test_meeting_sdk_client_secret',
  ZOOM_WEBHOOK_SECRET_TOKEN: WEBHOOK_SECRET,
});
const app = require('../dist/app').default;
const { evaluateJoinWindow, sessionsOverlap } = require('../dist/config/liveClassPolicy');

function signWebhook(bodyString, { timestamp = Math.floor(Date.now() / 1000), secret = WEBHOOK_SECRET } = {}) {
  const signature = 'v0=' + crypto.createHmac('sha256', secret).update(`v0:${timestamp}:${bodyString}`).digest('hex');
  return { signature, timestamp: String(timestamp) };
}

test('join-window policy: pure unit coverage', () => {
  const base = { status: 'scheduled', hasZoomMeeting: true };
  const start = new Date('2027-01-01T10:00:00.000Z');
  const end = new Date('2027-01-01T11:00:00.000Z');

  assert.equal(evaluateJoinWindow({ ...base, startTime: start, endTime: end }, new Date('2027-01-01T09:40:00.000Z')).code, 'too_early');
  assert.equal(evaluateJoinWindow({ ...base, startTime: start, endTime: end }, new Date('2027-01-01T09:50:00.000Z')).code, 'joinable');
  assert.equal(evaluateJoinWindow({ ...base, startTime: start, endTime: end }, new Date('2027-01-01T10:30:00.000Z')).code, 'joinable');
  assert.equal(evaluateJoinWindow({ ...base, startTime: start, endTime: end }, new Date('2027-01-01T11:15:00.000Z')).code, 'late_joinable');
  assert.equal(evaluateJoinWindow({ ...base, startTime: start, endTime: end }, new Date('2027-01-01T11:31:00.000Z')).code, 'ended');
  assert.equal(evaluateJoinWindow({ ...base, status: 'cancelled', startTime: start, endTime: end }, new Date('2027-01-01T10:00:00.000Z')).code, 'cancelled');
  assert.equal(evaluateJoinWindow({ ...base, status: 'completed', startTime: start, endTime: end }, new Date('2027-01-01T10:00:00.000Z')).code, 'completed');
  assert.equal(evaluateJoinWindow({ ...base, hasZoomMeeting: false, startTime: start, endTime: end }, new Date('2027-01-01T10:00:00.000Z')).code, 'missing_meeting');

  assert.equal(sessionsOverlap(new Date('2027-01-01T10:00:00Z'), new Date('2027-01-01T11:00:00Z'), new Date('2027-01-01T10:30:00Z'), new Date('2027-01-01T12:00:00Z')), true);
  assert.equal(sessionsOverlap(new Date('2027-01-01T10:00:00Z'), new Date('2027-01-01T11:00:00Z'), new Date('2027-01-01T11:00:00Z'), new Date('2027-01-01T12:00:00Z')), false);
});

test('zoom lifecycle: scheduling conflicts, idempotent creation, host access, and webhooks', async t => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  // Build indexes (uniqueness guards for idempotent session/event creation) before
  // any request runs, so the tests below can't race an in-progress index build.
  await mongoose.connection.syncIndexes();
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.equal(mongoose.connection.name, database);
    assert.match(database, /^nexnoon_lifecycle_[a-f0-9]{16}$/);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  const request = async (path, { method = 'GET', token, body, headers = {} } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: response.status, body: json };
  };
  const signup = async (name, role) => {
    const result = await request('/v1/auth/signup', { method: 'POST', body: {
      firstName: name, lastName: 'Test', email: `${name.toLowerCase()}@example.invalid`, password: 'Local-test-password-2026!', role,
    } });
    assert.equal(result.status, 201);
    return result.body.data;
  };

  let instructorA, instructorB, student, classA, classB;

  await t.test('fixtures: two instructors, two classes', async () => {
    instructorA = await signup('InstructorA', 'instructor');
    instructorB = await signup('InstructorB', 'instructor');
    student = await signup('LifecycleStudent', 'student');

    const createClass = async (token, title) => {
      const created = await request('/v1/classes', { method: 'POST', token, body: {
        title, description: 'Lifecycle test class', category: 'Testing', level: 'Beginner',
        price: 0, duration: 60, totalSessions: 2, status: 'published',
      } });
      assert.equal(created.status, 201);
      return created.body.data.id;
    };
    classA = await createClass(instructorA.token, 'Lifecycle Class A');
    classB = await createClass(instructorB.token, 'Lifecycle Class B');
  });

  await t.test('non-overlapping sessions are permitted', async () => {
    const first = await request(`/v1/classes/${classA}/schedule`, { method: 'POST', token: instructorA.token, body: {
      sessionNumber: 1, title: 'Session 1', startTime: '2027-02-01T10:00:00.000Z', endTime: '2027-02-01T11:00:00.000Z',
    } });
    assert.equal(first.status, 201);
    const second = await request(`/v1/classes/${classA}/schedule`, { method: 'POST', token: instructorA.token, body: {
      sessionNumber: 2, title: 'Session 2', startTime: '2027-02-01T12:00:00.000Z', endTime: '2027-02-01T13:00:00.000Z',
    } });
    assert.equal(second.status, 201);
  });

  await t.test('overlapping session for the same instructor is rejected with 409', async () => {
    const conflicting = await request(`/v1/classes/${classA}/schedule`, { method: 'POST', token: instructorA.token, body: {
      sessionNumber: 3, title: 'Overlap', startTime: '2027-02-01T10:30:00.000Z', endTime: '2027-02-01T11:30:00.000Z',
    } });
    assert.equal(conflicting.status, 409);
    assert.match(conflicting.body.message, /already have a session/i);
  });

  await t.test('different instructor (different Zoom host mapping) may run a simultaneous session', async () => {
    const simultaneous = await request(`/v1/classes/${classB}/schedule`, { method: 'POST', token: instructorB.token, body: {
      sessionNumber: 1, title: 'Class B Session 1', startTime: '2027-02-01T10:00:00.000Z', endTime: '2027-02-01T11:00:00.000Z',
    } });
    assert.equal(simultaneous.status, 201);
  });

  let rescheduleTargetId;
  await t.test('updating a session does not conflict with itself', async () => {
    const created = await request(`/v1/classes/${classA}/schedule`, { method: 'POST', token: instructorA.token, body: {
      sessionNumber: 4, title: 'Reschedule Me', startTime: '2027-02-02T10:00:00.000Z', endTime: '2027-02-02T11:00:00.000Z',
    } });
    assert.equal(created.status, 201);
    rescheduleTargetId = created.body.data.id;
    const noChange = await request(`/v1/classes/${classA}/schedule/${rescheduleTargetId}`, { method: 'PATCH', token: instructorA.token, body: {
      startTime: '2027-02-02T10:00:00.000Z', endTime: '2027-02-02T11:00:00.000Z',
    } });
    assert.equal(noChange.status, 200);
  });

  await t.test('rescheduling into an existing conflict is rejected', async () => {
    const rescheduled = await request(`/v1/classes/${classA}/schedule/${rescheduleTargetId}`, { method: 'PATCH', token: instructorA.token, body: {
      startTime: '2027-02-01T10:15:00.000Z', endTime: '2027-02-01T10:45:00.000Z',
    } });
    assert.equal(rescheduled.status, 409);
  });

  await t.test('duplicate session-number submission does not create a second document', async () => {
    const duplicate = await request(`/v1/classes/${classA}/schedule`, { method: 'POST', token: instructorA.token, body: {
      sessionNumber: 1, title: 'Session 1 (resubmitted)', startTime: '2027-02-01T10:00:00.000Z', endTime: '2027-02-01T11:00:00.000Z',
    } });
    assert.equal(duplicate.status, 200);
    assert.match(duplicate.body.message, /already exists/i);

    const { ClassScheduleModel } = require('../dist/models/Class');
    const count = await ClassScheduleModel.countDocuments({ classId: classA, sessionNumber: 1 });
    assert.equal(count, 1);
  });

  await t.test('schedule responses never include host-only fields', async () => {
    const schedule = await request(`/v1/classes/${classA}/schedule`);
    assert.equal(schedule.status, 200);
    for (const session of schedule.body.data) {
      for (const key of ['zoomStartUrl', 'zoomHostUserId', 'meetingCreationStatus', 'zoomLink', 'zoomMeetingId', 'zoomPasscode']) {
        assert.equal(session[key], undefined, `schedule response must not include ${key}`);
      }
    }
  });

  await t.test('host-access is instructor/admin-only and never leaks to students', async () => {
    const { ClassScheduleModel } = require('../dist/models/Class');
    const anySession = await ClassScheduleModel.findOne({ classId: classA });

    const asStudent = await request(`/v1/classes/${classA}/sessions/${anySession.id}/host-access`, { method: 'POST', token: student.token });
    assert.equal(asStudent.status, 403);

    const asOtherInstructor = await request(`/v1/classes/${classA}/sessions/${anySession.id}/host-access`, { method: 'POST', token: instructorB.token });
    assert.equal(asOtherInstructor.status, 403);

    // Zoom is unconfigured in this test env, so no meeting/start_url exists yet -
    // the route must fail safely (409 missing meeting), never fabricate a URL.
    const asOwner = await request(`/v1/classes/${classA}/sessions/${anySession.id}/host-access`, { method: 'POST', token: instructorA.token });
    assert.equal(asOwner.status, 409);
  });

  await t.test('webhook: endpoint URL validation challenge', async () => {
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: {
      event: 'endpoint.url_validation', payload: { plainToken: 'abc123' },
    } });
    assert.equal(response.status, 200);
    assert.equal(response.body.plainToken, 'abc123');
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update('abc123').digest('hex');
    assert.equal(response.body.encryptedToken, expected);
  });

  let webhookMeetingId, webhookSessionId;
  await t.test('webhook fixture: a session with a Zoom meeting id', async () => {
    const { ClassScheduleModel } = require('../dist/models/Class');
    webhookMeetingId = '55511122233';
    const session = await ClassScheduleModel.create({
      classId: classA, sessionNumber: 99, title: 'Webhook Target',
      startTime: new Date('2027-03-01T10:00:00.000Z'), endTime: new Date('2027-03-01T11:00:00.000Z'),
      zoomMeetingId: webhookMeetingId, status: 'scheduled',
    });
    webhookSessionId = session.id;
  });

  await t.test('webhook: invalid signature rejected', async () => {
    const payload = JSON.stringify({ event: 'meeting.started', event_ts: Date.now(), payload: { object: { id: webhookMeetingId } } });
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: {
      'x-zm-signature': 'v0=not-a-real-signature', 'x-zm-request-timestamp': String(Math.floor(Date.now() / 1000)),
    } });
    assert.equal(response.status, 401);
  });

  await t.test('webhook: stale timestamp rejected', async () => {
    const payload = JSON.stringify({ event: 'meeting.started', event_ts: Date.now(), payload: { object: { id: webhookMeetingId } } });
    const { signature, timestamp } = signWebhook(payload, { timestamp: Math.floor(Date.now() / 1000) - 3600 });
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: {
      'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp,
    } });
    assert.equal(response.status, 401);
  });

  await t.test('webhook: valid meeting.started signature updates the correct session to live', async () => {
    const payload = JSON.stringify({ event: 'meeting.started', event_ts: Date.now(), payload: { object: { id: webhookMeetingId, uuid: 'uuid-started-1' } } });
    const { signature, timestamp } = signWebhook(payload);
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: {
      'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp,
    } });
    assert.equal(response.status, 200);

    const { ClassScheduleModel } = require('../dist/models/Class');
    const updated = await ClassScheduleModel.findById(webhookSessionId);
    assert.equal(updated.status, 'live');
  });

  await t.test('webhook: duplicate delivery of the same event is processed once (idempotent)', async () => {
    const { ZoomWebhookEventModel } = require('../dist/models/ZoomWebhookEvent');
    const countBefore = await ZoomWebhookEventModel.countDocuments({ eventType: 'meeting.started' });

    const payload = JSON.stringify({ event: 'meeting.started', event_ts: Date.now(), payload: { object: { id: webhookMeetingId, uuid: 'uuid-dup-delivery-1' } } });
    const { signature, timestamp } = signWebhook(payload);
    // Same body + same request -> same synthetic event id, so the second delivery
    // must short-circuit as already-processed instead of erroring or reapplying.
    const first = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: { 'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp } });
    const second = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: { 'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp } });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);

    const countAfter = await ZoomWebhookEventModel.countDocuments({ eventType: 'meeting.started' });
    assert.equal(countAfter - countBefore, 1, 'exactly one new event row for two identical deliveries');
  });

  await t.test('webhook: meeting.ended moves the session to ended and blocks further joins', async () => {
    const payload = JSON.stringify({ event: 'meeting.ended', event_ts: Date.now(), payload: { object: { id: webhookMeetingId, uuid: 'uuid-ended-1' } } });
    const { signature, timestamp } = signWebhook(payload);
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: { 'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp } });
    assert.equal(response.status, 200);

    const { ClassScheduleModel } = require('../dist/models/Class');
    const updated = await ClassScheduleModel.findById(webhookSessionId);
    assert.equal(updated.status, 'ended');

    const enroll = await request('/v1/enrollments', { method: 'POST', token: student.token, body: { classId: classA } });
    assert.equal(enroll.status, 201);
    const blocked = await request(`/v1/classes/${classA}/sessions/${webhookSessionId}/join-credentials`, { method: 'POST', token: student.token });
    assert.equal(blocked.status, 409);
  });

  await t.test('webhook: event for an unknown meeting id is handled safely (no crash, no match)', async () => {
    const payload = JSON.stringify({ event: 'meeting.started', event_ts: Date.now(), payload: { object: { id: '000000000', uuid: 'uuid-unknown-1' } } });
    const { signature, timestamp } = signWebhook(payload);
    const response = await request('/v1/zoom/webhook', { method: 'POST', body: payload, headers: { 'x-zm-signature': signature, 'x-zm-request-timestamp': timestamp } });
    assert.equal(response.status, 200);
  });
});
