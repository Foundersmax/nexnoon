import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { ClassModel, ClassScheduleModel } from '../models/Class';
import { EnrollmentModel } from '../models/Enrollment';
import { PaymentModel } from '../models/Payment';
import { User } from '../models/User';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const normalize = (doc: any) => ({ ...doc, id: String(doc._id) });

router.get('/categories', async (_req, res) => {
  const categories = await ClassModel.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data: categories.map(c => ({ name: c._id, count: c.count })) });
});

router.get('/instructor', requireAuth, requireRole('instructor', 'admin'), async (req: AuthRequest, res) => {
  const classes = await ClassModel.find({ 'instructor.id': req.user!.id }).sort({ createdAt: -1 }).lean();
  const ids = classes.map(c => c._id);
  const [enrollments, payments, sessions] = await Promise.all([
    EnrollmentModel.find({ classId: { $in: ids }, status: { $ne: 'dropped' } })
      .populate('userId', 'fullName email').lean(),
    PaymentModel.find({ classId: { $in: ids }, paymentMethod: { $ne: 'demo' } })
      .populate('userId', 'fullName').sort({ createdAt: -1 }).lean(),
    ClassScheduleModel.find({ classId: { $in: ids } }).sort({ startTime: 1 }).lean(),
  ]);
  res.json({ success: true, data: {
    classes: classes.map(normalize),
    students: enrollments.map((e: any) => ({ id: String(e._id), userId: String(e.userId?._id || ''),
      name: e.userId?.fullName || 'Deleted user', email: e.userId?.email || '',
      classId: String(e.classId), classTitle: classes.find(c => String(c._id) === String(e.classId))?.title,
      progress: e.progress, status: e.status, enrolledAt: e.enrolledAt })),
    payments: payments.map((p: any) => ({ id: String(p._id), classId: String(p.classId),
      classTitle: classes.find(c => String(c._id) === String(p.classId))?.title,
      student: p.userId?.fullName || 'Deleted user', amount: p.amount, currency: p.currency,
      status: p.status, createdAt: p.createdAt })),
    sessions: sessions.map(normalize),
  } });
});

router.get('/admin', requireAuth, requireRole('admin'), async (_req, res) => {
  const [users, classes, payments] = await Promise.all([
    User.find().select('fullName email role createdAt').sort({ createdAt: -1 }).lean(),
    ClassModel.find().sort({ createdAt: -1 }).lean(),
    PaymentModel.find({ paymentMethod: { $ne: 'demo' } }).sort({ createdAt: -1 }).lean(),
  ]);
  res.json({ success: true, data: { users: users.map(normalize), classes: classes.map(normalize), payments: payments.map(normalize) } });
});

router.get('/class/:id', requireAuth, async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid class ID' });
  const cls = await ClassModel.findById(req.params.id).lean();
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
  const enrollment = await EnrollmentModel.findOne({ classId: cls._id, userId: req.user!.id, status: { $ne: 'dropped' } }).lean();
  const canTeach = req.user!.role === 'admin' || String(cls.instructor.id) === req.user!.id;
  if (!enrollment && !canTeach) return res.status(403).json({ success: false, message: 'Enroll in this class to access its classroom' });
  const sessions = await ClassScheduleModel.find({ classId: cls._id }).sort({ sessionNumber: 1 }).lean();
  res.json({ success: true, data: { class: normalize(cls), sessions: sessions.map(normalize), enrollment: enrollment ? normalize(enrollment) : null, canTeach } });
});

export default router;
