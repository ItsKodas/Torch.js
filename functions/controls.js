const SystemConfig = require('../local/system.json')
const Permissions = require('./permissions')
const Discord = require('./discord')

const { spawn } = require('child_process')

const fs = require('fs')
const Gamedig = require('gamedig');

var Attached = {}

module.exports = {

    Start: async function (id, user) {
        if (!Permissions.Check(user, 'server.control')) return false
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())
        if (user !== 'system') config.online = true
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })

        var Command = spawn(`tasklist`)
        var Tasklist = ''
        Command.stdout.on('data', (data) => {
            Tasklist += data.toString()
        })

        Command.on('close', () => {
            if (Tasklist.includes(`${id}.Server.exe`)) return

            Attached[id] = spawn(`${SystemConfig.system.directory}\\${id}\\${id}.Server.exe`, [], { detached: true }), Discord.Notification(`⏳ ${id} Starting...`, '#4273fc')
            Attached[id].stdout.on('data', (data) => {
                data = data.toString()
                console.log(data)

                if (data.includes('Game ready')) {
                    Discord.Notification(`✅ ${id} is Ready to Join!`, '#33d438')
                }

                if (data.includes('Server stopped.')) {
                    Attached[id].kill() || spawn(`powershell`, ['Stop-Process', `-Name ${id}.Server`])
                    delete Attached[id]
                    Discord.Notification(`⛔ ${id} Stopped`, '#d43333')
                }
            })
        })
    },

    Stop: async function (id, user, force) {
        if (!Permissions.Check(user, 'server.control')) return false
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())
        if (user !== 'system') config.online = false
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })

        if (!Attached[id] || force) return spawn(`powershell`, ['Stop-Process', `-Name ${id}.Server`]), console.log(`Killed ${id}`), Discord.Notification(`☠️ ${id}'s Process was Forcefully Killed`, '#400505')
        Gamedig.query({ type: 'spaceengineers', host: '127.0.0.1', port: config.port })
            .then(async (data) => {
                this.Rcon('Sol', user, '!stop true 0'), console.log(`Stop Command issued to ${id}`), Discord.Notification(`⏳ Stop Request Issued to ${id}`, '#e06f28')
            }).catch(() => {
                spawn(`powershell`, ['Stop-Process', `-Name ${id}.Server`]), console.log(`Killed ${id}`), Discord.Notification(`☠️ ${id}'s Process was Forcefully Killed`, '#400505')
            });
    },

    Check: async function (id) {
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())

        var Command = spawn(`tasklist`)
        var Tasklist = ''
        Command.stdout.on('data', (data) => {
            Tasklist += data.toString()
        })

        Command.on('close', async () => {
            if (config.online) {
                if (!Tasklist.includes(`${id}.Server.exe`)) return this.Start(id, 'system'), console.log('Starting Server from Tasklist...')
                var query = await Gamedig.query({ type: 'spaceengineers', host: '127.0.0.1', port: config.port }).then(async (data) => true).catch(() => false)
                if (!query) this.Start(id, 'system'), console.log('Starting Server from Query...')
                if (!Attached[id]) return this.Stop(id, 'system'), console.log(`Restarting ${id} as it has been detached from the controller...`), Discord.Notification(`⚠️ Rebooting ${id} as it has been detached from the controller`, '#e3d23d')
            }

            if (!config.online) {
                if (Tasklist.includes(`${id}.Server.exe`)) return this.Stop(id, 'system'), console.log('Stopping Server from Tasklist...')
                var query = await Gamedig.query({ type: 'spaceengineers', host: '127.0.0.1', port: config.port }).then(async (data) => true).catch(() => false)
                if (query) this.Stop(id, 'system'), console.log('Stopping Server from Query...')
            }
        })
    },

    Rcon: async function (id, user, command) {
        if (!Permissions.Check(user, 'server.rcon')) return false

        try {
            var { Rcon } = require("rcon-client")
            const rcon = await Rcon.connect({
                host: "127.0.0.1", port: 27018, password: 'torchJSisCool'
            })
            var response = await rcon.send(command)
            rcon.on('error', (err) => console.log(err))

            return response, rcon.end()
        } catch (e) {
            return console.log(e)
        }
    }

}