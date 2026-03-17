# Stage 1: Build the React application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules 
RUN apk add --no-cache python3 make g++

# Copy package files first (better Docker cache)
COPY package.json package-lock.json* ./

# Install dependencies using CI-friendly and deterministic method
RUN npm ci --silent

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Create a non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build
COPY --from=builder /app/dist /usr/share/nginx/html

# Give ownership to non-root user
RUN chown -R appuser:appuser /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]