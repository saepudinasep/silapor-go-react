# =========================================================
# Stage 1: Build
# =========================================================
FROM golang:1.22-alpine AS builder

# git & ca-certificates dibutuhkan untuk `go mod download` dari module private/public
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy go.mod & go.sum lebih dulu supaya layer cache terpakai
# saat cuma kode yang berubah (bukan dependency)
COPY go.mod go.sum ./
RUN go mod download

# Copy seluruh source code backend
COPY . .

# Build binary statis (CGO_ENABLED=0 supaya bisa jalan di base image minimal)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o silapor-api main.go

# Build binary migrate CLI juga, sekalian, supaya migration bisa dijalankan dari dalam container
RUN CGO_ENABLED=0 GOOS=linux go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# =========================================================
# Stage 2: Runtime
# =========================================================
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary hasil build dari stage builder
COPY --from=builder /app/silapor-api .
COPY --from=builder /go/bin/migrate /usr/local/bin/migrate

# Copy folder migration & konfigurasi lain yang dibutuhkan saat runtime
COPY database/migrations ./database/migrations

# Buat folder uploads (mount sebagai volume di docker-compose)
RUN mkdir -p /app/uploads

EXPOSE 8081

CMD ["./silapor-api"]
