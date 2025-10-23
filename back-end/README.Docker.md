# Docker Setup for Macro Mate API

## Requirements

* Docker >= 20.10
* Docker Compose >= 2.0

## Usage

### 1. Environment Configuration

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Build and Run the Application

#### Run all services (FastAPI + PostgreSQL + Redis)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f api
docker-compose logs -f redis
docker-compose logs -f postgres
```

#### Run only Redis and PostgreSQL (development mode)

```bash
# Start only database services
docker-compose up -d postgres redis

# Run FastAPI locally
python main.py
```

### 3. Manage Containers

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (caution: this will delete data)
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

### 4. Health Checks

```bash
# API health check
curl http://localhost:8000/health

# Redis health check
docker-compose exec redis redis-cli ping

# PostgreSQL health check
docker-compose exec postgres pg_isready -U macromate
```

## Useful Commands

### Access Containers

```bash
# Access API container
docker-compose exec api bash

# Access Redis CLI
docker-compose exec redis redis-cli

# Access PostgreSQL
docker-compose exec postgres psql -U macromate -d macromate_db
```

### Database Migrations

```bash
# Run migrations
docker-compose exec api python add_profile_fields_migration.py

# Initialize database
docker-compose exec api python -c "from database.init_db import init_db; init_db()"
```

### View Logs

```bash
# Follow logs of all services
docker-compose logs -f

# Follow logs of API
docker-compose logs -f api

# Show last 100 log lines
docker-compose logs --tail=100 api
```

### Monitor Resources

```bash
# View resource usage
docker stats

# View container details
docker-compose ps
```

## Endpoints

Once running successfully, you can access:

* **API**: [http://localhost:8000](http://localhost:8000)
* **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
* **PostgreSQL**: localhost:5432
* **Redis**: localhost:6379

## Volumes

Data is stored in Docker volumes:

* `postgres_data`: PostgreSQL data
* `redis_data`: Redis data (AOF persistence)

## Security Notes

**IMPORTANT:** For production environments:

1. Change all passwords and secret keys
2. Set `DEBUG=false`
3. Use HTTPS
4. Restrict CORS origins
5. Use environment variables, do not commit `.env`
6. Use a secrets manager (e.g., AWS Secrets Manager)

## Troubleshooting

### Port Already in Use

```bash
# Change ports in the .env file
API_PORT=8001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Container Not Starting

```bash
# Check logs for debugging
docker-compose logs api

# Check service status
docker-compose ps
```

### Database Connection Errors

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Errors

```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

## Production Deployment

You can deploy to production using one of the following options:

### Option 1: Docker Compose (Simple)

```bash
# Set production environment
export DEBUG=false
export LOG_LEVEL=WARNING

# Run with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes

Convert Docker Compose to Kubernetes manifests:

```bash
kompose convert
kubectl apply -f .
```

### Option 3: Cloud Services

* **AWS**: Elastic Container Service (ECS) or EKS
* **Google Cloud**: Cloud Run or GKE
* **Azure**: Container Instances or AKS

## References

* [FastAPI Documentation](https://fastapi.tiangolo.com/)
* [Docker Documentation](https://docs.docker.com/)
* [Redis Documentation](https://redis.io/documentation)
* [PostgreSQL Documentation](https://www.postgresql.org/docs/)
