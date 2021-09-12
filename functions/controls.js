const SystemConfig = require('../local/system.json')
const Permissions = require('./permissions')

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
        config.online = true
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })

        Attached[id] = spawn(`${SystemConfig.system.directory}\\${id}\\${id}.Server.exe`, [], { detached: true })
        Attached[id].stdout.on('data', (data) => {
            data = data.toString()
            console.log(data)
            if (data.includes('Server stopped.')) Attached[id].kill() || spawn(`Taskkill /IM ${id}.Server.exe /F`, [])
        })
    },

    Stop: async function (id, user) {
        if (!Permissions.Check(user, 'server.control')) return false
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())
        config.online = true
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })



        Gamedig.query({ type: 'spaceengineers', host: '127.0.0.1', port: config.port })
            .then(async (data) => {
                this.Rcon('Sol', user, '!stop true 0')
            }).catch(() => {
                console.log("Server is offline");
            });
    },

    Check: async function (id) {
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        var Tasklist = spawn(`tasklist`).stdout.on('data', (data) => data.toString())

        if (config.online) {
            if (!Tasklist.includes(`${id}.Server.exe`)) return this.Check(id, 'system')

            var query = Gamedig.query({ type: 'spaceengineers', host: '127.0.0.1', port: config.port }).then(async (data) => true).catch(() => false)
            if (query) return true
        }

        if (Tasklist.includes(`${id}.Server.exe`) && config.online) return 'Server is Running'
        if (!Tasklist.includes(`${id}.Server.exe`) && !config.online) return 'Server is Offline'

        if (Tasklist.includes(`${id}.Server.exe`) && config.online) return true
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