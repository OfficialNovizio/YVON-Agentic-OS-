# Whisper — install guide

Install on your **Mac** (or VPS) once. Agents reference it from `shared-tool-registry.md`.

## Prerequisites

```bash
brew install ffmpeg
```

## Install

```bash
pip install -U openai-whisper
```

## Verify

```bash
whisper --help
whisper models tiny --language English
```

## Integration

Used by `dashboard/lib/audio-recorder.ts` to transcribe voice messages.
Agents invoke via Python: `import whisper; model = whisper.load_model("base")`
