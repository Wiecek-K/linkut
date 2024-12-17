# syntax=docker/dockerfile:1

# Use node image for base image for all stages.
ARG NODE_VERSION=22.12.0
ARG PNPM_VERSION=9.15.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Install pnpm and OpenSSL
RUN npm install -g pnpm@${PNPM_VERSION} && \
    apk add --no-cache openssl && \
    mkdir -p /usr/src/app/node_modules && \
    chown -R node:node /usr/src/app/node_modules

################################################################################
# Create a stage for installing production dependencies.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY package*.json ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final

# Use production node environment by default.
ENV NODE_ENV=production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json ./

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["sh", "-c", "pnpm prisma generate && node dist/main.js"]
