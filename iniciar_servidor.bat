@echo off
title Industrial Safety Monitor - Servidor Local
chcp 65001 >nul
cls

echo =====================================================================
echo           INDUSTRIAL SAFETY MONITOR - MONITORAMENTO ESP32
echo =====================================================================
echo.
echo Identificando o endereco IP da sua maquina na rede local...
echo.

powershell -NoProfile -Command ^
  "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { Write-Host ('  Interface: ' + $_.InterfaceAlias.PadRight(15) + ' | IP: ' + $_.IPAddress) -ForegroundColor Cyan }"

echo.
echo ---------------------------------------------------------------------
echo No codigo do ESP32 (Codigo_Teste_API.ino), configure:
echo   const char* apiURL = "http://SEU_IP_WIFI:3000/api/dados";
echo   (Utilize o IP da interface Wi-Fi exibido acima)
echo ---------------------------------------------------------------------
echo.
echo Iniciando o servidor web e a API na porta 3000...
echo Acesse no seu navegador: http://localhost:3000
echo.

cd Teste_Site_IAstudio
npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocorreu um erro ao executar o servidor.
    pause
)
