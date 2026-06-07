@echo off
REM ============================================================
REM  e-Joutia full launcher
REM  Opens the Django backend and the Expo dev server in two
REM  separate windows that STAY OPEN (so the QR code is visible).
REM  Your phone and this PC must be on the SAME Wi-Fi network.
REM ============================================================

echo Launching e-Joutia backend + frontend...

REM --- Backend window (Django on all interfaces, port 8000) ---
start "eJoutia Backend" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 0.0.0.0:8000"

REM Give the backend a moment to boot.
timeout /t 3 /nobreak >nul

REM --- Frontend window (Expo / Metro) ---
REM --clear resets the cache; the QR code will appear in this window.
start "eJoutia Expo" cmd /k "cd /d "%~dp0frontend" && npx expo start --clear"

echo.
echo Two windows opened:
echo   1) eJoutia Backend  - Django API (leave it running)
echo   2) eJoutia Expo     - scan the QR code with the Expo Go app
echo.
echo If the QR does not appear, wait ~30s for Metro to start.
echo You can also open Expo Go and enter this URL manually:
echo     exp://192.168.11.103:8081
echo.
pause
