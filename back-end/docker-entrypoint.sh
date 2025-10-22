#!/bin/sh

set -e

echo "Starting Macro Mate API..."

# Wait for PostgreSQL to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for PostgreSQL..."
    python << END
import time
import psycopg
import os
from urllib.parse import urlparse

max_retries = 30
retry_interval = 1

db_url = os.getenv('DATABASE_URL')
parsed = urlparse(db_url)

for i in range(max_retries):
    try:
        conn = psycopg.connect(db_url)
        conn.close()
        print("PostgreSQL is ready!")
        break
    except Exception as e:
        if i < max_retries - 1:
            print(f"⏳ PostgreSQL not ready yet ({i+1}/{max_retries}), waiting...")
            time.sleep(retry_interval)
        else:
            print(f"Failed to connect to PostgreSQL: {e}")
            exit(1)
END
fi

# Wait for Redis to be ready
if [ -n "$REDIS_URL" ] && [ "$REDIS_ENABLED" = "true" ]; then
    echo "⏳ Waiting for Redis..."
    python << END
import time
import redis
import os
from urllib.parse import urlparse

max_retries = 30
retry_interval = 1

redis_url = os.getenv('REDIS_URL')

for i in range(max_retries):
    try:
        r = redis.from_url(redis_url)
        r.ping()
        print("Redis is ready!")
        break
    except Exception as e:
        if i < max_retries - 1:
            print(f"Redis not ready yet ({i+1}/{max_retries}), waiting...")
            time.sleep(retry_interval)
        else:
            print(f"Redis not available: {e}")
            print("   → Continuing without Redis cache")
            break
END
fi

# Run database migrations if needed
if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    python -c "from database.init_db import init_db; init_db()" || echo "Migration script not available or failed"
fi

echo "Initialization complete!"
echo "Starting FastAPI application..."

# Execute the main command
exec "$@"
