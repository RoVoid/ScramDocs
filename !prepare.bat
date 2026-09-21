@echo off

if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml

call pnpm add -D vite vitepress vitepress-sidebar @types/node
if errorlevel 1 goto error

call npm pkg set scripts.docs:dev="vitepress dev docs" scripts.docs:build="vitepress build docs" scripts.docs:preview="vitepress preview docs"
if errorlevel 1 goto error

if not exist docs (
    call npx vitepress init
    if errorlevel 1 goto error
)

exit /b 0

:error
pause
exit /b 1