@echo off
title CareWell Staff Web Portal (Port 5173)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0staff-web"
echo ========================================================
echo   Starting CareWell Staff Web Portal (React + Vite)
echo   URL: http://localhost:5173
echo ========================================================
call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred running staff web portal.
    pause
)
