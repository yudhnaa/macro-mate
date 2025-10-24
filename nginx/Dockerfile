FROM nginx:alpine

# Cài các công cụ cần thiết
RUN apk add --no-cache openssl bash gettext

# Copy template file
COPY conf.d/macro-mate.conf.template /etc/nginx/templates/macro-mate.conf.template

# Khi container start, tự sinh SSL + render file config từ ENV
CMD ["/bin/bash", "-c", "\
  mkdir -p /etc/nginx/ssl && \
  if [ ! -f /etc/nginx/ssl/selfsigned.crt ]; then \
    echo 'Generating self-signed SSL certificate...'; \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/selfsigned.key \
      -out /etc/nginx/ssl/selfsigned.crt \
      -subj \"/CN=${SSL_CN:-localhost}\"; \
  else \
    echo 'SSL certificate already exists. Skipping generation.'; \
  fi && \
  echo 'Rendering nginx.conf from environment...' && \
  envsubst '$$SERVER_NAME $$BACKEND_HOST $$BACKEND_PORT' < /etc/nginx/templates/macro-mate.conf.template > /etc/nginx/conf.d/default.conf && \
  echo 'Starting Nginx with SSL...' && \
  nginx -g 'daemon off;'"]
