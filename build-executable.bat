@echo off
echo Building Real Estate App as Windows Executable...

echo 1. Cleaning previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

echo 2. Creating production build...
call npm run build

echo 3. Building Electron executable...
call npm run electron-pack

echo.
echo ✅ Executable created successfully!
echo 📁 Check the 'dist' folder for:
echo    - Real Estate Broker App Setup.exe (installer)
echo    - Real Estate Broker App.exe (portable version)
echo.
echo 🎯 Your app is now a standalone Windows program!
pause
