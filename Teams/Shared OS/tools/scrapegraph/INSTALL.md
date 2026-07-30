# ScrapeGraphAI — install guide

AI-powered web scraper. Describe what data you want in plain language; it extracts it using an LLM.

## Install

```bash
pip install scrapegraphai
playwright install chromium
```

## Verify

```bash
python3 -c "from scrapegraphai.graphs import SmartScraperGraph; print('OK')"
```

## LLM config

Needs an LLM backend:
- **Cloud:** OpenAI key, Groq key (free tier available), Azure, Gemini
- **Local:** Ollama (`ollama pull llama3.2`)

Source: https://github.com/ScrapeGraphAI/Scrapegraph-ai
