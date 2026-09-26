# Learn With Shahariar — Enterprise Production LMS Backend

![Node.js](https://img.shields.io/badge/Node.js-v22-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger)

An enterprise-grade, scalable Learning Management System (LMS) backend built with **Express.js**, **TypeScript**, and **MongoDB**. Designed for production deployment and remote software engineering portfolios.

---

## 🌟 Executive Architecture Overview

```
                          ┌──────────────────────────┐
                          │    Client Application    │
                          └─────────────┬────────────┘
                                        │ (REST / HTTPS)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Express.js API Router                             │
│  - Helmet Security Headers      - Input Sanitization & Mongo Injection Guard  │
│  - CORS Policy Engine           - Morgan Request Logging & Rate Limiters      │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │
       ├────────► Dual Auth Engine (Native JWT + Clerk OAuth)
       │
       ├────────► Course & Syllabus System (Course -> Module -> Lesson Hierarchy)
       │
       ├────────► Secure Video Access Guard (403 Enrollment Check)
       │
       ├────────► Monetization Engine (Stripe Checkout, 80/20 Revenue Split)
       │
       ├────────► Certificate Engine (100% Completion Guard & Public Verification)
       │
       ├────────► AI Learning Assistant (RAG Knowledge Base & Quiz Generator)
       │
       └────────► Redis / In-Memory TTL Cache Layer
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │      MongoDB Atlas       │
                          └──────────────────────────┘
```

---

## 🚀 Key Feature Matrix Across All 8 Implementation Phases

### Phase 1: Foundation & Authentication Upgrades
- **Dual Authentication**: Seamless native JWT token verification + Clerk OAuth auto-provisioning.
- **Unified RBAC**: Role-based access control supporting `student`, `instructor`, and `admin`.
- **Central Error Handling**: Standardized `ApiError` responses with stack tracing.

### Phase 2: Course Management System
- **Hierarchical Structure**: `Course` → `Module` → `Lesson` data modeling.
- **Automated Slug Generation**: Pre-validation hooks generating URL-friendly unique slugs.
- **Moderation Lifecycle**: Full status management (`draft`, `published`, `archived`, `pending`, `approved`, `rejected`).

### Phase 3: Student Learning Experience
- **Progress Tracking Engine**: Real-time completion percentage calculations and lesson tracking.
- **Continue Learning**: Automatically resolves student's last active course and video position.
- **Interactive Tools**: Timed video notes and lesson bookmarking.

### Phase 4: Secure Video Access & Watch Tracking
- **Stream Authorization Guard**: Blocks unauthorized video retrieval with explicit `403 Forbidden: "You are not enrolled in this course."`
- **Watch Position Tracking**: High-frequency video playback timestamp persistence (`VideoProgress`).
- **Database Optimization**: Compound indexes on `{ studentId: 1, lessonId: 1 }` and `{ studentId: 1, courseId: 1 }`.

### Phase 5: Instructor, Admin & Analytics System
- **Instructor Portal**: Dashboard metrics (`totalCourses`, `totalStudents`, `totalRevenue`, `averageRating`), course publishing, and student rosters.
- **Admin Moderation**: Course review workflows (`pending` approval pipeline), user role management, and account status toggles.
- **Platform Analytics Engine**: Period-over-period percentage growth calculations for users, revenue, and enrollments.

### Phase 6: Payments, Subscriptions & Certificates
- **Stripe Monetization**: Checkout session creation and auto-enrollment verification.
- **Revenue Allocation**: Automated calculation of 80% instructor earnings vs 20% platform commission.
- **Subscription Engine**: Support for `FREE`, `PRO`, and `PREMIUM` student membership plans.
- **Certificate Credentials**: Auto-issues official certificates upon 100% course completion with **Public Verification API** (`GET /api/certificate/verify/:id`).

### Phase 7: AI Learning Integration
- **Context-Aware AI Tutor**: AI Chat assistant powered by course metadata context.
- **RAG Knowledge Base**: Chunked course content embeddings (`Embedding` collection) for Retrieval-Augmented Generation.
- **Automated Quiz & Summary Generators**: AI-generated multiple-choice quizzes with explanations and key point summaries.
- **Personalized Recommendations**: Machine learning recommendation algorithm analyzing completed student courses.

### Phase 8: Production Hardening, Security & Documentation
- **Security Hardening**: Helmet security headers, Mongo operator injection sanitization, CORS protection, and rate limiting.
- **Interactive Swagger Documentation**: Serves OpenAPI specs at `/api-docs`.
- **Docker Multi-stage Infrastructure**: Production `Dockerfile` and `docker-compose.yml` orchestrating Express backend, MongoDB 7, and Redis 7.
- **CI/CD Automation**: GitHub Actions workflow running `install` -> `build` -> `test`.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Runtime** | Node.js (v22 LTS) |
| **Framework** | Express.js |
| **Language** | TypeScript (Strict mode, 100% `.ts` source files) |
| **Database** | MongoDB Atlas & Mongoose ORM |
| **Caching** | Redis / In-Memory Store |
| **Payments** | Stripe API & Webhooks |
| **Authentication** | Native JWT & Clerk SDK |
| **Documentation** | Swagger UI & OpenAPI 3.0 |
| **Containers** | Docker & Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📁 Repository Directory Structure

```
learn-with-shahariar-server/
├── .github/workflows/ci.yml       # GitHub Actions CI/CD Pipeline
├── src/
│   ├── config/                    # Environment, CORS, Logger, Cache & Swagger configs
│   ├── constants/                 # Standard roles & permissions constants
│   ├── controllers/               # Express endpoint controllers
│   ├── middleware/                # Auth, RBAC, Rate Limiter, Sanitization, Video Guard
│   ├── models/                    # Mongoose schemas (Course, User, Enrollment, Revenue, Certificate...)
│   ├── modules/ai/                # AI Module (Types, Service, Controller, Routes)
│   ├── routes/                    # Modular Express API routers
│   ├── services/                  # Core domain logic & business services
│   ├── types/                     # TypeScript interfaces & type definitions
│   ├── utils/                     # ApiError, ApiResponse, Slugify, Tokens, AsyncHandler
│   ├── app.ts                     # Express Application configuration
│   └── server.ts                  # Server entrypoint
├── tests/                         # Integration test suite (Jest & Supertest)
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # Multi-container service specification
└── README.md                      # Production portfolio documentation
```

---

## ⚡ Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v20 or higher
- **MongoDB**: Active local instance or MongoDB Atlas URI

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/shahariarshawon/learn-with-shahariar-server.git
cd learn-with-shahariar-server

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/lws_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,https://learn-with-shahariar.vercel.app

# Optional Integrations
STRIPE_SECRET_KEY=sk_test_...
CLERK_SECRET_KEY=sk_test_...
AI_API_KEY=your_gemini_or_openai_api_key
```

### 4. Running the Application
```bash
# Start development server with live reload
npm run dev

# Compile TypeScript to dist/
npm run build

# Run production server
npm start
```

---

## 🐳 Docker Deployment

Run the complete multi-container stack (Backend + MongoDB + Redis) using Docker Compose:

```bash
# Build and launch all services in detached mode
docker-compose up -d --build

# View container logs
docker-compose logs -f backend

# Stop containers
docker-compose down
```

---

## 📖 API Documentation

Interactive Swagger documentation is available at:
👉 **`http://localhost:5001/api-docs`**

### Summary of Endpoint Modules:
- `POST /api/auth/register` & `/api/auth/login` — Native JWT Authentication
- `GET /api/courses` — Public Course Catalog
- `GET /api/videos/:lessonId/access` — Secure Video Stream Guard
- `GET /api/instructor/dashboard` & `/api/instructor/revenue` — Instructor Management & Earnings
- `GET /api/admin/dashboard` & `/api/admin/users` — Admin Moderation & User Controls
- `POST /api/payment/create-checkout` & `/verify` — Stripe Payments & Auto-Enrollment
- `POST /api/certificate/generate/:courseId` — Official Completion Certificate Generator
- `GET /api/certificate/verify/:id` — Public Credential Verification API
- `POST /api/ai/chat` & `/api/ai/generate-quiz` — Context-Aware AI Tutor & Quiz Engine

---

## 🧪 Testing

```bash
# Run automated integration tests
npm test
```

---

## 📜 License & Author

Developed by **Shahariar Shawon** as part of the **Learn With Shahariar** Production Platform. Licensed under the [ISC License](LICENSE).
