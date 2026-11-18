# syntax=docker/dockerfile:1
# Shared by Admin-Section and User-Section (build context = the app folder).

# ── build the Vite app ──
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Baked into the JS bundle at build time; it's the API address as seen from the browser.
ARG VITE_REACT_APP_BASE_URL=http://localhost:3000
ENV VITE_REACT_APP_BASE_URL=$VITE_REACT_APP_BASE_URL
RUN npx vite build

# ── serve the static files ──
FROM nginx:1.27-alpine
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;

    # client-side routes (react-router) fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # hashed build assets never change
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
COPY --from=build /app/dist /usr/share/nginx/html
