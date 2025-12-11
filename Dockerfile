# AI Visual Code Review - Docker Image
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Add labels
LABEL maintainer="Prakhar <prakharmnnit@gmail.com>"
LABEL description="AI Visual Code Review - Visual code review tool with AI integration"
LABEL version="2.3.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY server.js ./
COPY bin/ ./bin/
COPY public/ ./public/
COPY services/ ./services/
COPY scripts/ ./scripts/
COPY src/ ./src/

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Set environment
ENV NODE_ENV=production
ENV PORT=3002

# Start application
CMD ["node", "server.js"]
