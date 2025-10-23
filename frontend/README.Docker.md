# Docker Deployment Guide

## Cấu trúc Files Docker

- `Dockerfile`: Multi-stage build cho Next.js app
- `docker-compose.yml`: Cấu hình Docker Compose
- `.dockerignore`: Files/folders bị ignore khi build
- `.env.example`: Template cho environment variables

## Cách sử dụng

### 1. Build và Run với Docker Compose (Khuyến nghị)

```bash
# Build và start container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop container
docker-compose down
```

### 2. Build và Run với Docker Commands

```bash
# Build image
docker build -t macro-mate-frontend:latest .

# Run container
docker run -p 3000:3000 macro-mate-frontend:latest

# Run với environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-api-url \
  macro-mate-frontend:latest
```

### 3. Sử dụng script build (macOS/Linux)

```bash
# Cho phép execute script
chmod +x docker-build.sh

# Run script
./docker-build.sh
```

## Environment Variables

Tạo file `.env` từ `.env.example` và cấu hình các biến môi trường cần thiết:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với các giá trị thực tế của bạn.

## Production Deployment

Để deploy lên production:

1. **Cấu hình environment variables** trong file `.env` hoặc trực tiếp trong Docker
2. **Build image**: `docker-compose build`
3. **Start services**: `docker-compose up -d`
4. **Kiểm tra**: Truy cập `http://localhost:3000`

## Troubleshooting

### Container không start

```bash
# Xem logs
docker-compose logs frontend

# Restart container
docker-compose restart frontend
```

### Rebuild sau khi thay đổi code

```bash
# Rebuild và restart
docker-compose up -d --build
```

### Clear cache và rebuild hoàn toàn

```bash
# Stop và remove containers
docker-compose down

# Remove image
docker rmi macro-mate-frontend:latest

# Rebuild
docker-compose up -d --build
```

## Notes

- Port mặc định: `3000`
- Node version: `20-alpine`
- Output mode: `standalone` (đã cấu hình trong `next.config.ts`)
- Multi-stage build giúp giảm kích thước image cuối cùng

## Deploy lên Cloud

### Deploy lên Docker Hub

```bash
# Login
docker login

# Tag image
docker tag macro-mate-frontend:latest your-username/macro-mate-frontend:latest

# Push
docker push your-username/macro-mate-frontend:latest
```

### Deploy lên AWS ECS, Google Cloud Run, hoặc Azure Container Instances

Sử dụng image đã build và push lên registry, sau đó cấu hình service trên platform tương ứng.
