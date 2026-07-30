# ScrapeGraphAI — AI web scraping

## How agents use this

```python
from scrapegraphai.graphs import SmartScraperGraph

config = {
    "llm": {
        "model": "ollama/llama3.2",  # or "openai/gpt-4o-mini" with api_key
        "format": "json",
    },
    "verbose": True,
}

graph = SmartScraperGraph(
    prompt="Extract product prices and descriptions",
    source="https://example.com/products",
    config=config,
)

result = graph.run()
```

## Pipelines

| Pipeline | Use |
|---|---|
| SmartScraperGraph | Single page, one prompt |
| SearchGraph | Top search results across pages |
| ScriptCreatorGraph | Generates a standalone Python scraper |
| SpeechGraph | Extract + generate audio summary |

## Consuming agents

- **dana** — structured data extraction for analytics
- **rank** — SEO competitive analysis (extract meta, headings, schemas)
- **cypher** — recon (extract public info from target pages)
