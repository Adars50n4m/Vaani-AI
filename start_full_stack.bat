@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting ChatterBox full stack (frontend + backend)...

set "ROOT=%~dp0"
cd /d "%ROOT%"

:: Ensure Python
where py >nul 2>nul
if %errorlevel%==0 (
    set "PYTHON=py -3"
) else (
    where python >nul 2>nul
    if %errorlevel%==0 (
        set "PYTHON=python"
    ) else (
        echo ❌ Python 3 is required but was not found.
        exit /b 1
    )
)

if not exist chatterbox_env (
    echo 🐍 Creating Python virtual environment...
    %PYTHON% -m venv chatterbox_env
)

echo 🐍 Activating virtual environment...
call chatterbox_env\Scripts\activate.bat

echo 📦 Installing backend dependencies (if needed)...
pip install --upgrade pip >nul
pip install -r backend\requirements.txt >nul

echo 📦 Installing frontend dependencies (if needed)...
if not exist node_modules (
    npm install
) else (
    call npm install >nul
)

echo 🛠  Launching backend window...
start "ChatterBox Backend" cmd /k "cd /d %ROOT%\backend && python app.py"

echo 🌐 Launching frontend window...
start "ChatterBox Frontend" cmd /k "cd /d %ROOT% && npm run dev"

echo.
echo ✅ Backend available at http://localhost:8000
echo ✅ Frontend available at http://localhost:3000
echo Close the opened CMD windows to stop each service.
pause
