@echo off
title CareWell Hospital Full-Stack Suite
echo ========================================================
echo   Launching CareWell Full-Stack Medical OPD System
echo   1. Backend API (Port 5000)
echo   2. Staff Web Portal (Port 5173)
echo   3. Patient Mobile App (Expo Metro)
echo ========================================================

start "CareWell Backend API" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d %~dp0backend && node src/server.js"
timeout /t 2 /nobreak >nul

start "CareWell Staff Web Portal" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d %~dp0staff-web && npm run dev"
timeout /t 2 /nobreak >nul

start "CareWell Patient Mobile App" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d %~dp0patient-app && npx expo start"

echo ========================================================
echo   All 3 services are launching in their own windows!
echo   - Staff Web URL:    http://localhost:5173
echo   - Backend API URL:  http://localhost:5000
echo   - Patient Expo App: Metro terminal & QR code
echo ========================================================
pause
