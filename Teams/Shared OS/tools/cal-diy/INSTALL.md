# Cal.diy — install guide

Open-source scheduling infrastructure (Cal.com fork). MIT licensed.

## Prerequisites

- Docker + Docker Compose
- 1GB RAM minimum

## Install

```bash
git clone https://github.com/calcom/cal.diy.git /opt/cal-diy
cd /opt/cal-diy
cp .env.example .env
# Generate secrets:
#   openssl rand -base64 32  → NEXTAUTH_SECRET
#   openssl rand -base64 24  → CALENDSO_ENCRYPTION_KEY
docker compose up -d
```

## Access

`http://localhost:3000` → setup wizard

## Consuming agents

- **raj** — booking/scheduling API integration
- **spec** — meeting scheduling for product reviews
