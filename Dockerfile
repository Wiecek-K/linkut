# Use the official Node.js image as a base for building the application
FROM node:22.12.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the entire application code including prisma folder
COPY prisma ./prisma/
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build the NestJS application
RUN npm run build

# Create a smaller production image using the slim version of Node.js
FROM node:22.12.0
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY --from=build /app/package*.json ./

# Install dependencies
RUN  npm install --omit=dev

# Copy built application and Prisma files from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Ensure Prisma client is generated in the production image
RUN npm run prisma:generate

# Command to run the application in production
CMD ["node", "dist/src/main.js"]
