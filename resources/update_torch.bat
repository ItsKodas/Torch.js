@echo off

%2:
cd %3

C:/Applications/wget.exe https://build.torchapi.net/job/Torch/job/Torch/job/master/lastSuccessfulBuild/artifact/bin/torch-server.zip -O torch-server.zip
powershell Expand-Archive -Force torch-server.zip ./
del torch-server.zip

powershell move "Torch.Server.exe" "%1.Server.exe" -force
powershell move "Torch.Server.exe.config" "%1.Server.exe.config" -force
powershell move "Torch.Server.pdb" "%1.Server.pdb" -force
powershell move "Torch.Server.xml" "%1.Server.xml" -force

exit