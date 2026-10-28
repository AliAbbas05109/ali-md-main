@echo off
title ALI MD WEBSITE
cd /d "%~dp0"
if not exist node_modules (
  echo First run: installing packages...
  call npm install
)
echo Website: http://localhost:3000
node server.js
pause
