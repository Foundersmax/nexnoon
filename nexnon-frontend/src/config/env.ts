// Environment configuration
// In production, these should come from environment variables

export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1',
  API_TIMEOUT: 30000,
  
  // App Configuration
  APP_NAME: 'Nexnoon',
  APP_VERSION: '1.0.0',
  
  // Feature Flags (set VITE_ENABLE_DEMO_MODE / VITE_ENABLE_ANALYTICS in .env)
  ENABLE_DEMO_MODE: import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Stripe (publishable key only - safe for frontend)
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',

  // Zoom Configuration (for live classes)
  ZOOM_SDK_KEY: import.meta.env.VITE_ZOOM_SDK_KEY || '',
  ZOOM_SDK_SECRET: import.meta.env.VITE_ZOOM_SDK_SECRET || '',
} as const;

// Check if running in development
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
