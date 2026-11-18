# syntax=docker/dockerfile:1

# ── deps: install packages (build tools only in case bcrypt has no prebuilt binary) ──
FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json prisma.config.js ./
COPY prisma ./prisma
# postinstall runs `prisma generate`, which needs the dev-only prisma CLI; prune it afterwards.
RUN npm ci && npm prune --omit=dev

# ── runtime ──
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 3000
# NODE_ENV is deliberately not "production": Utils/handleCookies.js then requires HTTPS-only
# cookies, and login breaks when the stack is served over plain http://localhost.
CMD ["node", "index.js"]
