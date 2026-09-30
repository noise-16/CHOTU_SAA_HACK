@echo off
title CareWell Hospital Portal - Local Server
cd /d "%~dp0"
echo ========================================================
echo   Launching CareWell Hospital Portal (Localhost Server)
echo   Local URL: http://localhost:3000/
echo ========================================================

rem Auto-open browser
start http://localhost:3000/

rem Try launching with Python built-in HTTP server
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Starting Python HTTP server on port 3000...
    python -m http.server 3000
    goto :eof
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Starting Python (py launcher) HTTP server on port 3000...
    py -m http.server 3000
    goto :eof
)

rem Fallback to native Windows PowerShell script
echo Starting PowerShell native HTTP server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"

pause
