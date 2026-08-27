import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import classRoutes from './routes/class.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import notificationRoutes from './routes/notification.routes';
import reviewRoutes from './routes/review.routes';

const app = express();

// CORS: allow frontend origin (production-safe)
const isProd = ENV.NODE_ENV === 'production';
app.use(
  cors({
    origin: isProd ? ENV.FRONTEND_URL : true, // true = reflect request origin in dev
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Health check (no /v1 prefix for load balancers)
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// API v1 (versioned for production)
app.use('/v1/auth', authRoutes);
app.use('/v1/classes', classRoutes);
app.use('/v1/enrollments', enrollmentRoutes);
app.use('/v1/notifications', notificationRoutes);
app.use('/v1/reviews', reviewRoutes);

app.use(errorHandler);

export default app;


