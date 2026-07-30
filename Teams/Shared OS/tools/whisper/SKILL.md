---
name: whisper
type: shared-os tool (Python library)
description: OpenAI Whisper — speech-to-text transcription. Models run locally, no API key needed.
consumers: raj (backend API), mia (audio recorder UI)
status: installed 2026-07-30
---

## How agents use this

```python
import whisper

model = whisper.load_model("base")  # tiny/base/small/medium/large
result = model.transcribe("path/to/audio.wav")
text = result["text"]
```

## Model size / performance

| Model | RAM | Speed | Accuracy |
|---|---|---|---|
| tiny | ~1GB | fastest | lowest |
| base | ~1GB | fast | good |
| small | ~2GB | moderate | better |
| medium | ~5GB | slow | high |
| large | ~10GB | slowest | best |

## VPS note

On a 2GB VPS, use `base` or `tiny`. `small` may OOM.
