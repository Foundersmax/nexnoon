import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexnon',
  MONGODB_DNS_SERVERS: process.env.MONGODB_DNS_SERVERS || '',

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'change-me-access',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Email (Nodemailer)
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@nexnon.com',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // Frontend URL for links in emails
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Zoom (optional - for automatic meeting creation)
  ZOOM_ACCOUNT_ID: process.env.ZOOM_ACCOUNT_ID || '',
  ZOOM_CLIENT_ID: process.env.ZOOM_CLIENT_ID || '',
  ZOOM_CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET || '',
};


