
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile


FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build


FROM oven/bun:1-slim AS runner
WORKDIR /app

RUN bun add -g serve


COPY --from=builder /app/dist ./dist

EXPOSE 3000


CMD ["serve", "-s", "dist", "-l", "3000"]