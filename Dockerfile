# Multi-stage build for production deployment

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/admin-server

# Copy backend package files
COPY admin-server/package*.json ./
RUN npm ci --only=production

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache tini

# Copy backend from builder
COPY --from=backend-builder /app/admin-server/node_modules ./admin-server/node_modules
COPY admin-server ./admin-server

# Copy built frontend
COPY --from=frontend-builder /app/build ./build
COPY --from=frontend-builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start server
CMD ["node", "admin-server/server.js"]
