@echo off
powershell npm i fs express discord.js node-fetch ejs public-ip multer cookie-parser socket.io http ncp rcon-client
node server.js install
start start.bat
exit