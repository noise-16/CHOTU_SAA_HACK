@echo off
echo ========================================================
echo   Starting ClearQueue FastAPI + SQLite Backend
echo   API Docs: http://localhost:8000/docs
echo   Web Portal: http://localhost:8000/
echo ========================================================
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    "C:\Users\Lenovo\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
)
pause
