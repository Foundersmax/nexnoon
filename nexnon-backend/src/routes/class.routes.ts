import { Router } from 'express';
import { z } from 'zod';
import { ClassModel, ClassScheduleModel } from '../models/Class';
import { EnrollmentModel } from '../models/Enrollment';
import { ReviewModel } from '../models/Review';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { createZoomMeeting } from '../utils/zoom';

const router = Router();

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
  title: z.string(),
  description: z.string(),
  category: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  price: z.number(),
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

  const query: any = {};
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

  const query: any = {};
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

  const query: any = { category: req.params.category };

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
      data: items,
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

router.get('/my', requireAuth, requireRole('instructor'), async (req: AuthRequest, res) => {
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

router.get('/:id', async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined') {
    return res.status(400).json({ success: false, message: 'Invalid class id' });
  }
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }
  const sessions = await ClassScheduleModel.find({ classId: cls.id })
    .sort({ sessionNumber: 1 })
    .lean();
  const schedule = sessions.map((s: any) => normalizeSchedule(s));
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

  const cls = await ClassModel.create({
    ...data,
    currency: 'USD',
    instructor: {
      id: req.user!.id,
      name: 'Instructor', // In production, resolve from user profile
    },
    status: 'draft',
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
    data: cls,
    message: 'Class created successfully',
  });
});

router.patch('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const cls = await ClassModel.findById(req.params.id);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  Object.assign(cls, req.body);
  await cls.save();

  return res.json({
    success: true,
    data: cls,
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
  return res.json({ success: true, data: sessions });
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
  const session = await ClassScheduleModel.findById(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  Object.assign(session, req.body);
  await session.save();

  return res.json({ success: true, data: session });
});

router.delete('/:id/schedule/:sessionId', requireAuth, requireRole('instructor'), async (req, res) => {
  const session = await ClassScheduleModel.findById(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  await session.deleteOne();
  return res.json({ success: true, data: null });
});

router.get('/:id/enrollments', requireAuth, requireRole('instructor'), async (req, res) => {
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
      data: items,
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
      data: items,
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


