@echo off
chcp 65001 > nul

call ./!build.bat
call pnpm docs:preview

if %errorlevel% NEQ 0 (
    pause > nul
)
