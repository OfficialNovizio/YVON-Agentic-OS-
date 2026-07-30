# AppFlowy — install guide

Open-source collaborative workspace (Notion alternative). AI-powered.

## Install (cloud server)

```bash
git clone https://github.com/AppFlowy-IO/AppFlowy-Cloud.git /opt/appflowy-cloud
cd /opt/appflowy-cloud
cp deploy.env .env
# Configure: domain, DB passwords, JWT secrets
docker compose up -d
```

## Desktop app (Mac)

```bash
brew install appflowy
```

## Consuming agents

- **spec** — PRD writing, product specs, meeting notes
- **marcus** — strategy documents, roadmap planning
