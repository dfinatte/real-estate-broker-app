@echo off
echo Building Real Estate App for distribution...

echo 1. Cleaning previous build...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

echo 2. Creating production build...
call npm run build

echo 3. Creating distribution folder...
mkdir dist
mkdir dist\app

echo 4. Copying build files...
xcopy build\* dist\app\ /E /I /Y

echo 5. Creating local server files...
echo @echo off > dist\start-app.bat
echo echo Starting Real Estate App... >> dist\start-app.bat
echo echo Opening browser... >> dist\start-app.bat
echo start http://localhost:8080 >> dist\start-app.bat
echo echo Starting server... >> dist\start-app.bat
echo npx serve -s app -l 8080 >> dist\start-app.bat
echo pause >> dist\start-app.bat

echo 6. Creating installation guide...
echo # Real Estate App - Guia de Instalação > dist\README.md
echo. >> dist\README.md
echo ## Como usar o app: >> dist\README.md
echo 1. Execute o arquivo start-app.bat >> dist\README.md
echo 2. Aguarde abrir no navegador >> dist\README.md
echo 3. Instale como app clicando no ícone de instalação (+) >> dist\README.md
echo 4. Pronto! App instalado no seu desktop >> dist\README.md
echo. >> dist\README.md
echo ## Requisitos: >> dist\README.md
echo - Windows 10 ou superior >> dist\README.md
echo - Navegador Chrome ou Edge >> dist\README.md
echo - Conexão com internet (apenas na primeira instalação) >> dist\README.md

echo 7. Creating ZIP file...
cd dist
powershell -Command "Compress-Archive -Path * -DestinationPath '../real-estate-app.zip' -Force"
cd ..

echo.
echo ✅ Distribution package created: real-estate-app.zip
echo 📁 Send this file to your brokers
echo 📋 They just need to unzip and run start-app.bat
pause
