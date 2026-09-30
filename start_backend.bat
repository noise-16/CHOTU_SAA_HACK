@echo off
title CareWell Backend API (Port 5000)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0backend"
echo ========================================================
echo   Starting CareWell Backend API & Socket.io Hub
echo   URL: http://localhost:5000
echo ========================================================
node src/server.js
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred running backend.
    pause
)
