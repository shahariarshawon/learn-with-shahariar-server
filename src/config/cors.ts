import { CorsOptions } from 'cors';
import { env } from './env.js';

const parseAllowedOrigins = (): string[] => {
  const envOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(',').map((o) => o.trim()) : [];
  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://learn-with-shahariar.vercel.app',
  ];
  return Array.from(new Set([...defaults, ...envOrigins]));
};

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowed = parseAllowedOrigins();
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'svix-id',
    'svix-timestamp',
    'svix-signature',
  ],
};

export default corsOptions;
