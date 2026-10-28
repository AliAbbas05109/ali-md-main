@echo off
title ALI MD BOT
cd /d "%~dp0"
if not exist node_modules (
  echo First run: installing packages...
  call npm install
)
:loop
node index.js
if %errorlevel% geq 100 (
  echo Bot stopped. The problem is shown above.
  pause
  exit /b
)
echo Bot stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
