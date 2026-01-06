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

echo 5. Creating server files...
echo @echo off > dist\start-app.bat
echo echo Starting Real Estate App... >> dist\start-app.bat
echo echo Opening browser... >> dist\start-app.bat
echo timeout /t 2 /nobreak >nul >> dist\start-app.bat
echo start http://localhost:8080 >> dist\start-app.bat
echo echo Starting server... >> dist\start-app.bat
echo npx serve -s app -l 8080 >> dist\start-app.bat
echo pause >> dist\start-app.bat

echo 6. Creating easy launcher...
echo Set WshShell = CreateObject("WScript.Shell") > dist\"Iniciar App.vbs"
echo WshShell.Run Chr(34) ^& "start-app.bat" ^& Chr(34), 0 >> dist\"Iniciar App.vbs"
echo Set WshShell = Nothing >> dist\"Iniciar App.vbs"

echo 7. Creating installation guide...
echo # Real Estate App - Guia de Instalação > dist\README.md
echo. >> dist\README.md
echo ## Como usar o app: >> dist\README.md
echo 1. Dê duplo clique em "Iniciar App.vbs" >> dist\README.md
echo 2. Aguarde abrir no navegador automaticamente >> dist\README.md
echo 3. Instale como app clicando no ícone de instalação (+) >> dist\README.md
echo 4. Pronto! App instalado no seu desktop >> dist\README.md
echo. >> dist\README.md
echo ## ATENÇÃO: >> dist\README.md
echo - Use SEMPRE o arquivo "Iniciar App.vbs" >> dist\README.md
echo - NÃO use o start-app.bat diretamente >> dist\README.md
echo. >> dist\README.md
echo ## Requisitos: >> dist\README.md
echo - Windows 10 ou superior >> dist\README.md
echo - Navegador Chrome ou Edge >> dist\README.md
echo - Conexão com internet (apenas na primeira instalação) >> dist\README.md

echo 8. Creating ZIP file...
cd dist
powershell -Command "Compress-Archive -Path * -DestinationPath '../real-estate-app-final.zip' -Force"
cd ..

echo.
echo ✅ Distribution package created: real-estate-app-final.zip
echo 📁 Send this file to your brokers
echo 📋 They just need to double-click "Iniciar App.vbs"
pause
