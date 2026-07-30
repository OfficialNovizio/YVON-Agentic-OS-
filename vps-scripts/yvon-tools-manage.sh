#!/usr/bin/env bash
# YVON Global Tools — start/stop/status
# Install: cp this file to /opt/yvon-tools/manage.sh && chmod +x && ln -sf /opt/yvon-tools/manage.sh /usr/local/bin/yvon-tools
TOOLS_DIR="/opt/yvon-tools/docker"
TOOL=$2
ACTION=$1

case "$ACTION" in
  start)
    case "$TOOL" in
      plausible) cd $TOOLS_DIR/plausible && docker compose up -d ;;
      penpot) cd $TOOLS_DIR/penpot && docker compose up -d ;;
      cal-diy) cd $TOOLS_DIR/cal-diy && docker compose up -d ;;
      vaultwarden) cd $TOOLS_DIR/vaultwarden && docker compose up -d ;;
      *) echo "Tools: plausible, penpot, cal-diy, vaultwarden" ;;
    esac
    ;;
  stop)
    case "$TOOL" in
      plausible) cd $TOOLS_DIR/plausible && docker compose down ;;
      penpot) cd $TOOLS_DIR/penpot && docker compose down ;;
      cal-diy) cd $TOOLS_DIR/cal-diy && docker compose down ;;
      vaultwarden) cd $TOOLS_DIR/vaultwarden && docker compose down ;;
      all) for d in plausible penpot cal-diy vaultwarden; do [ -d "$TOOLS_DIR/$d" ] && cd "$TOOLS_DIR/$d" && docker compose down 2>/dev/null; done ;;
      *) echo "Tools: plausible, penpot, cal-diy, vaultwarden, all" ;;
    esac
    ;;
  status)
    echo "=== Running ==="
    docker ps --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "=== All tools ==="
    echo "  hermes       always-on  (https://hermes.yvon.in)"
    echo "  whisper      CLI        (whisper audio.wav)"
    echo "  agent-reach  CLI        (agent-reach read URL)"
    echo "  scrapegraph  Python lib (from scrapegraphai import ...)"
    echo "  browser-use  Python lib (from browser_use import Agent)"
    echo "  opensandbox  CLI        (osb --help)"
    echo "  crawl4ai     Python lib (from crawl4ai import ...)"
    echo "  plausible    docker     (yvon-tools start plausible)"
    echo "  penpot       docker     (yvon-tools start penpot)"
    echo "  cal-diy      docker     (yvon-tools start cal-diy)"
    echo "  vaultwarden  docker     (yvon-tools start vaultwarden)"
    ;;
  *) echo "Usage: yvon-tools <start|stop|status> <tool>" ;;
esac
