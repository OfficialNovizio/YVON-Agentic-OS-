# Plausible CE — install guide

Privacy-first web analytics. Self-hosted Google Analytics alternative.

## Prerequisites

- Docker + Docker Compose
- 2GB RAM minimum
- A domain/subdomain (e.g., `analytics.yvon.in`)

## Install

```bash
git clone https://github.com/plausible/community-edition.git /opt/plausible
cd /opt/plausible
cp .env.example .env
# Edit .env: set BASE_URL, SECRET_KEY (openssl rand -base64 48)
# Set admin email + password
docker compose up -d
```

## Access

`http://localhost:8000` → login with admin credentials

## Nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name analytics.yvon.in;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Consuming agents

- **ops** — deploys and monitors
- **rank** — SEO data (traffic sources, page views, bounce rate)
