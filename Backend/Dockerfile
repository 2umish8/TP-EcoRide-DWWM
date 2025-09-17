# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.12.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy package manifests and prisma schema first to install deps (and allow prisma generate)
COPY package*.json ./
COPY prisma ./prisma

# Install production dependencies (don't require BuildKit bind mounts)
RUN npm ci --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the source files into the image.
COPY . .

# Ensure node user owns the app directory (optional but safer)
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /usr/src/app

# Run as non-root
USER appuser

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application using JSON exec form
CMD ["npm", "start"]
