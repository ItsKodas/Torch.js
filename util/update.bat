@echo off

powershell Stop-Process %2

wget.exe %1 -O ../update.zip
cd..
powershell Expand-Archive -Force update.zip ./
del update.zip
TorchJs.exe