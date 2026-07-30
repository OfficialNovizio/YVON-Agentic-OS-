# Penpot — install guide

Open-source design and prototyping platform (Figma alternative).

## Prerequisites

- Docker + Docker Compose
- 2GB RAM

## Install

```bash
mkdir -p /opt/penpot && cd /opt/penpot
wget https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml
wget https://raw.githubusercontent.com/penpot/penpot/main/docker/images/config.env
docker compose -p penpot -f docker-compose.yaml up -d
```

## Access

`http://localhost:9001` → create account

## Consuming agents

- **atlas** — brand kit creation, design systems
- **spark** — creative direction, prototyping
- **pixel** — visual design execution
