@echo off
REM run-capture-worker.cmd — persistence wrapper for the reference-capture relay.
REM
REM WHY THIS EXISTS: capture-worker.py must run on THIS machine (a residential IP),
REM not the VPS — Akamai-class bot walls 403 every server-side scraping path. It
REM was previously started by hand and therefore ran only when someone remembered,
REM which is why reference captures silently never happened. Registered as the
REM ONLOGON scheduled task "YVON-CaptureWorker" so it survives reboots and, more
REM importantly, survives the agent session that started it.
REM
REM Owner: mia/dev - reference-capture relay
cd /d "%~dp0.."
if not exist logs mkdir logs
"C:\Python314\python.exe" "scripts\capture-worker.py" >> "logs\capture-worker.log" 2>&1
