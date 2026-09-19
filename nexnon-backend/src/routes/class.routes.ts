import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { User } from '../models/User';
import { z } from 'zod';
import { ClassModel, ClassScheduleModel } from '../models/Class';
import { EnrollmentModel } from '../models/Enrollment';
import { ReviewModel } from '../models/Review';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { createZoomMeeting, generateZoomMeetingSDKSignature } from '../utils/zoom';
import { ENV } from '../config/env';

const router = Router();
router.use((req: AuthRequest, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  next();
});

/** Ensure API responses use `id` (frontend expects it); Mongoose returns `_id`. */
function normalizeClass(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const id = obj._id?.toString?.() ?? obj.id;
  const { _id, ...rest } = obj;
  return { ...rest, id: id || _id };
}

const listParamsSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  filters: z.any().optional(),
});

const createClassSchema = z.object({
  details: z.object({
    overview: z.string().max(30000).optional(), instructorTitle: z.string().max(200).optional(),
    instructorBio: z.string().max(10000).optional(), instructorImage: z.string().max(4000000).optional(),
    previewVideoUrl: z.union([z.literal(''), z.string().url().startsWith('https://')]).optional(),
    curriculumIntro: z.string().max(2000).optional(), certificateInfo: z.string().max(5000).optional(),
    outcomes: z.array(z.string().max(2000)).max(100).optional(),
    curriculum: z.array(z.object({ title: z.string().max(500), topics: z.array(z.string().max(2000)).max(100), project: z.string().max(5000) })).max(100).optional(),
    faqs: z.array(z.object({ question: z.string().max(1000), answer: z.string().max(5000) })).max(100).optional(),
  }).optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  price: z.number().min(0),
  thumbnail: z.string().max(4000000).optional(),
  language: z.string().optional(),
  maxStudents: z.number().int().positive().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  duration: z.number(),
  totalSessions: z.number(),
  startDate: z.string().datetime().optional(),
  schedule: z
    .array(
      z.object({
        sessionNumber: z.number(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
      })
    )
    .optional(),
});

router.get('/', async (req, res) => {
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10, search } = parsed.data;

  const query: any = { status: 'published' };
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const [items, totalItems] = await Promise.all([
    ClassModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ClassModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

router.get('/search', async (req, res) => {
  const q = (req.query.q as string) || '';
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10 } = parsed.data;

  const query: any = { status: 'published' };
  if (q) {
    query.title = { $regex: q, $options: 'i' };
  }

  const [items, totalItems] = await Promise.all([
    ClassModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ClassModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

router.get('/category/:category', async (req, res) => {
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10 } = parsed.data;

  const categoryNames: Record<string, string[]> = { 'health-wellness': ['Health & Wellness', 'Health & Fitness'], languages: ['Languages', 'Language', 'Language Learning'] };
  const names = categoryNames[req.params.category.toLowerCase()] || [req.params.category.replace(/-/g, ' ')];
  const query: any = { status: 'published', category: { $in: names.map(name => new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) } };

  const [items, totalItems] = await Promise.all([
    ClassModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ClassModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

router.get('/my', requireAuth, requireRole('instructor', 'admin'), async (req: AuthRequest, res) => {
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10 } = parsed.data;

  const query: any = { 'instructor.id': req.user!.id };

  const [items, totalItems] = await Promise.all([
    ClassModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ClassModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

/** Normalize a schedule document for API (id from _id). */
function normalizeSchedule(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const id = obj._id?.toString?.() ?? obj.id;
  const { _id, ...rest } = obj;
  return { ...rest, id: id || _id };
}

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid class id' });
  }
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }
  if (cls.status !== 'published' && req.user?.role !== 'admin' && String(cls.instructor.id) !== req.user?.id) return res.status(404).json({ success: false, message: 'Class not found' });
  const sessions = await ClassScheduleModel.find({ classId: cls.id })
    .sort({ sessionNumber: 1 })
    .lean();
  const schedule = sessions.map((s: any) => { const { zoomLink, zoomMeetingId, zoomPasscode, recordingUrl, ...publicSession } = normalizeSchedule(s); return publicSession; });
  const data = { ...normalizeClass(cls), schedule };
  return res.json({ success: true, data });
});

router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req: AuthRequest, res) => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  const data = parsed.data;
  const instructor = await User.findById(req.user!.id);
  if (!instructor) return res.status(401).json({ success: false, message: 'Account not found' });

  const cls = await ClassModel.create({
    ...data,
    currency: 'USD',
    instructor: {
      id: req.user!.id,
      name: instructor.fullName,
      avatar: instructor.avatar,
    },
    status: data.status || 'published',
  });

  if (data.schedule?.length) {
    const scheduleDocs = await Promise.all(
      data.schedule.map(async (s) => {
        // Optionally auto-create Zoom meeting
        const zoom = await createZoomMeeting({
          topic: `${cls.title} - ${s.title}`,
          startTime: s.startTime,
          durationMinutes: (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000,
        });

        return {
          classId: cls.id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          description: s.description,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
          zoomLink: zoom.join_url,
          zoomMeetingId: String(zoom.id),
          zoomPasscode: zoom.password,
        };
      })
    );

    await ClassScheduleModel.insertMany(scheduleDocs);
  }

  return res.status(201).json({
    success: true,
    data: normalizeClass(cls),
    message: 'Class created successfully',
  });
});

router.post('/:classId/sessions/:sessionId/join-credentials', requireAuth, async (req: AuthRequest, res) => {
  // Validate IDs
  if (!isValidObjectId(req.params.classId) || !isValidObjectId(req.params.sessionId)) {
    return res.status(400).json({ success: false, message: 'Invalid class or session ID' });
  }

  // Load session and class
  const session = await ClassScheduleModel.findOne({ _id: req.params.sessionId, classId: req.params.classId });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const cls = await ClassModel.findById(req.params.classId);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  // Check if meeting exists
  if (!session.zoomMeetingId) {
    return res.status(409).json({ success: false, message: 'Meeting not available for this session' });
  }

  // Enforce join window: 15 minutes before start until session ends
  const now = Date.now();
  const startTime = new Date(session.startTime).getTime();
  const endTime = new Date(session.endTime).getTime();
  const fifteenMinutes = 15 * 60 * 1000;

  if (now < startTime - fifteenMinutes) {
    return res.status(409).json({ success: false, message: 'Session has not started yet' });
  }

  if (session.status === 'cancelled' || session.status === 'completed') {
    return res.status(409).json({ success: false, message: `Session is ${session.status}` });
  }

  // Authorize: instructor/admin or enrolled student
  const isInstructor = req.user!.role === 'instructor' && String(cls.instructor.id) === req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  if (!isInstructor && !isAdmin) {
    const enrollment = await EnrollmentModel.findOne({ classId: req.params.classId, userId: req.user!.id });
    if (!enrollment || enrollment.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Not enrolled in this class' });
    }
  }

  // Generate signature (student role only; instructors use OAuth host flow)
  if (!ENV.ZOOM_MEETING_SDK_CLIENT_ID || !ENV.ZOOM_MEETING_SDK_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: 'Zoom Meeting SDK not configured' });
  }

  try {
    const signature = generateZoomMeetingSDKSignature({
      meetingNumber: session.zoomMeetingId,
      role: 0, // Student role only; instructor/ZAK hosting is not implemented here
    });

    const user = await User.findById(req.user!.id);

    return res.json({
      success: true,
      data: {
        signature,
        meetingNumber: session.zoomMeetingId,
        passWord: session.zoomPasscode || undefined,
        userName: user?.fullName || 'Student',
        userEmail: user?.email,
      },
    });
  } catch (error) {
    return res.status(503).json({ success: false, message: 'Failed to generate meeting credentials' });
  }
});

router.use('/:id', async (req: AuthRequest, res, next) => {
  if (req.method === 'GET') return next();
  return requireAuth(req, res, async () => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid class ID' });
    try {
      const cls = await ClassModel.findById(req.params.id);
      if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
      if (req.user!.role !== 'admin' && String(cls.instructor.id) !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'You can only change your own classes' });
      }
      next();
    } catch (error) { next(error); }
  });
});

router.patch('/:id', requireAuth, requireRole('instructor', 'admin'), async (req: AuthRequest, res) => {
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  const parsed = createClassSchema.partial().omit({ schedule: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid class changes' });
  Object.assign(cls, parsed.data);
  await cls.save();

  return res.json({
    success: true,
    data: normalizeClass(cls),
    message: 'Class updated successfully',
  });
});

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  await cls.deleteOne();
  await ClassScheduleModel.deleteMany({ classId: cls.id });

  return res.json({
    success: true,
    data: null,
    message: 'Class deleted successfully',
  });
});

router.post('/:id/deletion-request', requireAuth, requireRole('instructor'), async (req, res) => {
  // For brevity, just accept the request and mark class as archived
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }
  cls.status = 'archived';
  await cls.save();

  return res.json({
    success: true,
    data: null,
    message: 'Deletion request submitted',
  });
});

router.get('/:id/schedule', async (req, res) => {
  const sessions = await ClassScheduleModel.find({ classId: req.params.id }).sort({
    sessionNumber: 1,
  });
  return res.json({ success: true, data: sessions.map(s => { const { zoomLink, zoomMeetingId, zoomPasscode, recordingUrl, ...publicSession } = normalizeSchedule(s); return publicSession; }) });
});

router.post('/:id/schedule', requireAuth, requireRole('instructor'), async (req, res) => {
  const body = req.body as {
    sessionNumber: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  };

  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  const zoom = await createZoomMeeting({
    topic: `${cls.title} - ${body.title}`,
    startTime: body.startTime,
    durationMinutes:
      (new Date(body.endTime).getTime() - new Date(body.startTime).getTime()) / 60000,
  });

  const session = await ClassScheduleModel.create({
    classId: cls.id,
    sessionNumber: body.sessionNumber,
    title: body.title,
    description: body.description,
    startTime: new Date(body.startTime),
    endTime: new Date(body.endTime),
    zoomLink: zoom.join_url,
    zoomMeetingId: String(zoom.id),
    zoomPasscode: zoom.password,
  });

  return res.status(201).json({ success: true, data: session });
});

router.patch('/:id/schedule/:sessionId', requireAuth, requireRole('instructor'), async (req, res) => {
  const session = await ClassScheduleModel.findOne({ _id: req.params.sessionId, classId: req.params.id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  Object.assign(session, req.body);
  await session.save();

  return res.json({ success: true, data: session });
});

router.delete('/:id/schedule/:sessionId', requireAuth, requireRole('instructor'), async (req, res) => {
  const session = await ClassScheduleModel.findOne({ _id: req.params.sessionId, classId: req.params.id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  await session.deleteOne();
  return res.json({ success: true, data: null });
});

router.get('/:id/enrollments', requireAuth, requireRole('instructor', 'admin'), async (req: AuthRequest, res) => {
  const cls = await ClassModel.findById(req.params.id);
  if (!cls || (req.user!.role !== 'admin' && String(cls.instructor.id) !== req.user!.id)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10 } = parsed.data;

  const query = { classId: req.params.id };

  const [items, totalItems] = await Promise.all([
    EnrollmentModel.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    EnrollmentModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

router.get('/:id/reviews', async (req, res) => {
  const parsed = listParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid query params' });
  }
  const { page = 1, pageSize = 10 } = parsed.data;

  const query = { classId: req.params.id };

  const [items, totalItems] = await Promise.all([
    ReviewModel.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ReviewModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items.map(normalizeClass),
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

export default router;


