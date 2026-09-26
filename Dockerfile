# Multi-stage production build for Learn With Shahariar Express.js + TypeScript LMS Server

# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --legacy-peer-deps

# Copy source files and compile TypeScript
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy compiled files and production dependencies
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --omit=production --legacy-peer-deps || npm ci --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 5001

CMD ["node", "dist/server.js"]
