# Bitwarden Server — install guide

Self-hosted password manager for fleet credentials.

## Prerequisites

- Docker + Docker Compose
- 4GB RAM, 12GB storage
- A domain with SSL (e.g., `vault.yvon.in`)
- Installation ID + key from https://bitwarden.com/host

## Install

```bash
mkdir -p /opt/bitwarden && cd /opt/bitwarden
curl -s -L -o bitwarden.sh \
  "https://func.bitwarden.com/api/dl/?app=self-host&platform=linux"
chmod +x bitwarden.sh
./bitwarden.sh install
# Follow prompts: domain, SSL, installation ID
./bitwarden.sh start
```

## Lighter alternative: Vaultwarden

If the VPS doesn't have 4GB RAM:

```bash
docker run -d --name vaultwarden \
  -v /opt/vaultwarden-data:/data \
  -p 8080:80 \
  vaultwarden/server:latest
```

## Consuming agents

- **warden** — fleet secrets management
- **bastion** — IAM credential storage
- **ops** — deployment secrets, API keys
