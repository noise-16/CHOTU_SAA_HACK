@echo off
echo Starting ClearQueue: Smart Patient Prioritization Assistant...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
