@echo off
setlocal

cd /d "%~dp0"

if not exist package.json (
  echo package.json not found.
  echo Put this file in the project root folder and try again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found.
  echo Install Node.js from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo node_modules not found. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

set "PORT_IN_USE="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":5173 .*LISTENING"') do (
  set "PORT_IN_USE=%%P"
  goto :port_check_done
)
:port_check_done

if defined PORT_IN_USE (
  echo Port 5173 is already in use by PID %PORT_IN_USE%.
  echo The Vite server is probably already running.
  echo Opening http://127.0.0.1:5173 in your browser...
  start "" "http://127.0.0.1:5173"
  echo.
  echo If this is the wrong process, stop the old server first and run this file again.
  pause
  exit /b 0
)

echo Starting the development server...
echo Open http://127.0.0.1:5173 after Vite finishes starting.
call npm run dev

pause
