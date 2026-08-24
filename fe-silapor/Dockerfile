# =========================================================
# Stage 1: Build
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json & lockfile lebih dulu supaya layer cache npm install terpakai
COPY package*.json ./
RUN npm ci

# Copy seluruh source code frontend
COPY . .

# Terima VITE_API_BASE_URL saat build time (Vite meng-inline env di hasil build)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# =========================================================
# Stage 2: Runtime (Nginx)
# =========================================================
FROM nginx:1.27-alpine

# Konfigurasi Nginx khusus SPA (fallback semua route ke index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build ke folder default Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
