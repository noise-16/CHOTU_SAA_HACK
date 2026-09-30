@echo off
title CareWell Patient Mobile App (Expo)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0patient-app"
echo ========================================================
echo   Starting CareWell Patient Mobile App (React Native Expo)
echo ========================================================
call npx expo start
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred running patient mobile app.
    pause
)
