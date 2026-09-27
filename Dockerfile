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

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# Let the image's non-root nginx user write its cache, logs, config and pid file
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Unprivileged port (nginx.conf listens here)
EXPOSE 8080

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
