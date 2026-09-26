import { env } from './env.js';

const parseAllowedOrigins = () => {
  const envOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(',').map(o => o.trim()) : [];
  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://learn-with-shahariar.vercel.app',
  ];
  return Array.from(new Set([...defaults, ...envOrigins]));
};

export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = parseAllowedOrigins();
    // Allow non-browser requests or matching origins or Vercel preview deployments
    if (
      !origin ||
      allowed.includes(origin) ||
      (origin && origin.endsWith('.vercel.app'))
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'svix-id', 'svix-timestamp', 'svix-signature'],
};
