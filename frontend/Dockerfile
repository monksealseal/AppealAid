FROM node:18-alpine AS build

WORKDIR /app

# Build arguments for environment
ARG REACT_APP_API_URL=http://localhost:5000/api
ARG REACT_APP_USE_MOCK_API=false
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY=

# Set environment for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_USE_MOCK_API=$REACT_APP_USE_MOCK_API
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=$REACT_APP_STRIPE_PUBLISHABLE_KEY

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:5000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
