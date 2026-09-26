import { Request, Response } from 'express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Learn With Shahariar LMS API Documentation',
    version: '1.0.0',
    description:
      'Production Express.js + TypeScript + MongoDB Learning Management System Backend API powering courses, video security, student learning, instructor dashboard, admin moderation, Stripe payments, subscriptions, certificates, and AI learning assistant.',
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local Development Server',
    },
    {
      url: 'https://learn-with-shahariar-server.vercel.app/api',
      description: 'Production Production Server',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Native JWT User Registration',
        tags: ['Authentication'],
        responses: { 201: { description: 'User registered successfully' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Native JWT User Login',
        tags: ['Authentication'],
        responses: { 200: { description: 'Token issued successfully' } },
      },
    },
    '/courses': {
      get: {
        summary: 'Get Published Courses Catalog',
        tags: ['Courses'],
        responses: { 200: { description: 'Course list retrieved' } },
      },
    },
    '/videos/{lessonId}/access': {
      get: {
        summary: 'Secure Video Lesson Access & Stream Guard',
        tags: ['Secure Video'],
        responses: {
          200: { description: 'Video access granted' },
          403: { description: 'You are not enrolled in this course.' },
        },
      },
    },
    '/payment/create-checkout': {
      post: {
        summary: 'Create Stripe Checkout Session',
        tags: ['Payments'],
        responses: { 200: { description: 'Checkout URL generated' } },
      },
    },
    '/certificate/generate/{courseId}': {
      post: {
        summary: 'Generate Official Course Completion Certificate',
        tags: ['Certificates'],
        responses: { 200: { description: 'Certificate issued' } },
      },
    },
    '/certificate/verify/{id}': {
      get: {
        summary: 'Public Certificate Verification API',
        tags: ['Certificates'],
        responses: { 200: { description: 'Certificate authenticity verified' } },
      },
    },
    '/ai/chat': {
      post: {
        summary: 'Context-Aware AI Tutor Chat Assistant',
        tags: ['AI Assistant'],
        responses: { 200: { description: 'AI answer generated' } },
      },
    },
  },
};

export const serveSwaggerDocs = (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Learn With Shahariar API Specs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
        <script>
          window.onload = () => {
            SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerDocument)},
              dom_id: '#swagger-ui',
            });
          };
        </script>
      </body>
    </html>
  `);
};

export default serveSwaggerDocs;
