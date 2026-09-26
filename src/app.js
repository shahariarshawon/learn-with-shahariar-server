import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { corsOptions } from './config/cors.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';
import webhookRouter from './routes/webhook.routes.js';
import { stripeWebhooks, clerkWebhooks } from './controllers/webhook.controller.js';

const app = express();

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// 2. CORS setup
app.use(cors(corsOptions));

// 3. Webhook endpoints (mounted BEFORE global express.json to preserve Stripe raw signatures)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.post('/clerk', express.json(), clerkWebhooks);
app.use('/webhook', webhookRouter);

// 4. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Clerk Auth Middleware (populates req.auth for Clerk requests)
app.use(clerkMiddleware());

// 6. Rate limiter on API endpoints
app.use('/api', apiLimiter);

// 7. Base healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send('Learn with Shahariar API is working fine!');
});

// 8. Modular API Routes
app.use('/api', apiRouter);

// 9. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
