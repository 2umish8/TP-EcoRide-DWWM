# syntax=docker/dockerfile:1
# EcoRide Backend - Node.js/Express API Server
# Multi-stage Docker build for optimized production deployment

ARG NODE_VERSION=22.12.0

################################################################################
# Base stage - Common setup for all stages
FROM node:${NODE_VERSION}-alpine AS base

# Install system dependencies and curl for healthchecks
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory and set ownership
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

################################################################################
# Dependencies stage - Install production dependencies
FROM base AS deps

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

################################################################################
# Development stage - For development with hot reload
FROM base AS development

# Install all dependencies (including dev)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --no-audit --no-fund

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Change ownership to app user
RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 3000

# Use nodemon for development
CMD ["npm", "run", "dev"]

################################################################################
# Production stage - Optimized for production deployment
FROM base AS production

# Use production node environment
ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package*.json ./

# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package*.json ./

# Copy source code
COPY . .

# Ensure proper permissions
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the port that the application listens on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["npm", "start"]
