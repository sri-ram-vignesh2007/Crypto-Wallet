@echo off
echo ===================================================
echo   Starting CryptoVaultAI Python FastAPI Backend
echo ===================================================

cd /d "%~dp0\.."
echo Installing Python dependencies...
python -m pip install -r backend\requirements.txt

echo.
echo Starting FastAPI server at http://localhost:8000
echo OpenAPI Documentation available at http://localhost:8000/docs
echo.

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
