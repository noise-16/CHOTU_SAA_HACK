@echo off
echo ========================================================
echo   Starting CareWell Hospital ClearQueue Full-Stack App
echo   FastAPI Backend + SQLite Database + Web Portal
echo ========================================================
start http://localhost:8000/
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
)
pause
