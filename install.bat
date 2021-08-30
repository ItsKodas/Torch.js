@echo off
powershell npm i fs express discord.js node-fetch ejs public-ip
node server.js install
timeout 3
start start.bat