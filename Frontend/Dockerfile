# syntax=docker/dockerfile:1
# EcoRide Frontend - Vue.js application served by nginx
# Multi-stage Docker build for optimized production deployment

ARG NODE_VERSION=22.12.0

################################################################################
# Base stage - Common setup for all stages
FROM node:${NODE_VERSION} AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for all build stages
WORKDIR /usr/src/app

################################################################################
# Dependencies stage - Install production dependencies
FROM base AS deps

# Download dependencies as a separate step to take advantage of Docker's caching
# Leverage a cache mount to /root/.npm to speed up subsequent builds
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

################################################################################
# Development stage - For development with hot reload
FROM base AS development

# Copy package files first
COPY package*.json ./

# Install all dependencies (including dev) with cache cleaning
RUN npm ci --no-audit --no-fund \
    && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
    && chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 5173

# Use Vite dev server for development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

################################################################################
# Build stage - Create production build
FROM base AS build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy the rest of the source files into the image
COPY . .

# Build the application
RUN npm run build

################################################################################
# Production stage - Serve built static files with nginx
FROM nginx:stable-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx content and copy built files from the build stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create writable directories and set permissions
RUN mkdir -p /tmp /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx \
    && chown -R nginx:nginx /tmp

# Switch to non-root user
USER nginx

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
