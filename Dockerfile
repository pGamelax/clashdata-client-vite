# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalar pnpm se estiver usando
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependências
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    else npm ci || npm install; fi

# Copiar código fonte
COPY . .

# Build da aplicação
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; \
    else npm run build; fi

# Stage 2: Production - Usar serve para servir arquivos estáticos
FROM node:20-alpine

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve@14.2.1

# Copiar arquivos de build
COPY --from=builder /app/dist ./dist

# Expor porta 3000 (Traefik/Caddy fará o proxy reverso)
EXPOSE 3000

# Servir arquivos estáticos na porta 3000 com suporte a SPA (--single)
CMD ["serve", "-s", "dist", "-l", "3000"]
