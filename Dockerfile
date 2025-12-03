# 1. Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package*.json ./
RUN npm install

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN nest build

# 2. Runtime stage
FROM node:18-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY samples ./samples
COPY public ./public

RUN mkdir -p /data

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
