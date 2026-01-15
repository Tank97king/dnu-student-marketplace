@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo   PUSH CODE TO GITHUB
echo ========================================
echo.

:: Check if git is installed
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check if current directory is a git repository
if not exist ".git" (
    echo [ERROR] Current directory is not a git repository
    echo Please run: git init
    pause
    exit /b 1
)

:: Get current date in MM/DD/YYYY format
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%

:: Format: MM/DD/YYYY
set commit_date=%month%/%day%/%year%

echo Current date: %commit_date%
echo.

:: Check if there are changes to commit
git status --porcelain >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cannot check git status
    pause
    exit /b 1
)

:: Check if there are any changes
git diff --quiet && git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo [INFO] No changes to commit
    echo.
    echo Do you want to push anyway? (Y/N)
    set /p push_anyway=
    if /i not "!push_anyway!"=="Y" (
        echo Cancelled.
        pause
        exit /b 0
    )
)

:: Check if remote origin exists
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] No remote origin found
    echo.
    echo Please add remote origin first:
    echo   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
    echo.
    set /p add_remote=Do you want to add remote now? (Y/N): 
    if /i "!add_remote!"=="Y" (
        set /p remote_url=Enter remote URL: 
        git remote add origin !remote_url!
        if !ERRORLEVEL! NEQ 0 (
            echo [ERROR] Failed to add remote
            pause
            exit /b 1
        )
    ) else (
        pause
        exit /b 1
    )
)

echo.
echo [Step 1/4] Adding all files...
git add .

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)

echo [Step 2/4] Committing changes...
git commit -m "%commit_date%"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to commit
    echo This might happen if there are no changes to commit
    pause
    exit /b 1
)

echo [Step 3/4] Checking current branch...
git branch --show-current >temp_branch.txt 2>&1
set /p current_branch=<temp_branch.txt
del temp_branch.txt

if "%current_branch%"=="" (
    echo [INFO] No branch found, creating main branch...
    git checkout -b main
    set current_branch=main
)

echo Current branch: %current_branch%
echo.

echo [Step 4/4] Pushing to GitHub...
git push -u origin %current_branch%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] PUSHED TO GITHUB!
    echo ========================================
    echo.
    echo Commit message: %commit_date%
    echo Branch: %current_branch%
    echo.
) else (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo.
    echo Possible reasons:
    echo   1. Authentication failed - check your GitHub credentials
    echo   2. Remote repository doesn't exist
    echo   3. Network connection issue
    echo.
    echo For authentication help, see: HUONG_DAN_PUSH_GITHUB.md
    echo.
)

pause

