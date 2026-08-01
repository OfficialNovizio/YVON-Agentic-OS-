#!/usr/bin/env bash
# task.sh — TASK-SPEC record manager (MASTER PART 6 state machine · PART 8 §8.5).
# Thin wrapper over cli/task.py (robust YAML handling, no pyyaml dependency).
# `task.sh validate` exits 1 on a bad record so cli/verify-deploy.sh can gate on it.
exec python3 "$(cd "$(dirname "$0")" && pwd)/task.py" "$@"
