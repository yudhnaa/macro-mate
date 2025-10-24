# Deployment Guide - DigitalOcean Droplet

## Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04 LTS)
- Domain name (optional)
- Environment variables

## Step 1: Setup Server

1. SSH vào droplet của bạn:

```bash
ssh root@your-droplet-ip
```

2. Copy script setup lên server:

```bash
# Trên máy local
scp scripts/initial-server-setup.sh root@your-droplet-ip:/tmp/
```

3. Chạy script setup trên server:

```bash
# Trên server
chmod +x /tmp/initial-server-setup.sh
/tmp/initial-server-setup.sh
```

4. Logout và login lại để apply docker group:

```bash
exit
ssh root@your-droplet-ip
```

## Step 2: Clone Repository

```bash
cd /opt/macro-mate
git clone https://github.com/yudhnaa/macro-mate.git .
```

## Step 3: Setup Environment Variables

1. Tạo file `.env` trong thư mục `back-end`:

```bash
cd /opt/macro-mate/back-end
nano .env
```

2. Thêm các biến môi trường cần thiết:

```env
# Database
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=macro_mate
DATABASE_HOST=macro-mate-postgres

# Redis
REDIS_URL=redis://macro-mate-redis:6379/0

# JWT
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

3. Tạo file `.env` ở root nếu cần (cho frontend):

```bash
cd /opt/macro-mate
nano .env
```

```env
NEXT_PUBLIC_API_URL=http://your-droplet-ip/api
```

## Step 4: Deploy Application

```bash
cd /opt/macro-mate
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Step 5: Verify Deployment

1. Check containers đang chạy:

```bash
docker-compose -f docker-compose.prod.yml ps
```

2. Check logs nếu có vấn đề:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

3. Truy cập application:

- Frontend: `http://your-droplet-ip`
- Backend API: `http://your-droplet-ip/api`
- API Docs: `http://your-droplet-ip/docs`

## Update Application

Để update code mới:

```bash
cd /opt/macro-mate
./scripts/deploy.sh
```

## Troubleshooting

### Container không start được

```bash
docker-compose -f docker-compose.prod.yml logs [service-name]
```

### Reset toàn bộ

```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

## Notes

- Mặc định chạy trên port 80 (HTTP)
- Database và Redis data được lưu trong Docker volumes
- Containers tự động restart khi server reboot
