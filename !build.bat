@echo off
chcp 65001 > nul

call pnpm docs:build

if %errorlevel% NEQ 0 (
    pause > nul
)
