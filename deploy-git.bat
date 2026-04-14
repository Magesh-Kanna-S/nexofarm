@echo off
title NexoFarm Git Deploy

echo ==============================
echo React Git Auto Deploy (NexoFarm)
echo ==============================

REM ---- Set Git identity ----
git config --global user.name "Magesh Kanna S"
git config --global user.email "mageshkanna.mk@gmail.com"

echo Git identity configured.

REM ---- Check git ----
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git not installed or not in PATH
    pause
    exit /b
)

REM ---- Init repo if not exists ----
if not exist ".git" (
    echo Initializing git repository...
    git init
)

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
git commit -m "initial commit"

echo.
echo Setting branch to main...
git branch -M main

echo.
echo Setting remote repo...

git remote set-url origin https://github.com/Magesh-Kanna-S/nexofarm.git 2>nul
if %errorlevel% neq 0 (
    git remote add origin https://github.com/Magesh-Kanna-S/nexofarm.git
)

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ==============================
echo DONE! Successfully deployed NexoFarm
echo ==============================
pause