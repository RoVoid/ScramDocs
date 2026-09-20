@echo off

if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml

call pnpm install
if %errorlevel% NEQ 0 goto error

call pnpm install vite
if %errorlevel% NEQ 0 goto error

call pnpm install -D vitepress
if %errorlevel% NEQ 0 goto error

call pnpm install -D vitepress-sidebar
if %errorlevel% NEQ 0 goto error

call pnpm install -D @types/node
if %errorlevel% NEQ 0 goto error

call npm pkg set scripts.docs:dev="vitepress dev docs" scripts.docs:build="vitepress build docs" scripts.docs:preview="vitepress preview docs"
if %errorlevel% NEQ 0 goto error

npx vitepress init
if %errorlevel% NEQ 0 goto error

exit /b 0

:error
pause
exit /b 1
